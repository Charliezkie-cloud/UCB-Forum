using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Reputations;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class ReputationService
{
    private readonly AppDbContext _db;

    public ReputationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(ReputationResponse? Response, string? Error)> GetReputationStatusAsync(
        int targetUserId,
        int callerUserId,
        CancellationToken cancellationToken = default)
    {
        var targetProfile = await _db.Profiles
            .FirstOrDefaultAsync(p => p.UserId == targetUserId, cancellationToken);

        if (targetProfile is null)
        {
            return (null, "Profile not found.");
        }

        var existingReputation = await _db.Reputations
            .FirstOrDefaultAsync(r => r.SourceUserId == callerUserId && r.TargetUserId == targetUserId, cancellationToken);

        var response = new ReputationResponse
        {
            TargetUserId = targetUserId,
            Reputation = targetProfile.Reputation,
            HasVoted = existingReputation is not null,
            IsPositive = existingReputation?.IsPositive
        };

        return (response, null);
    }

    public async Task<(ReputationResponse? Response, string? Error)> GiveReputationAsync(
        int targetUserId,
        bool isPositive,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        if (callerRoleCode == (int)UserRole.Guest)
        {
            return (null, "Guests are not allowed to modify reputations.");
        }

        if (callerUserId == targetUserId)
        {
            return (null, "You cannot modify your own reputation.");
        }

        var targetProfile = await _db.Profiles
            .FirstOrDefaultAsync(p => p.UserId == targetUserId, cancellationToken);

        if (targetProfile is null)
        {
            return (null, "Profile not found.");
        }

        var existingReputation = await _db.Reputations
            .FirstOrDefaultAsync(r => r.SourceUserId == callerUserId && r.TargetUserId == targetUserId, cancellationToken);

        var now = DateTime.UtcNow;

        if (existingReputation is not null)
        {
            if (existingReputation.IsPositive == isPositive)
            {
                return (null, "You have already given reputation to this user.");
            }

            // Flip reputation (+1 to -1 or vice versa)
            existingReputation.IsPositive = isPositive;
            existingReputation.UpdatedAt = now;

            targetProfile.Reputation += isPositive ? 2 : -2;
            targetProfile.UpdatedAt = now;
        }
        else
        {
            var reputation = new Reputation
            {
                SourceUserId = callerUserId,
                TargetUserId = targetUserId,
                IsPositive = isPositive,
                CreatedAt = now,
                UpdatedAt = now
            };

            await _db.Reputations.AddAsync(reputation, cancellationToken);

            targetProfile.Reputation += isPositive ? 1 : -1;
            targetProfile.UpdatedAt = now;
        }

        var callerProfile = await _db.Profiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == callerUserId, cancellationToken);

        var giverName = callerProfile?.Username;
        var message = isPositive
            ? (!string.IsNullOrWhiteSpace(giverName) ? $"{giverName} gave you positive reputation." : "Someone gave you positive reputation.")
            : (!string.IsNullOrWhiteSpace(giverName) ? $"{giverName} gave you negative reputation." : "Someone gave you negative reputation.");

        _db.Notifications.Add(new Notification
        {
            UserId = targetUserId,
            RelatedPostId = null,
            CreatedAt = now,
            Type = (byte)NotificationType.Reputation,
            Message = message,
            IsRead = false
        });

        await _db.SaveChangesAsync(cancellationToken);

        var response = new ReputationResponse
        {
            TargetUserId = targetUserId,
            Reputation = targetProfile.Reputation,
            HasVoted = true,
            IsPositive = isPositive
        };

        return (response, null);
    }

    public async Task<(ReputationResponse? Response, string? Error)> RemoveReputationAsync(
        int targetUserId,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        if (callerRoleCode == (int)UserRole.Guest)
        {
            return (null, "Guests are not allowed to modify reputations.");
        }

        if (callerUserId == targetUserId)
        {
            return (null, "You cannot modify your own reputation.");
        }

        var targetProfile = await _db.Profiles
            .FirstOrDefaultAsync(p => p.UserId == targetUserId, cancellationToken);

        if (targetProfile is null)
        {
            return (null, "Profile not found.");
        }

        var existingReputation = await _db.Reputations
            .FirstOrDefaultAsync(r => r.SourceUserId == callerUserId && r.TargetUserId == targetUserId, cancellationToken);

        if (existingReputation is null)
        {
            return (null, "You have not given reputation to this user.");
        }

        var now = DateTime.UtcNow;

        targetProfile.Reputation -= existingReputation.IsPositive ? 1 : -1;
        targetProfile.UpdatedAt = now;

        _db.Reputations.Remove(existingReputation);

        await _db.SaveChangesAsync(cancellationToken);

        var response = new ReputationResponse
        {
            TargetUserId = targetUserId,
            Reputation = targetProfile.Reputation,
            HasVoted = false,
            IsPositive = null
        };

        return (response, null);
    }
}
