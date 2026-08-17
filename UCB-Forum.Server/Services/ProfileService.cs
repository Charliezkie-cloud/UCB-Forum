using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Profiles;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class ProfileService
{
    private readonly AppDbContext _db;

    public ProfileService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ProfileResponse?> GetProfileByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var profile = await _db.Profiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        return profile is null ? null : MapToResponse(profile);
    }

    public async Task<ProfileResponse?> GetProfileByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var profile = await _db.Profiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Username == username, cancellationToken);

        return profile is null ? null : MapToResponse(profile);
    }

    public async Task<(ProfileResponse? Response, string? Error)> UpdateProfileAsync(
        int userId,
        UpdateProfileRequest request,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var profile = await _db.Profiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile is null)
        {
            return (null, "Profile not found.");
        }

        var isModOrAdmin = callerRoleCode == (int)UserRole.Moderator || callerRoleCode == (int)UserRole.Admin;

        // Only the profile owner or a Moderator/Admin may apply updates
        if (callerUserId != userId && !isModOrAdmin)
        {
            return (null, "You are not authorized to update this profile.");
        }

        var newUsername = request.Username.Trim();

        // Check if username changed and is unique
        if (!string.Equals(profile.Username, newUsername, StringComparison.OrdinalIgnoreCase))
        {
            var usernameExists = await _db.Profiles
                .AnyAsync(p => p.Username == newUsername && p.UserId != userId, cancellationToken);

            if (usernameExists)
            {
                return (null, "This username is already taken.");
            }
        }

        // Program and YearLevel can be edited by: verified students, Moderators, or Admins
        var isModifyingProgramOrYear = (request.Program != profile.Program) || (request.YearLevel != profile.YearLevel);
        if (isModifyingProgramOrYear && !profile.IsVerifiedStudent && !isModOrAdmin)
        {
            return (null, "Only verified students, Moderators, or Admins can update Program and Year Level.");
        }

        profile.Username = newUsername;
        profile.Bio = request.Bio?.Trim();
        profile.AvatarUrl = request.AvatarUrl?.Trim();
        profile.Facebook = request.Facebook?.Trim();
        profile.Instagram = request.Instagram?.Trim();
        profile.Twitter = request.Twitter?.Trim();
        profile.Tiktok = request.Tiktok?.Trim();

        if (profile.IsVerifiedStudent || isModOrAdmin)
        {
            profile.Program = request.Program?.Trim();
            profile.YearLevel = request.YearLevel;
        }

        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return (MapToResponse(profile), null);
    }

    public async Task<(ProfileResponse? Response, string? Error)> AdminUpdateProfileAsync(
        int targetUserId,
        AdminUpdateProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var profile = await _db.Profiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == targetUserId, cancellationToken);

        if (profile is null)
        {
            return (null, "Profile not found.");
        }

        if (request.Username != null)
        {
            var newUsername = request.Username.Trim();
            if (!string.Equals(profile.Username, newUsername, StringComparison.OrdinalIgnoreCase))
            {
                var usernameExists = await _db.Profiles
                    .AnyAsync(p => p.Username == newUsername && p.UserId != targetUserId, cancellationToken);

                if (usernameExists)
                {
                    return (null, "This username is already taken.");
                }
            }
            profile.Username = newUsername;
        }

        if (request.Bio != null) profile.Bio = request.Bio.Trim();
        if (request.AvatarUrl != null) profile.AvatarUrl = request.AvatarUrl.Trim();
        if (request.Facebook != null) profile.Facebook = request.Facebook.Trim();
        if (request.Instagram != null) profile.Instagram = request.Instagram.Trim();
        if (request.Twitter != null) profile.Twitter = request.Twitter.Trim();
        if (request.Tiktok != null) profile.Tiktok = request.Tiktok.Trim();

        if (request.IsVerifiedStudent.HasValue) profile.IsVerifiedStudent = request.IsVerifiedStudent.Value;
        if (request.Program != null) profile.Program = request.Program.Trim();
        if (request.YearLevel.HasValue) profile.YearLevel = request.YearLevel.Value;

        if (request.IsVerifiedTeacher.HasValue) profile.IsVerifiedTeacher = request.IsVerifiedTeacher.Value;
        if (request.Department != null) profile.Department = request.Department.Trim();

        if (request.Reputation.HasValue) profile.Reputation = request.Reputation.Value;

        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return (MapToResponse(profile), null);
    }

    public async Task<string?> ChangePasswordAsync(
        int callerUserId,
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.UserId == callerUserId, cancellationToken);

        if (user is null)
        {
            return "User not found.";
        }

        if (!PasswordHasher.Verify(request.CurrentPassword, user.Password))
        {
            return "Current password is incorrect.";
        }

        if (request.NewPassword != request.ConfirmNewPassword)
        {
            return "New password and confirmation do not match.";
        }

        user.Password = PasswordHasher.Hash(request.NewPassword);

        await _db.SaveChangesAsync(cancellationToken);

        return null;
    }

    public async Task<string?> DeleteAccountAsync(
        int callerUserId,
        DeleteAccountRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.UserId == callerUserId, cancellationToken);

        if (user is null)
        {
            return "User not found.";
        }

        if (!PasswordHasher.Verify(request.CurrentPassword, user.Password))
        {
            return "Current password is incorrect.";
        }

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var reputations = await _db.Reputations
                .Where(r => r.TargetUserId == callerUserId || r.SourceUserId == callerUserId)
                .ToListAsync(cancellationToken);

            if (reputations.Count > 0)
            {
                _db.Reputations.RemoveRange(reputations);
            }

            var userPostIds = await _db.Posts
                .Where(p => p.AuthorId == callerUserId)
                .Select(p => p.PostId)
                .ToListAsync(cancellationToken);

            if (userPostIds.Count > 0)
            {
                var repliesToUserPosts = await _db.Posts
                    .Where(p => p.ParentPostId != null && userPostIds.Contains(p.ParentPostId.Value) && p.AuthorId != callerUserId)
                    .ToListAsync(cancellationToken);

                if (repliesToUserPosts.Count > 0)
                {
                    _db.Posts.RemoveRange(repliesToUserPosts);
                }

                var userPosts = await _db.Posts
                    .Where(p => p.AuthorId == callerUserId)
                    .ToListAsync(cancellationToken);

                _db.Posts.RemoveRange(userPosts);
            }

            var likes = await _db.PostLikes
                .Where(pl => pl.UserId == callerUserId)
                .ToListAsync(cancellationToken);

            if (likes.Count > 0)
            {
                _db.PostLikes.RemoveRange(likes);
            }

            var notifications = await _db.Notifications
                .Where(n => n.UserId == callerUserId)
                .ToListAsync(cancellationToken);

            if (notifications.Count > 0)
            {
                _db.Notifications.RemoveRange(notifications);
            }

            var profile = await _db.Profiles
                .FirstOrDefaultAsync(p => p.UserId == callerUserId, cancellationToken);

            if (profile is not null)
            {
                _db.Profiles.Remove(profile);
            }

            _db.Users.Remove(user);

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return null;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<(UserBanResponse? Response, string? Error)> BanUserAsync(
        int targetUserId,
        BanUserRequest request,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        if (targetUserId == callerUserId)
        {
            return (null, "You cannot ban yourself.");
        }

        var isCallerAdmin = callerRoleCode == (int)UserRole.Admin;
        var isCallerMod = callerRoleCode == (int)UserRole.Moderator;

        if (!isCallerAdmin && !isCallerMod)
        {
            return (null, "You do not have permission to ban users.");
        }

        var targetUser = await _db.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.UserId == targetUserId, cancellationToken);

        if (targetUser is null)
        {
            return (null, "User not found.");
        }

        if (targetUser.UserRoleCode == (int)UserRole.Admin)
        {
            return (null, "Administrators cannot be banned.");
        }

        if (targetUser.UserRoleCode == (int)UserRole.Moderator && !isCallerAdmin)
        {
            return (null, "Only administrators can ban moderators.");
        }

        if (request.ExpiresAt.HasValue && request.ExpiresAt.Value <= DateTime.UtcNow)
        {
            return (null, "Ban expiration date must be in the future.");
        }

        var callerProfile = await _db.Profiles
            .FirstOrDefaultAsync(p => p.UserId == callerUserId, cancellationToken);

        var activeBans = await _db.UserBans
            .Where(b => b.UserId == targetUserId && b.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var existingBan in activeBans)
        {
            existingBan.IsActive = false;
        }

        var now = DateTime.UtcNow;
        var ban = new UserBan
        {
            UserId = targetUserId,
            BannedByUserId = callerUserId,
            CreatedAt = now,
            ExpiresAt = request.ExpiresAt,
            Reason = request.Reason.Trim(),
            IsActive = true
        };

        _db.UserBans.Add(ban);
        await _db.SaveChangesAsync(cancellationToken);

        var response = new UserBanResponse
        {
            BanId = ban.BanId,
            UserId = ban.UserId,
            BannedByUserId = ban.BannedByUserId,
            BannedByUsername = callerProfile?.Username,
            CreatedAt = ban.CreatedAt,
            ExpiresAt = ban.ExpiresAt,
            Reason = ban.Reason,
            IsActive = ban.IsActive
        };

        return (response, null);
    }

    public async Task<(UserBanResponse? Response, string? Error)> GetUserBanStatusAsync(
        int targetUserId,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var targetUser = await _db.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.UserId == targetUserId, cancellationToken);

        if (targetUser is null)
        {
            return (null, "User not found.");
        }

        var isCallerAdmin = callerRoleCode == (int)UserRole.Admin;
        var isCallerMod = callerRoleCode == (int)UserRole.Moderator;
        var isSelf = callerUserId == targetUserId;

        if (!isCallerAdmin && !isCallerMod && !isSelf)
        {
            return (null, "You do not have permission to view ban details.");
        }

        var now = DateTime.UtcNow;
        var activeBan = await _db.UserBans
            .Include(b => b.BannedByUser)
                .ThenInclude(u => u!.Profile)
            .Where(b => b.UserId == targetUserId && b.IsActive && (!b.ExpiresAt.HasValue || b.ExpiresAt.Value > now))
            .OrderByDescending(b => b.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeBan is null)
        {
            return (new UserBanResponse
            {
                BanId = 0,
                UserId = targetUserId,
                BannedByUserId = 0,
                BannedByUsername = null,
                CreatedAt = DateTime.MinValue,
                ExpiresAt = null,
                Reason = string.Empty,
                IsActive = false
            }, null);
        }

        return (new UserBanResponse
        {
            BanId = activeBan.BanId,
            UserId = activeBan.UserId,
            BannedByUserId = activeBan.BannedByUserId,
            BannedByUsername = activeBan.BannedByUser?.Profile?.Username,
            CreatedAt = activeBan.CreatedAt,
            ExpiresAt = activeBan.ExpiresAt,
            Reason = activeBan.Reason,
            IsActive = activeBan.IsActive
        }, null);
    }

    private static ProfileResponse MapToResponse(Profile profile)
    {
        return new ProfileResponse
        {
            ProfileId = profile.ProfileId,
            UserId = profile.UserId,
            UserRoleCode = profile.User?.UserRoleCode ?? (int)UserRole.Guest,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt,
            Username = profile.Username,
            Bio = profile.Bio,
            AvatarUrl = profile.AvatarUrl,
            Facebook = profile.Facebook,
            Instagram = profile.Instagram,
            Twitter = profile.Twitter,
            Tiktok = profile.Tiktok,
            IsVerifiedStudent = profile.IsVerifiedStudent,
            Program = profile.Program,
            YearLevel = profile.YearLevel,
            IsVerifiedTeacher = profile.IsVerifiedTeacher,
            Department = profile.Department,
            Reputation = profile.Reputation
        };
    }
}
