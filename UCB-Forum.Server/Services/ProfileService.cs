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
        CancellationToken cancellationToken = default)
    {
        var profile = await _db.Profiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile is null)
        {
            return (null, "Profile not found.");
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

        // Program and YearLevel can only be edited by the user if they are a verified student
        var isModifyingProgramOrYear = (request.Program != profile.Program) || (request.YearLevel != profile.YearLevel);
        if (isModifyingProgramOrYear && !profile.IsVerifiedStudent)
        {
            return (null, "Only verified students can update Program and Year Level.");
        }

        profile.Username = newUsername;
        profile.Bio = request.Bio?.Trim();
        profile.AvatarUrl = request.AvatarUrl?.Trim();
        profile.Facebook = request.Facebook?.Trim();
        profile.Instagram = request.Instagram?.Trim();
        profile.Twitter = request.Twitter?.Trim();
        profile.Tiktok = request.Tiktok?.Trim();

        if (profile.IsVerifiedStudent)
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

    private static ProfileResponse MapToResponse(Profile profile)
    {
        return new ProfileResponse
        {
            ProfileId = profile.ProfileId,
            UserId = profile.UserId,
            Email = profile.User?.Email ?? string.Empty,
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
