namespace UCB_Forum.Server.Dtos.Categories;

public class CategoryResponse
{
    public int CategoryId { get; set; }
    public int? ParentCategoryId { get; set; }
    public DateTime CreatedAt { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsRestricted { get; set; }
    public bool IsPostingAllowed { get; set; }
    public bool IsActive { get; set; }
}
