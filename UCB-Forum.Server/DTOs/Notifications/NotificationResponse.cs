namespace UCB_Forum.Server.Dtos.Notifications;

public class NotificationResponse
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public int? RelatedPostId { get; set; }
    public DateTime CreatedAt { get; set; }
    public byte Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
}

public class PagedNotificationsResponse
{
    public IReadOnlyList<NotificationResponse> Items { get; set; } = Array.Empty<NotificationResponse>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int UnreadCount { get; set; }
}
