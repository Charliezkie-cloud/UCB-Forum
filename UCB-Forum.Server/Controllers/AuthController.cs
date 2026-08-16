using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using UCB_Forum.Server.Dtos.Auth;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting(RateLimitingExtensions.AuthPolicyName)]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match." });
        }

        var (response, error) = await _authService.RegisterAsync(request, cancellationToken);

        if (error is not null)
        {
            return Conflict(new { message = error });
        }

        return CreatedAtAction(nameof(Me), response);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var (response, error) = await _authService.LoginAsync(request, cancellationToken);

        if (error is not null)
        {
            return Unauthorized(new { message = error });
        }

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<AuthMeResponse> Me()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new { message = "Invalid token subject." });
        }

        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? string.Empty;

        var roleValue = User.FindFirstValue("userRoleCode")
            ?? User.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        _ = int.TryParse(roleValue, out var userRoleCode);

        return Ok(new AuthMeResponse
        {
            Authenticated = true,
            UserId = userId,
            Email = email,
            UserRoleCode = userRoleCode
        });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult<ForgotPasswordResponse>> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var (response, error) = await _authService.ForgotPasswordAsync(request, cancellationToken);

        if (error is not null)
        {
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var error = await _authService.ResetPasswordAsync(request, cancellationToken);

        if (error is not null)
        {
            return BadRequest(new { message = error });
        }

        return Ok(new { message = "Your password has been reset successfully. You can now log in with your new password." });
    }
}
