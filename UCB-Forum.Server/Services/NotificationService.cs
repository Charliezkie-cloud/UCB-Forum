using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Notifications;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class NotificationService
{
    private readonly AppDbContext _db;
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 50;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Notification> CreateNotificationAsync(
        int userId,
        NotificationType type,
        string message,
        int? relatedPostId = null,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            RelatedPostId = relatedPostId,
            CreatedAt = DateTime.UtcNow,
            Type = (byte)type,
            Message = message,
            IsRead = false
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(cancellationToken);

        return notification;
    }

    public async Task<PagedNotificationsResponse> GetUserNotificationsAsync(
        int userId,
        bool? unreadOnly = null,
        int page = 1,
        int pageSize = DefaultPageSize,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);
        page = Math.Max(1, page);

        IQueryable<Notification> query = _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        if (unreadOnly == true)
        {
            query = query.Where(n => !n.IsRead);
        }

        var unreadCount = await _db.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationResponse
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                RelatedPostId = n.RelatedPostId,
                CreatedAt = n.CreatedAt,
                Type = n.Type,
                Message = n.Message,
                IsRead = n.IsRead
            })
            .ToListAsync(cancellationToken);

        return new PagedNotificationsResponse
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            UnreadCount = unreadCount
        };
    }

    public async Task<(bool Success, string? Error)> MarkAsReadAsync(
        int notificationId,
        int userId,
        CancellationToken cancellationToken = default)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId, cancellationToken);

        if (notification is null)
        {
            return (false, "Notification not found.");
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _db.SaveChangesAsync(cancellationToken);
        }

        return (true, null);
    }

    public async Task<int> MarkAllAsReadAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var unreadNotifications = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        if (unreadNotifications.Count == 0)
        {
            return 0;
        }

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return unreadNotifications.Count;
    }
}
