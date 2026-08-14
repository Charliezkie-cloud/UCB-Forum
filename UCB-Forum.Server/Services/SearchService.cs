using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Categories;
using UCB_Forum.Server.Dtos.Posts;
using UCB_Forum.Server.Dtos.Profiles;
using UCB_Forum.Server.Dtos.Search;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class SearchService
{
    private readonly AppDbContext _db;
    private const int MaxPageSize = 100;
    private const int MaxSectionLimit = 20;

    public SearchService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SearchResultsResponse> SearchAllAsync(
        string? query,
        int limit,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var trimmedQuery = query?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmedQuery))
        {
            return new SearchResultsResponse();
        }

        var clampedLimit = Math.Clamp(limit, 1, MaxSectionLimit);

        var postsResult = await SearchPostsInternalAsync(
            trimmedQuery,
            categoryId: null,
            parentPostId: null,
            page: 1,
            pageSize: clampedLimit,
            callerUserId,
            callerRoleCode,
            cancellationToken);

        var categories = await SearchCategoriesAsync(
            trimmedQuery,
            parentCategoryId: null,
            callerRoleCode,
            cancellationToken);

        var profilesResult = await SearchProfilesAsync(
            trimmedQuery,
            page: 1,
            pageSize: clampedLimit,
            cancellationToken);

        return new SearchResultsResponse
        {
            Query = trimmedQuery,
            Posts = postsResult.Items,
            Categories = categories.Take(clampedLimit).ToList(),
            Profiles = profilesResult.Items
        };
    }

    public async Task<PagedPostsResponse> SearchPostsAsync(
        string? query,
        int? categoryId,
        int? parentPostId,
        int page,
        int pageSize,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);
        page = Math.Max(1, page);

        return await SearchPostsInternalAsync(
            query?.Trim() ?? string.Empty,
            categoryId,
            parentPostId,
            page,
            pageSize,
            callerUserId,
            callerRoleCode,
            cancellationToken);
    }

    public async Task<IReadOnlyList<CategoryResponse>> SearchCategoriesAsync(
        string? query,
        int? parentCategoryId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var trimmedQuery = query?.Trim() ?? string.Empty;
        var canManage = IsModeratorOrAdmin(callerRoleCode);
        var canViewRestricted = callerRoleCode >= (int)UserRole.Student;

        var categoryQuery = _db.Categories.AsNoTracking().AsQueryable();

        if (parentCategoryId.HasValue)
        {
            categoryQuery = categoryQuery.Where(c => c.ParentCategoryId == parentCategoryId.Value);
        }

        if (!canManage)
        {
            categoryQuery = categoryQuery.Where(c => c.IsActive);
        }

        if (!canViewRestricted)
        {
            categoryQuery = categoryQuery.Where(c => !c.IsRestricted);
        }

        if (!string.IsNullOrWhiteSpace(trimmedQuery))
        {
            categoryQuery = categoryQuery.Where(c =>
                c.Name.Contains(trimmedQuery) ||
                (c.Description != null && c.Description.Contains(trimmedQuery)) ||
                c.Slug.Contains(trimmedQuery));
        }

        var categories = await categoryQuery
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(MapToCategoryResponse).ToList();
    }

    public async Task<PagedProfilesResponse> SearchProfilesAsync(
        string? query,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);
        page = Math.Max(1, page);

        var trimmedQuery = query?.Trim() ?? string.Empty;
        var profileQuery = _db.Profiles
            .AsNoTracking()
            .Include(p => p.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(trimmedQuery))
        {
            profileQuery = profileQuery.Where(p =>
                p.Username.Contains(trimmedQuery) ||
                (p.Bio != null && p.Bio.Contains(trimmedQuery)) ||
                (p.Department != null && p.Department.Contains(trimmedQuery)) ||
                (p.Program != null && p.Program.Contains(trimmedQuery)));
        }

        var totalCount = await profileQuery.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)pageSize);

        var profiles = await profileQuery
            .OrderBy(p => p.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedProfilesResponse
        {
            Items = profiles.Select(MapToProfileResponse).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    private async Task<PagedPostsResponse> SearchPostsInternalAsync(
        string trimmedQuery,
        int? categoryId,
        int? parentPostId,
        int page,
        int pageSize,
        int callerUserId,
        int callerRoleCode,
        CancellationToken cancellationToken)
    {
        var isVerified = await IsCallerVerifiedAsync(callerUserId, cancellationToken);
        var canManage = IsModeratorOrAdmin(callerRoleCode);

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

            if (category is null || !CanAccessCategoryPosts(category, callerRoleCode, isVerified))
            {
                return new PagedPostsResponse
                {
                    Items = [],
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = 0,
                    TotalPages = 0
                };
            }

            query = query.Where(p => p.CategoryId == categoryId.Value && p.ParentPostId == parentPostId);
        }
        else
        {
            query = query.Where(p => p.ParentPostId == parentPostId);

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

        if (!string.IsNullOrWhiteSpace(trimmedQuery))
        {
            query = query.Where(p =>
                (p.Title != null && p.Title.Contains(trimmedQuery)) ||
                p.Content.Contains(trimmedQuery) ||
                (p.Author.Profile != null && p.Author.Profile.Username.Contains(trimmedQuery)));
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
            return new PagedPostsResponse
            {
                Items = [],
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
            .Select(p => MapToPostResponse(
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

    private static PostResponse MapToPostResponse(
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

    private static CategoryResponse MapToCategoryResponse(Category category)
    {
        return new CategoryResponse
        {
            CategoryId = category.CategoryId,
            ParentCategoryId = category.ParentCategoryId,
            CreatedAt = category.CreatedAt,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            IconClass = category.IconClass,
            DisplayOrder = category.DisplayOrder,
            IsRestricted = category.IsRestricted,
            IsPostingAllowed = category.IsPostingAllowed,
            IsActive = category.IsActive
        };
    }

    private static ProfileResponse MapToProfileResponse(Profile profile)
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
