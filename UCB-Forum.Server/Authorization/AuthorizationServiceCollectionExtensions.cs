using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using UCB_Forum.Server.Authorization.Handlers;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Authorization;

public static class AuthorizationServiceCollectionExtensions
{
    public static IServiceCollection AddForumAuthorization(this IServiceCollection services)
    {
        services.AddScoped<IAuthorizationHandler, CategoryViewAuthorizationHandler>();
        services.AddScoped<IAuthorizationHandler, CategoryPostingAuthorizationHandler>();

        services.AddAuthorization(options =>
        {
            options.AddPolicy(ForumPolicies.RequireAdmin, policy =>
                policy.RequireAssertion(ctx => GetRoleCode(ctx.User) == (int)UserRole.Admin));

            options.AddPolicy(ForumPolicies.RequireModeratorOrAdmin, policy =>
                policy.RequireAssertion(ctx =>
                {
                    var roleCode = GetRoleCode(ctx.User);
                    return roleCode == (int)UserRole.Moderator || roleCode == (int)UserRole.Admin;
                }));
        });

        return services;
    }

    private static int GetRoleCode(ClaimsPrincipal user)
    {
        var roleValue = user.FindFirstValue("userRoleCode")
            ?? user.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        _ = int.TryParse(roleValue, out var roleCode);
        return roleCode;
    }
}
