using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Auth;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _jwtTokenService;

    public AuthService(AppDbContext db, JwtTokenService jwtTokenService)
    {
        _db = db;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<(AuthResponse? Response, string? Error)> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var username = request.Username.Trim();

        if (request.Password != request.ConfirmPassword)
        {
            return (null, "Passwords do not match.");
        }

        var emailExists = await _db.Users
            .AnyAsync(u => u.Email == email, cancellationToken);

        if (emailExists)
        {
            return (null, "An account with this email already exists.");
        }

        var usernameExists = await _db.Profiles
            .AnyAsync(p => p.Username == username, cancellationToken);

        if (usernameExists)
        {
            return (null, "This username is already taken.");
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            Email = email,
            Password = PasswordHasher.Hash(request.Password),
            UserRoleCode = (int)UserRole.Guest,
            CreatedAt = now,
            Profile = new Profile
            {
                Username = username,
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        return (CreateAuthResponse(user), null);
    }

    public async Task<(AuthResponse? Response, string? Error)> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null || !PasswordHasher.Verify(request.Password, user.Password))
        {
            return (null, "Invalid email or password.");
        }

        return (CreateAuthResponse(user), null);
    }

    public async Task<(ForgotPasswordResponse? Response, string? Error)> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null)
        {
            return (null, "No account found with this email address.");
        }

        var (resetToken, expiresAt) = _jwtTokenService.CreatePasswordResetToken(user);

        var response = new ForgotPasswordResponse
        {
            ResetToken = resetToken,
            ExpiresAt = expiresAt,
            Message = "Password reset token generated successfully. Use this token to reset your password within 15 minutes."
        };

        return (response, null);
    }

    public async Task<string?> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.ResetToken))
        {
            return "Reset token is required.";
        }

        if (request.NewPassword != request.ConfirmNewPassword)
        {
            return "New password and confirmation do not match.";
        }

        if (request.NewPassword.Length < 8)
        {
            return "Password must be at least 8 characters.";
        }

        var (isValid, userId, error) = _jwtTokenService.ValidatePasswordResetToken(request.ResetToken);
        if (!isValid || userId is null)
        {
            return error ?? "Invalid or expired reset token.";
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.UserId == userId.Value, cancellationToken);

        if (user is null)
        {
            return "User not found.";
        }

        user.Password = PasswordHasher.Hash(request.NewPassword);
        await _db.SaveChangesAsync(cancellationToken);

        return null;
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var (token, expiresAt) = _jwtTokenService.CreateToken(user);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.UserId,
            Email = user.Email,
            UserRoleCode = user.UserRoleCode
        };
    }
}
