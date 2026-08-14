namespace UCB_Forum.Server.Models;

public class Reputation
{
    public int SourceUserId { get; set; }
    public int TargetUserId { get; set; }
    public bool IsPositive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User SourceUser { get; set; } = null!;
    public User TargetUser { get; set; } = null!;
}
