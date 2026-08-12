using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Posts;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class PostService
{
    private readonly AppDbContext _db;

    public PostService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(IReadOnlyList<PostResponse>? Posts, string? Error)> GetPostsAsync(
        int categoryId,
        int? parentPostId,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId, cancellationToken);

        if (category is null)
        {
            return (null, "Category not found.");
        }

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!CanAccessCategoryPosts(category, callerRoleCode, isVerified))
        {
            return (null, "Category not found.");
        }

        var canManage = IsModeratorOrAdmin(callerRoleCode);
        var query = _db.Posts
            .AsNoTracking()
            .Include(p => p.Author)
                .ThenInclude(u => u.Profile)
            .Where(p => p.CategoryId == categoryId && p.ParentPostId == parentPostId);

        if (!canManage)
        {
            query = query.Where(p => !p.IsDeleted);
        }

        var posts = await query
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        if (posts.Count == 0)
        {
            return (Array.Empty<PostResponse>(), null);
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

        return (responses, null);
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

        var canManage = IsModeratorOrAdmin(callerRoleCode);
        if (post.IsDeleted && !canManage)
        {
            return null;
        }

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!CanAccessCategoryPosts(post.Category, callerRoleCode, isVerified))
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

        var isVerified = await IsCallerVerifiedAsync(authorId, cancellationToken);
        if (!CanAccessCategoryPosts(category, callerRoleCode, isVerified))
        {
            return (null, "Category not found.");
        }

        var content = request.Content.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            return (null, "Content is required.");
        }

        if (request.ParentPostId.HasValue)
        {
            var parent = await _db.Posts
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PostId == request.ParentPostId.Value, cancellationToken);

            if (parent is null || parent.IsDeleted)
            {
                return (null, "Parent post not found.");
            }

            if (parent.CategoryId != request.CategoryId)
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

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!CanAccessCategoryPosts(post.Category, callerRoleCode, isVerified))
        {
            return (null, "Post not found.");
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

        var canManage = IsModeratorOrAdmin(callerRoleCode);
        if (post.AuthorId != callerUserId && !canManage)
        {
            return (false, "You are not authorized to delete this post.");
        }

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!CanAccessCategoryPosts(post.Category, callerRoleCode, isVerified))
        {
            return (false, "Post not found.");
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

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!CanAccessCategoryPosts(post.Category, callerRoleCode, isVerified))
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

        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        if (!CanAccessCategoryPosts(post.Category, callerRoleCode, isVerified))
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

    private static bool CanAccessCategoryPosts(Category category, int callerRoleCode, bool isVerified)
    {
        if (IsModeratorOrAdmin(callerRoleCode))
        {
            return true;
        }

        if (!category.IsActive)
        {
            return false;
        }

        if (category.IsRestricted && !isVerified)
        {
            return false;
        }

        return true;
    }

    private static bool IsModeratorOrAdmin(int roleCode)
    {
        return roleCode == (int)UserRole.Moderator || roleCode == (int)UserRole.Admin;
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
