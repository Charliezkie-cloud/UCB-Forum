using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UCB_Forum.Server.Dtos.Posts;
using UCB_Forum.Server.Models;
using UCB_Forum.Server.Services;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly PostService _postService;

    public PostsController(PostService postService)
    {
        _postService = postService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PagedPostsResponse>> GetPosts(
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

        var (result, error) = await _postService.GetPostsAsync(
            categoryId,
            parentPostId,
            page,
            pageSize,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            return NotFound(new { message = error });
        }

        return Ok(result);
    }

    [HttpGet("latest")]
    [Authorize]
    public async Task<ActionResult<PagedPostsResponse>> GetLatestPosts(
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

        var result = await _postService.GetLatestPostsAsync(
            page,
            pageSize,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{postId:int}")]
    [Authorize]
    public async Task<ActionResult<PostResponse>> GetPostById(
        [FromRoute] int postId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var post = await _postService.GetPostByIdAsync(
            postId,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (post is null)
        {
            return NotFound(new { message = "Post not found." });
        }

        return Ok(post);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PostResponse>> CreatePost(
        [FromBody] CreatePostRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _postService.CreatePostAsync(
            request,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            if (error == "Category not found." || error == "Parent post not found.")
            {
                return NotFound(new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return CreatedAtAction(
            nameof(GetPostById),
            new { postId = response!.PostId },
            response);
    }

    [HttpPut("{postId:int}")]
    [Authorize]
    public async Task<ActionResult<PostResponse>> UpdatePost(
        [FromRoute] int postId,
        [FromBody] UpdatePostRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _postService.UpdatePostAsync(
            postId,
            request,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            if (error == "Post not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "You are not authorized to modify this post.")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return Ok(response);
    }

    [HttpDelete("{postId:int}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(
        [FromRoute] int postId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (success, error) = await _postService.DeletePostAsync(
            postId,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (!success)
        {
            if (error == "Post not found.")
            {
                return NotFound(new { message = error });
            }
            if (error == "You are not authorized to delete this post.")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = error });
            }
            return BadRequest(new { message = error });
        }

        return NoContent();
    }

    [HttpPost("{postId:int}/like")]
    [Authorize]
    public async Task<ActionResult<LikePostResponse>> LikePost(
        [FromRoute] int postId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _postService.LikePostAsync(
            postId,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            return NotFound(new { message = error });
        }

        return Ok(response);
    }

    [HttpDelete("{postId:int}/like")]
    [Authorize]
    public async Task<ActionResult<LikePostResponse>> UnlikePost(
        [FromRoute] int postId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerUserId) || !TryGetRoleCode(out var callerRoleCode))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var (response, error) = await _postService.UnlikePostAsync(
            postId,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        if (error is not null)
        {
            return NotFound(new { message = error });
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
