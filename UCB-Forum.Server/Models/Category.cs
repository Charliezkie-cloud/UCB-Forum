namespace UCB_Forum.Server.Models;

public class Category
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
    public bool IsPostingAllowed { get; set; } = true;
    public bool IsActive { get; set; } = true;

    public Category? ParentCategory { get; set; }
    public ICollection<Category> ChildCategories { get; set; } = new List<Category>();
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}
