using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Profiles;

public class AdminUpdateProfileRequest
{
    [MaxLength(255)]
    public string? Username { get; set; }

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

    public bool? IsVerifiedStudent { get; set; }

    [MaxLength(100)]
    public string? Program { get; set; }

    [Range(1, 10)]
    public byte? YearLevel { get; set; }

    public bool? IsVerifiedTeacher { get; set; }

    [MaxLength(100)]
    public string? Department { get; set; }

    public int? Reputation { get; set; }
}
