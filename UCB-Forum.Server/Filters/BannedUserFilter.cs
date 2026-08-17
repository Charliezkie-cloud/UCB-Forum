using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using UCB_Forum.Server.Models;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Filters;

/// <summary>
/// Blocks ALL requests (read and write) from users who have an active ban.
/// Moderators and Admins are exempt and are never blocked by this filter.
/// Apply with [ServiceFilter(typeof(BannedUserFilter))] at the controller level.
/// </summary>
public class BannedUserFilter : IAsyncActionFilter
{
    private readonly BanCheckService _banCheckService;

    public BannedUserFilter(BanCheckService banCheckService)
    {
        _banCheckService = banCheckService;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;

        if (!user.Identity?.IsAuthenticated ?? true)
        {
            await next();
            return;
        }

        var roleValue = user.FindFirstValue("userRoleCode")
            ?? user.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        _ = int.TryParse(roleValue, out var roleCode);

        // Moderators and Admins are never blocked by a ban
        if (roleCode == (int)UserRole.Moderator || roleCode == (int)UserRole.Admin)
        {
            await next();
            return;
        }

        var userIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue(ClaimTypes.Name)
            ?? user.FindFirstValue("sub");

        if (!int.TryParse(userIdValue, out var userId))
        {
            await next();
            return;
        }

        // Allow users to check their own ban status
        if (context.ActionDescriptor.RouteValues.TryGetValue("action", out var actionName) &&
            string.Equals(actionName, "GetUserBanStatus", StringComparison.OrdinalIgnoreCase))
        {
            await next();
            return;
        }

        var isBanned = await _banCheckService.IsUserBannedAsync(
            userId,
            context.HttpContext.RequestAborted);

        if (isBanned)
        {
            context.Result = new ObjectResult(new
            {
                message = "Your account has been banned. You cannot perform this action."
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };

            return;
        }

        await next();
    }
}
