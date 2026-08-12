using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Categories;

public class UpdateCategoryRequest
{
    public int? ParentCategoryId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string? IconClass { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsRestricted { get; set; }

    public bool IsActive { get; set; } = true;
}
