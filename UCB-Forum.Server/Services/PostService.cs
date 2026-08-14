using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Authorization;
using UCB_Forum.Server.Authorization.Requirements;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Posts;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class PostService
{
    private readonly AppDbContext _db;
    private readonly IAuthorizationService _authorizationService;

    public PostService(AppDbContext db, IAuthorizationService authorizationService)
    {
        _db = db;
        _authorizationService = authorizationService;
    }

    private const int MaxPageSize = 100;

    public async Task<(PagedPostsResponse? Result, string? Error)> GetPostsAsync(
        int? categoryId,
        int? parentPostId,
        int page,
        int pageSize,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var user = CreateUserPrincipal(callerRoleCode);
        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        var canManage = (await _authorizationService.AuthorizeAsync(user, null, ForumPolicies.RequireModeratorOrAdmin)).Succeeded;

        IQueryable<Post> query = _db.Posts
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Author)
                .ThenInclude(u => u.Profile);

        if (categoryId.HasValue)
        {
            var category = await _db.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CategoryId == categoryId.Value, cancellationToken);

            if (category is null || !(await CanAccessCategoryPostsAsync(user, category, isVerified)))
            {
                return (null, "Category not found.");
            }

            query = query.Where(p => p.CategoryId == categoryId.Value && p.ParentPostId == parentPostId);
        }
        else
        {
            // Site-wide feed: top-level posts from categories the caller can access.
            query = query.Where(p => p.ParentPostId == null);

            if (!canManage)
            {
                query = query.Where(p =>
                    p.Category.IsActive &&
                    (!p.Category.IsRestricted || isVerified));
            }
        }

        if (!canManage)
        {
            query = query.Where(p => !p.IsDeleted);
        }

        var orderedQuery = query
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAt);

        var totalCount = await orderedQuery.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)pageSize);

        var posts = await orderedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        if (posts.Count == 0)
        {
            return (new PagedPostsResponse
            {
                Items = Array.Empty<PostResponse>(),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            }, null);
        }

        var postIds = posts.Select(p => p.PostId).ToList();
        var replyCounts = await _db.Posts
            .AsNoTracking()
            .Where(p => p.ParentPostId != null && postIds.Contains(p.ParentPostId.Value) && !p.IsDeleted)
            .GroupBy(p => p.ParentPostId!.Value)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count, cancellationToken);

        var likedPostIds = await _db.PostLikes
            .AsNoTracking()
            .Where(pl => pl.UserId == callerUserId && postIds.Contains(pl.PostId))
            .Select(pl => pl.PostId)
            .ToHashSetAsync(cancellationToken);

        var responses = posts
            .Select(p => MapToResponse(
                p,
                replyCounts.GetValueOrDefault(p.PostId),
                likedPostIds.Contains(p.PostId),
                canManage))
            .ToList();

        return (new PagedPostsResponse
        {
            Items = responses,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        }, null);
    }

    public async Task<PagedPostsResponse> GetLatestPostsAsync(
        int page,
        int pageSize,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var user = CreateUserPrincipal(callerRoleCode);
        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        var canManage = (await _authorizationService.AuthorizeAsync(user, null, ForumPolicies.RequireModeratorOrAdmin)).Succeeded;

        IQueryable<Post> query = _db.Posts
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Author)
                .ThenInclude(u => u.Profile)
            .Where(p => p.ParentPostId == null);

        if (!canManage)
        {
            query = query.Where(p =>
                !p.IsDeleted &&
                p.Category.IsActive &&
                (!p.Category.IsRestricted || isVerified));
        }

        var orderedQuery = query.OrderByDescending(p => p.CreatedAt);

        var totalCount = await orderedQuery.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)pageSize);

        var posts = await orderedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        if (posts.Count == 0)
        {
            return new PagedPostsResponse
            {
                Items = Array.Empty<PostResponse>(),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }

        var postIds = posts.Select(p => p.PostId).ToList();
        var replyCounts = await _db.Posts
            .AsNoTracking()
            .Where(p => p.ParentPostId != null && postIds.Contains(p.ParentPostId.Value) && !p.IsDeleted)
            .GroupBy(p => p.ParentPostId!.Value)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count, cancellationToken);

        var likedPostIds = await _db.PostLikes
            .AsNoTracking()
            .Where(pl => pl.UserId == callerUserId && postIds.Contains(pl.PostId))
            .Select(pl => pl.PostId)
            .ToHashSetAsync(cancellationToken);

        var responses = posts
            .Select(p => MapToResponse(
                p,
                replyCounts.GetValueOrDefault(p.PostId),
                likedPostIds.Contains(p.PostId),
                canManage))
            .ToList();

        return new PagedPostsResponse
        {
            Items = responses,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<PostResponse?> GetPostByIdAsync(
        int postId,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var post = await _db.Posts
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Author)
                .ThenInclude(u => u.Profile)
            .FirstOrDefaultAsync(p => p.PostId == postId, cancellationToken);

        if (post is null)
        {
            return null;
        }

        var user = CreateUserPrincipal(callerRoleCode);
        var canManage = (await _authorizationService.AuthorizeAsync(user, null, ForumPolicies.RequireModeratorOrAdmin)).Succeeded;
        if (post.IsDeleted && !canManage)
        {
            return null;
        }

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!(await CanAccessCategoryPostsAsync(user, post.Category, isVerified)))
        {
            return null;
        }

        var replyCount = await _db.Posts
            .AsNoTracking()
            .CountAsync(p => p.ParentPostId == postId && !p.IsDeleted, cancellationToken);

        var isLiked = await _db.PostLikes
            .AsNoTracking()
            .AnyAsync(pl => pl.PostId == postId && pl.UserId == callerUserId, cancellationToken);

        return MapToResponse(post, replyCount, isLiked, canManage);
    }

    public async Task<(PostResponse? Response, string? Error)> CreatePostAsync(
        CreatePostRequest request,
        int authorId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CategoryId == request.CategoryId, cancellationToken);

        if (category is null)
        {
            return (null, "Category not found.");
        }

        var user = CreateUserPrincipal(callerRoleCode);
        var isVerified = await IsCallerVerifiedAsync(authorId, cancellationToken);
        if (!(await CanAccessCategoryPostsAsync(user, category, isVerified)))
        {
            return (null, "Category not found.");
        }

        if (!(await CanMutatePostsInCategoryAsync(user, category)))
        {
            return (null, "Posting is not allowed in this category.");
        }

        var content = request.Content.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            return (null, "Content is required.");
        }

        Post? parentPost = null;
        if (request.ParentPostId.HasValue)
        {
            parentPost = await _db.Posts
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PostId == request.ParentPostId.Value, cancellationToken);

            if (parentPost is null || parentPost.IsDeleted)
            {
                return (null, "Parent post not found.");
            }

            if (parentPost.CategoryId != request.CategoryId)
            {
                return (null, "Replies must belong to the same category as the parent post.");
            }

            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                return (null, "Replies cannot have a title.");
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return (null, "Title is required for top-level posts.");
            }

            if (request.Title.Trim().Length > 255)
            {
                return (null, "Title must be 255 characters or fewer.");
            }
        }

        var now = DateTime.UtcNow;
        var post = new Post
        {
            CategoryId = request.CategoryId,
            ParentPostId = request.ParentPostId,
            AuthorId = authorId,
            CreatedAt = now,
            UpdatedAt = now,
            Title = request.ParentPostId.HasValue ? null : request.Title!.Trim(),
            Content = content,
            IsPinned = false,
            IsDeleted = false,
            LikesCount = 0
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync(cancellationToken);

        var author = await _db.Users
            .AsNoTracking()
            .Include(u => u.Profile)
            .FirstAsync(u => u.UserId == authorId, cancellationToken);

        post.Author = author;
        post.Category = category;

        if (parentPost is not null && parentPost.AuthorId != authorId)
        {
            var replierName = author.Profile?.Username;
            var message = !string.IsNullOrWhiteSpace(replierName)
                ? $"{replierName} replied to your post."
                : "Someone replied to your post.";

            _db.Notifications.Add(new Notification
            {
                UserId = parentPost.AuthorId,
                RelatedPostId = post.PostId,
                CreatedAt = now,
                Type = (byte)NotificationType.Reply,
                Message = message,
                IsRead = false
            });

            await _db.SaveChangesAsync(cancellationToken);
        }

        return (MapToResponse(post, replyCount: 0, isLikedByCaller: false, includeDeletedFlag: false), null);
    }

    public async Task<(PostResponse? Response, string? Error)> UpdatePostAsync(
        int postId,
        UpdatePostRequest request,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var post = await _db.Posts
            .Include(p => p.Category)
            .Include(p => p.Author)
                .ThenInclude(u => u.Profile)
            .FirstOrDefaultAsync(p => p.PostId == postId, cancellationToken);

        if (post is null || post.IsDeleted)
        {
            return (null, "Post not found.");
        }

        if (post.AuthorId != callerUserId)
        {
            return (null, "You are not authorized to modify this post.");
        }

        var user = CreateUserPrincipal(callerRoleCode);
        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!(await CanAccessCategoryPostsAsync(user, post.Category, isVerified)))
        {
            return (null, "Post not found.");
        }

        if (!(await CanMutatePostsInCategoryAsync(user, post.Category)))
        {
            return (null, "Posting is not allowed in this category.");
        }

        var content = request.Content.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            return (null, "Content is required.");
        }

        post.Content = content;

        if (post.ParentPostId is null && request.Title is not null)
        {
            var title = request.Title.Trim();
            if (string.IsNullOrWhiteSpace(title))
            {
                return (null, "Title is required for top-level posts.");
            }

            if (title.Length > 255)
            {
                return (null, "Title must be 255 characters or fewer.");
            }

            post.Title = title;
        }

        post.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        var replyCount = await _db.Posts
            .AsNoTracking()
            .CountAsync(p => p.ParentPostId == postId && !p.IsDeleted, cancellationToken);

        var isLiked = await _db.PostLikes
            .AsNoTracking()
            .AnyAsync(pl => pl.PostId == postId && pl.UserId == callerUserId, cancellationToken);

        return (MapToResponse(post, replyCount, isLiked, includeDeletedFlag: false), null);
    }

    public async Task<(bool Success, string? Error)> DeletePostAsync(
        int postId,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var post = await _db.Posts
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.PostId == postId, cancellationToken);

        if (post is null || post.IsDeleted)
        {
            return (false, "Post not found.");
        }

        var user = CreateUserPrincipal(callerRoleCode);
        var canManage = (await _authorizationService.AuthorizeAsync(user, null, ForumPolicies.RequireModeratorOrAdmin)).Succeeded;
        if (post.AuthorId != callerUserId && !canManage)
        {
            return (false, "You are not authorized to delete this post.");
        }

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!(await CanAccessCategoryPostsAsync(user, post.Category, isVerified)))
        {
            return (false, "Post not found.");
        }

        if (!(await CanMutatePostsInCategoryAsync(user, post.Category)))
        {
            return (false, "Posting is not allowed in this category.");
        }

        post.IsDeleted = true;
        post.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return (true, null);
    }

    public async Task<(LikePostResponse? Response, string? Error)> LikePostAsync(
        int postId,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var post = await _db.Posts
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.PostId == postId, cancellationToken);

        if (post is null || post.IsDeleted)
        {
            return (null, "Post not found.");
        }

        var user = CreateUserPrincipal(callerRoleCode);
        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!(await CanAccessCategoryPostsAsync(user, post.Category, isVerified)))
        {
            return (null, "Post not found.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var alreadyLiked = await _db.PostLikes
                .AnyAsync(pl => pl.PostId == postId && pl.UserId == callerUserId, cancellationToken);

            if (!alreadyLiked)
            {
                _db.PostLikes.Add(new PostLike
                {
                    PostId = postId,
                    UserId = callerUserId,
                    CreatedAt = DateTime.UtcNow
                });

                post.LikesCount++;

                if (post.AuthorId != callerUserId)
                {
                    var callerProfile = await _db.Profiles
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.UserId == callerUserId, cancellationToken);

                    var likerName = callerProfile?.Username;
                    var message = !string.IsNullOrWhiteSpace(likerName)
                        ? $"{likerName} liked your post."
                        : "Someone liked your post.";

                    _db.Notifications.Add(new Notification
                    {
                        UserId = post.AuthorId,
                        RelatedPostId = postId,
                        CreatedAt = DateTime.UtcNow,
                        Type = (byte)NotificationType.Like,
                        Message = message,
                        IsRead = false
                    });
                }

                await _db.SaveChangesAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);

            return (new LikePostResponse
            {
                PostId = postId,
                LikesCount = post.LikesCount,
                IsLikedByCaller = true
            }, null);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<(LikePostResponse? Response, string? Error)> UnlikePostAsync(
        int postId,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var post = await _db.Posts
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.PostId == postId, cancellationToken);

        if (post is null || post.IsDeleted)
        {
            return (null, "Post not found.");
        }

        var user = CreateUserPrincipal(callerRoleCode);
        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!(await CanAccessCategoryPostsAsync(user, post.Category, isVerified)))
        {
            return (null, "Post not found.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var existingLike = await _db.PostLikes
                .FirstOrDefaultAsync(pl => pl.PostId == postId && pl.UserId == callerUserId, cancellationToken);

            if (existingLike is not null)
            {
                _db.PostLikes.Remove(existingLike);
                post.LikesCount = Math.Max(0, post.LikesCount - 1);
                await _db.SaveChangesAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);

            return (new LikePostResponse
            {
                PostId = postId,
                LikesCount = post.LikesCount,
                IsLikedByCaller = false
            }, null);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task<bool> IsCallerVerifiedAsync(int userId, CancellationToken cancellationToken)
    {
        var profile = await _db.Profiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        return profile is not null && (profile.IsVerifiedStudent || profile.IsVerifiedTeacher);
    }

    private async Task<bool> CanAccessCategoryPostsAsync(ClaimsPrincipal user, Category category, bool isVerified)
    {
        var result = await _authorizationService.AuthorizeAsync(user, category, new ViewCategoryRequirement(isVerified));
        return result.Succeeded;
    }

    private async Task<bool> CanMutatePostsInCategoryAsync(ClaimsPrincipal user, Category category)
    {
        var result = await _authorizationService.AuthorizeAsync(user, category, new PostCategoryRequirement());
        return result.Succeeded;
    }

    private static ClaimsPrincipal CreateUserPrincipal(int callerRoleCode)
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim("userRoleCode", callerRoleCode.ToString()),
            new Claim(ClaimTypes.Role, callerRoleCode.ToString())
        }, "Jwt");

        return new ClaimsPrincipal(identity);
    }

    private static PostResponse MapToResponse(
        Post post,
        int replyCount,
        bool isLikedByCaller,
        bool includeDeletedFlag)
    {
        return new PostResponse
        {
            PostId = post.PostId,
            CategoryId = post.CategoryId,
            CategoryName = post.Category?.Name ?? string.Empty,
            CategorySlug = post.Category?.Slug ?? string.Empty,
            ParentPostId = post.ParentPostId,
            AuthorId = post.AuthorId,
            AuthorUsername = post.Author?.Profile?.Username ?? string.Empty,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            Title = post.Title,
            Content = post.Content,
            IsPinned = post.IsPinned,
            LikesCount = post.LikesCount,
            ReplyCount = replyCount,
            IsLikedByCaller = isLikedByCaller,
            IsDeleted = includeDeletedFlag && post.IsDeleted
        };
    }
}
