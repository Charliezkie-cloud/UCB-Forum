using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UCB_Forum.Server.Options;

namespace UCB_Forum.Server;

public static class RateLimitingExtensions
{
    public const string AuthPolicyName = "AuthPolicy";

    public static IServiceCollection AddForumRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection(RateLimitingOptions.SectionName);
        services.Configure<RateLimitingOptions>(section);

        var options = section.Get<RateLimitingOptions>() ?? new RateLimitingOptions();

        services.AddRateLimiter(rateLimiterOptions =>
        {
            rateLimiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            rateLimiterOptions.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json";

                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        message = "Too many requests. Please try again later.",
                        retryAfterSeconds = (int)retryAfter.TotalSeconds
                    }, cancellationToken);
                }
                else
                {
                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        message = "Too many requests. Please try again later."
                    }, cancellationToken);
                }
            };

            // Global partitioned rate limiter for API endpoints
            rateLimiterOptions.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var partitionKey = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? httpContext.User.FindFirstValue("sub")
                    ?? httpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "anonymous";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = options.PermitLimit,
                        Window = TimeSpan.FromSeconds(options.WindowInSeconds),
                        QueueLimit = options.QueueLimit
                    });
            });

            // Stricter rate limit policy for sensitive authentication operations
            rateLimiterOptions.AddPolicy(AuthPolicyName, httpContext =>
            {
                var partitionKey = httpContext.Connection.RemoteIpAddress?.ToString()
                    ?? httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? "anonymous";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = options.AuthPermitLimit,
                        Window = TimeSpan.FromSeconds(options.AuthWindowInSeconds),
                        QueueLimit = options.QueueLimit
                    });
            });
        });

        return services;
    }
}
