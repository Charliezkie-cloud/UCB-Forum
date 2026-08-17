using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UCB_Forum.Server.Dtos.Reputations;
using UCB_Forum.Server.Filters;
using UCB_Forum.Server.Models;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[ServiceFilter(typeof(BannedUserFilter))]
public class ReputationsController : ControllerBase
{
    private readonly ReputationService _reputationService;

    public ReputationsController(ReputationService reputationService)
    {
        _reputationService = reputationService;
    }

    [HttpGet("user/{targetUserId:int}")]
    [Authorize]
    public async Task<ActionResult<ReputationResponse>> GetReputationStatus(
        [FromRoute] int targetUserId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _reputationService.GetReputationStatusAsync(
            targetUserId,
            callerUserId,
            cancellationToken);

        if (error is not null)
        {
            return NotFound(new { message = error });
        }

        return Ok(response);
    }

    [HttpPost("user/{targetUserId:int}")]
    [Authorize]
    public async Task<ActionResult<ReputationResponse>> GiveReputation(
        [FromRoute] int targetUserId,
        [FromBody] GiveReputationRequest? request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var isPositive = request?.IsPositive ?? true;

        var (response, error) = await _reputationService.GiveReputationAsync(
            targetUserId,
            isPositive,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            if (error == "Profile not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "Guests are not allowed to modify reputations.")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = error });
            }
            if (error == "You have already given reputation to this user.")
            {
                return Conflict(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpPost("user/{targetUserId:int}/add")]
    [Authorize]
    public async Task<ActionResult<ReputationResponse>> AddReputation(
        [FromRoute] int targetUserId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _reputationService.GiveReputationAsync(
            targetUserId,
            isPositive: true,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            if (error == "Profile not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "Guests are not allowed to modify reputations.")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = error });
            }
            if (error == "You have already given reputation to this user.")
            {
                return Conflict(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpPost("user/{targetUserId:int}/remove")]
    [Authorize]
    public async Task<ActionResult<ReputationResponse>> DownvoteReputation(
        [FromRoute] int targetUserId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _reputationService.GiveReputationAsync(
            targetUserId,
            isPositive: false,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            if (error == "Profile not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "Guests are not allowed to modify reputations.")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = error });
            }
            if (error == "You have already given reputation to this user.")
            {
                return Conflict(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpDelete("user/{targetUserId:int}")]
    [Authorize]
    public async Task<ActionResult<ReputationResponse>> RemoveReputation(
        [FromRoute] int targetUserId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _reputationService.RemoveReputationAsync(
            targetUserId,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            if (error == "Profile not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "Guests are not allowed to modify reputations.")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = error });
            }
            if (error == "You have not given reputation to this user.")
            {
                return NotFound(new { message = error });
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

    private bool TryGetRoleCode(out int roleCode)
    {
        var roleValue = User.FindFirstValue("userRoleCode")
            ?? User.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        return int.TryParse(roleValue, out roleCode);
    }
}
