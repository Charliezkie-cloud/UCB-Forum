using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UCB_Forum.Server.Dtos.Profiles;
using UCB_Forum.Server.Models;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfilesController : ControllerBase
{
    private readonly ProfileService _profileService;

    public ProfilesController(ProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ProfileResponse>> GetMyProfile(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var profile = await _profileService.GetProfileByUserIdAsync(userId, cancellationToken);
        if (profile is null)
        {
            return NotFound(new { message = "Profile not found." });
        }

        return Ok(profile);
    }

    [HttpGet("user/{userId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProfileResponse>> GetProfileByUserId(
        [FromRoute] int userId,
        CancellationToken cancellationToken)
    {
        var profile = await _profileService.GetProfileByUserIdAsync(userId, cancellationToken);
        if (profile is null)
        {
            return NotFound(new { message = "Profile not found." });
        }

        return Ok(profile);
    }

    [HttpGet("username/{username}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProfileResponse>> GetProfileByUsername(
        [FromRoute] string username,
        CancellationToken cancellationToken)
    {
        var profile = await _profileService.GetProfileByUsernameAsync(username, cancellationToken);
        if (profile is null)
        {
            return NotFound(new { message = "Profile not found." });
        }

        return Ok(profile);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<ProfileResponse>> UpdateMyProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _profileService.UpdateProfileAsync(userId, request, cancellationToken);

        if (error is not null)
        {
            if (error == "This username is already taken.")
            {
                return Conflict(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpPut("{userId:int}/admin")]
    [Authorize]
    public async Task<ActionResult<ProfileResponse>> AdminUpdateProfile(
        [FromRoute] int userId,
        [FromBody] AdminUpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Admin permissions required." });
        }

        var (response, error) = await _profileService.AdminUpdateProfileAsync(userId, request, cancellationToken);

        if (error is not null)
        {
            if (error == "Profile not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "This username is already taken.")
            {
                return Conflict(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("sub");

        return int.TryParse(userIdValue, out userId);
    }

    private bool IsAdmin()
    {
        var roleValue = User.FindFirstValue("userRoleCode")
            ?? User.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        return int.TryParse(roleValue, out var userRoleCode) && userRoleCode == (int)UserRole.Admin;
    }
}
