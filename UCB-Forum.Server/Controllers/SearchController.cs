using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UCB_Forum.Server.Dtos.Categories;
using UCB_Forum.Server.Dtos.Posts;
using UCB_Forum.Server.Dtos.Profiles;
using UCB_Forum.Server.Dtos.Search;
using UCB_Forum.Server.Filters;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[ServiceFilter(typeof(BannedUserFilter))]
public class SearchController : ControllerBase
{
    private readonly SearchService _searchService;

    public SearchController(SearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<SearchResultsResponse>> Search(
        [FromQuery] string? q,
        [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        if (limit < 1)
        {
            return BadRequest(new { message = "limit must be greater than 0." });
        }

        var results = await _searchService.SearchAllAsync(
            q,
            limit,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        return Ok(results);
    }

    [HttpGet("posts")]
    [Authorize]
    public async Task<ActionResult<PagedPostsResponse>> SearchPosts(
        [FromQuery] string? q,
        [FromQuery] int? categoryId,
        [FromQuery] int? parentPostId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        if (page < 1 || pageSize < 1)
        {
            return BadRequest(new { message = "page and pageSize must be greater than 0." });
        }

        var results = await _searchService.SearchPostsAsync(
            q,
            categoryId,
            parentPostId,
            page,
            pageSize,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        return Ok(results);
    }

    [HttpGet("categories")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> SearchCategories(
        [FromQuery] string? q,
        [FromQuery] int? parentCategoryId,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var categories = await _searchService.SearchCategoriesAsync(
            q,
            parentCategoryId,
            callerRoleCode,
            cancellationToken);

        return Ok(categories);
    }

    [HttpGet("profiles")]
    [Authorize]
    public async Task<ActionResult<PagedProfilesResponse>> SearchProfiles(
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1)
        {
            return BadRequest(new { message = "page and pageSize must be greater than 0." });
        }

        var profiles = await _searchService.SearchProfilesAsync(
            q,
            page,
            pageSize,
            cancellationToken);

        return Ok(profiles);
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
