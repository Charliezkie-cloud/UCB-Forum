using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Profiles;

public class UpdateProfileRequest
{
    [Required]
    [MaxLength(255)]
    public string Username { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Bio { get; set; }

    [MaxLength(2048)]
    public string? AvatarUrl { get; set; }

    [MaxLength(100)]
    public string? Facebook { get; set; }

    [MaxLength(100)]
    public string? Instagram { get; set; }

    [MaxLength(100)]
    public string? Twitter { get; set; }

    [MaxLength(100)]
    public string? Tiktok { get; set; }

    // Can only be set/edited if user is a verified student
    [MaxLength(100)]
    public string? Program { get; set; }

    [Range(1, 10)]
    public byte? YearLevel { get; set; }
}
