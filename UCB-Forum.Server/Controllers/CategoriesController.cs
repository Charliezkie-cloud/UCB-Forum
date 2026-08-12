using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UCB_Forum.Server.Dtos.Categories;
using UCB_Forum.Server.Models;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoriesController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> GetCategories(
        [FromQuery] int? parentCategoryId,
        CancellationToken cancellationToken)
    {
        if (!TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var categories = await _categoryService.GetCategoriesAsync(
            callerRoleCode,
            parentCategoryId,
            cancellationToken);

        return Ok(categories);
    }

    [HttpGet("{categoryId:int}")]
    [Authorize]
    public async Task<ActionResult<CategoryResponse>> GetCategoryById(
        [FromRoute] int categoryId,
        CancellationToken cancellationToken)
    {
        if (!TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var category = await _categoryService.GetCategoryByIdAsync(
            categoryId,
            callerRoleCode,
            cancellationToken);

        if (category is null)
        {
            return NotFound(new { message = "Category not found." });
        }

        return Ok(category);
    }

    [HttpGet("slug/{slug}")]
    [Authorize]
    public async Task<ActionResult<CategoryResponse>> GetCategoryBySlug(
        [FromRoute] string slug,
        CancellationToken cancellationToken)
    {
        if (!TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var category = await _categoryService.GetCategoryBySlugAsync(
            slug,
            callerRoleCode,
            cancellationToken);

        if (category is null)
        {
            return NotFound(new { message = "Category not found." });
        }

        return Ok(category);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CategoryResponse>> CreateCategory(
        [FromBody] CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsModeratorOrAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Moderator or Admin permissions required." });
        }

        var (response, error) = await _categoryService.CreateCategoryAsync(request, cancellationToken);

        if (error is not null)
        {
            if (error == "A category with this slug already exists.")
            {
                return Conflict(new { message = error });
            }
            if (error == "Parent category not found.")
            {
                return NotFound(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return CreatedAtAction(
            nameof(GetCategoryById),
            new { categoryId = response!.CategoryId },
            response);
    }

    [HttpPut("{categoryId:int}")]
    [Authorize]
    public async Task<ActionResult<CategoryResponse>> UpdateCategory(
        [FromRoute] int categoryId,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsModeratorOrAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Moderator or Admin permissions required." });
        }

        var (response, error) = await _categoryService.UpdateCategoryAsync(categoryId, request, cancellationToken);

        if (error is not null)
        {
            if (error == "Category not found." || error == "Parent category not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "A category with this slug already exists.")
            {
                return Conflict(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpPatch("{categoryId:int}/posting-allowed")]
    [Authorize]
    public async Task<ActionResult<CategoryResponse>> UpdatePostingAllowed(
        [FromRoute] int categoryId,
        [FromBody] UpdateCategoryPostingAllowedRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsModeratorOrAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Moderator or Admin permissions required." });
        }

        var (response, error) = await _categoryService.UpdatePostingAllowedAsync(
            categoryId,
            request.IsPostingAllowed,
            cancellationToken);

        if (error is not null)
        {
            if (error == "Category not found.")
            {
                return NotFound(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpDelete("{categoryId:int}")]
    [Authorize]
    public async Task<IActionResult> DeactivateCategory(
        [FromRoute] int categoryId,
        CancellationToken cancellationToken)
    {
        if (!IsModeratorOrAdmin())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Moderator or Admin permissions required." });
        }

        var (success, error) = await _categoryService.DeactivateCategoryAsync(categoryId, cancellationToken);

        if (!success)
        {
            if (error == "Category not found.")
            {
                return NotFound(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return NoContent();
    }

    private bool TryGetRoleCode(out int roleCode)
    {
        var roleValue = User.FindFirstValue("userRoleCode")
            ?? User.FindFirstValue(ClaimTypes.Role)
            ?? "0";

        return int.TryParse(roleValue, out roleCode);
    }

    private bool IsModeratorOrAdmin()
    {
        if (!TryGetRoleCode(out var userRoleCode))
        {
            return false;
        }

        return userRoleCode == (int)UserRole.Moderator || userRoleCode == (int)UserRole.Admin;
    }
}
