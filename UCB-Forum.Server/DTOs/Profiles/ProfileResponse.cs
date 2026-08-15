namespace UCB_Forum.Server.Dtos.Profiles;

public class ProfileResponse
{
    public int ProfileId { get; set; }
    public int UserId { get; set; }
    public int UserRoleCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public string Username { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? Twitter { get; set; }
    public string? Tiktok { get; set; }

    public bool IsVerifiedStudent { get; set; }
    public string? Program { get; set; }
    public byte? YearLevel { get; set; }

    public bool IsVerifiedTeacher { get; set; }
    public string? Department { get; set; }

    public int Reputation { get; set; }
}
