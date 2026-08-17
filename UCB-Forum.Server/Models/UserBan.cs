namespace UCB_Forum.Server.Models;

public class UserBan
{
    public int BanId { get; set; }
    public int UserId { get; set; }
    public int BannedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public User? User { get; set; }
    public User? BannedByUser { get; set; }
}
