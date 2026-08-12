using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;
using UCB_Forum.Server.Dtos.Categories;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Services;

public class CategoryService
{
    private static readonly Regex SlugSanitizeRegex = new(@"[^a-z0-9\-]+", RegexOptions.Compiled);
    private static readonly Regex SlugCollapseRegex = new(@"-{2,}", RegexOptions.Compiled);

    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(
        int callerRoleCode,
        int? parentCategoryId,
        CancellationToken cancellationToken = default)
    {
        var canManage = IsModeratorOrAdmin(callerRoleCode);
        var canViewRestricted = callerRoleCode >= (int)UserRole.Student;

        var query = _db.Categories.AsNoTracking().AsQueryable();

        if (parentCategoryId.HasValue)
        {
            query = query.Where(c => c.ParentCategoryId == parentCategoryId.Value);
        }

        if (!canManage)
        {
            query = query.Where(c => c.IsActive);
        }

        if (!canViewRestricted)
        {
            query = query.Where(c => !c.IsRestricted);
        }

        var categories = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(MapToResponse).ToList();
    }

    public async Task<CategoryResponse?> GetCategoryByIdAsync(
        int categoryId,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId, cancellationToken);

        if (category is null || !CanViewCategory(category, callerRoleCode))
        {
            return null;
        }

        return MapToResponse(category);
    }

    public async Task<CategoryResponse?> GetCategoryBySlugAsync(
        string slug,
        int callerRoleCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedSlug = NormalizeSlug(slug);
        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            return null;
        }

        var category = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == normalizedSlug, cancellationToken);

        if (category is null || !CanViewCategory(category, callerRoleCode))
        {
            return null;
        }

        return MapToResponse(category);
    }

    public async Task<(CategoryResponse? Response, string? Error)> CreateCategoryAsync(
        CreateCategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return (null, "Category name is required.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug(name)
            : NormalizeSlug(request.Slug);

        if (string.IsNullOrWhiteSpace(slug))
        {
            return (null, "A valid slug could not be generated from the category name.");
        }

        if (slug.Length > 120)
        {
            return (null, "Slug must be 120 characters or fewer.");
        }

        var parentError = await ValidateParentAsync(request.ParentCategoryId, excludeCategoryId: null, cancellationToken);
        if (parentError is not null)
        {
            return (null, parentError);
        }

        var slugExists = await _db.Categories
            .AnyAsync(c => c.Slug == slug, cancellationToken);

        if (slugExists)
        {
            return (null, "A category with this slug already exists.");
        }

        var category = new Category
        {
            ParentCategoryId = request.ParentCategoryId,
            CreatedAt = DateTime.UtcNow,
            Name = name,
            Slug = slug,
            Description = request.Description?.Trim(),
            IconClass = request.IconClass?.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsRestricted = request.IsRestricted,
            IsPostingAllowed = request.IsPostingAllowed,
            IsActive = request.IsActive
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return (MapToResponse(category), null);
    }

    public async Task<(CategoryResponse? Response, string? Error)> UpdateCategoryAsync(
        int categoryId,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId, cancellationToken);

        if (category is null)
        {
            return (null, "Category not found.");
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return (null, "Category name is required.");
        }

        var slug = NormalizeSlug(request.Slug);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return (null, "A valid slug is required.");
        }

        if (slug.Length > 120)
        {
            return (null, "Slug must be 120 characters or fewer.");
        }

        var parentError = await ValidateParentAsync(request.ParentCategoryId, categoryId, cancellationToken);
        if (parentError is not null)
        {
            return (null, parentError);
        }

        if (!string.Equals(category.Slug, slug, StringComparison.OrdinalIgnoreCase))
        {
            var slugExists = await _db.Categories
                .AnyAsync(c => c.Slug == slug && c.CategoryId != categoryId, cancellationToken);

            if (slugExists)
            {
                return (null, "A category with this slug already exists.");
            }
        }

        category.ParentCategoryId = request.ParentCategoryId;
        category.Name = name;
        category.Slug = slug;
        category.Description = request.Description?.Trim();
        category.IconClass = request.IconClass?.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsRestricted = request.IsRestricted;
        category.IsPostingAllowed = request.IsPostingAllowed;
        category.IsActive = request.IsActive;

        await _db.SaveChangesAsync(cancellationToken);

        return (MapToResponse(category), null);
    }

    public async Task<(CategoryResponse? Response, string? Error)> UpdatePostingAllowedAsync(
        int categoryId,
        bool isPostingAllowed,
        CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId, cancellationToken);

        if (category is null)
        {
            return (null, "Category not found.");
        }

        category.IsPostingAllowed = isPostingAllowed;
        await _db.SaveChangesAsync(cancellationToken);

        return (MapToResponse(category), null);
    }

    public async Task<(bool Success, string? Error)> DeactivateCategoryAsync(
        int categoryId,
        CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId, cancellationToken);

        if (category is null)
        {
            return (false, "Category not found.");
        }

        category.IsActive = false;
        await _db.SaveChangesAsync(cancellationToken);

        return (true, null);
    }

    private async Task<string?> ValidateParentAsync(
        int? parentCategoryId,
        int? excludeCategoryId,
        CancellationToken cancellationToken)
    {
        if (!parentCategoryId.HasValue)
        {
            return null;
        }

        if (excludeCategoryId.HasValue && parentCategoryId.Value == excludeCategoryId.Value)
        {
            return "A category cannot be its own parent.";
        }

        var parentExists = await _db.Categories
            .AnyAsync(c => c.CategoryId == parentCategoryId.Value, cancellationToken);

        if (!parentExists)
        {
            return "Parent category not found.";
        }

        return null;
    }

    private static bool CanViewCategory(Category category, int callerRoleCode)
    {
        var canManage = IsModeratorOrAdmin(callerRoleCode);
        var canViewRestricted = callerRoleCode >= (int)UserRole.Student;

        if (!category.IsActive && !canManage)
        {
            return false;
        }

        if (category.IsRestricted && !canViewRestricted && !canManage)
        {
            return false;
        }

        return true;
    }

    private static bool IsModeratorOrAdmin(int roleCode)
    {
        return roleCode == (int)UserRole.Moderator || roleCode == (int)UserRole.Admin;
    }

    private static CategoryResponse MapToResponse(Category category)
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

    private static string GenerateSlug(string name)
    {
        return NormalizeSlug(name);
    }

    private static string NormalizeSlug(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var character in normalized)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(character);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        var slug = builder.ToString().Normalize(NormalizationForm.FormC);
        slug = slug.Replace(' ', '-');
        slug = SlugSanitizeRegex.Replace(slug, string.Empty);
        slug = SlugCollapseRegex.Replace(slug, "-").Trim('-');

        return slug;
    }
}
