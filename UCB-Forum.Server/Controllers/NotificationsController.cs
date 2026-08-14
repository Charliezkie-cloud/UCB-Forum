using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UCB_Forum.Server.Dtos.Notifications;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PagedNotificationsResponse>> GetNotifications(
        [FromQuery] bool? unreadOnly,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var result = await _notificationService.GetUserNotificationsAsync(
            callerUserId,
            unreadOnly,
            page,
            pageSize,
            cancellationToken);

        return Ok(result);
    }

    [HttpPatch("{notificationId:int}/read")]
    [Authorize]
    public async Task<IActionResult> MarkAsRead(
        [FromRoute] int notificationId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (success, error) = await _notificationService.MarkAsReadAsync(
            notificationId,
            callerUserId,
            cancellationToken);

        if (!success)
        {
            return NotFound(new { message = error });
        }

        return NoContent();
    }

    [HttpPatch("read-all")]
    [Authorize]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var updatedCount = await _notificationService.MarkAllAsReadAsync(
            callerUserId,
            cancellationToken);

        return Ok(new { updatedCount });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("sub");

        return int.TryParse(userIdValue, out userId);
    }
}
