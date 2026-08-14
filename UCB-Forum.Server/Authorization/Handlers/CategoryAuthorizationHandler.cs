using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using UCB_Forum.Server.Authorization.Requirements;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Authorization.Handlers;

public class CategoryViewAuthorizationHandler : AuthorizationHandler<ViewCategoryRequirement, Category>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ViewCategoryRequirement requirement,
        Category resource)
    {
        var roleCode = GetRoleCode(context.User);
        var isModOrAdmin = IsModeratorOrAdmin(roleCode);
        var canViewRestricted = roleCode >= (int)UserRole.Student || requirement.IsVerified;

        if (!resource.IsActive && !isModOrAdmin)
        {
            return Task.CompletedTask;
        }

        if (resource.IsRestricted && !canViewRestricted && !isModOrAdmin)
        {
            return Task.CompletedTask;
        }

        context.Succeed(requirement);
        return Task.CompletedTask;
    }

    private static int GetRoleCode(ClaimsPrincipal user)
    {
        var roleValue = user.FindFirstValue("userRoleCode")
            ?? user.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        _ = int.TryParse(roleValue, out var roleCode);
        return roleCode;
    }

    private static bool IsModeratorOrAdmin(int roleCode)
    {
        return roleCode == (int)UserRole.Moderator || roleCode == (int)UserRole.Admin;
    }
}

public class CategoryPostingAuthorizationHandler : AuthorizationHandler<PostCategoryRequirement, Category>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PostCategoryRequirement requirement,
        Category resource)
    {
        var roleCode = GetRoleCode(context.User);
        var isModOrAdmin = IsModeratorOrAdmin(roleCode);

        if (resource.IsPostingAllowed || isModOrAdmin)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }

    private static int GetRoleCode(ClaimsPrincipal user)
    {
        var roleValue = user.FindFirstValue("userRoleCode")
            ?? user.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        _ = int.TryParse(roleValue, out var roleCode);
        return roleCode;
    }

    private static bool IsModeratorOrAdmin(int roleCode)
    {
        return roleCode == (int)UserRole.Moderator || roleCode == (int)UserRole.Admin;
    }
}
