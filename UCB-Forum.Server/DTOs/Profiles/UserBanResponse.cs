namespace UCB_Forum.Server.Dtos.Profiles;

public class UserBanResponse
{
    public int BanId { get; set; }
    public int UserId { get; set; }
    public int BannedByUserId { get; set; }
    public string? BannedByUsername { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
