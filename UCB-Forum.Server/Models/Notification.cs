namespace UCB_Forum.Server.Models;

public class Notification
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public int? RelatedPostId { get; set; }
    public DateTime CreatedAt { get; set; }
    public byte Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }

    public User User { get; set; } = null!;
    public Post? RelatedPost { get; set; }
}
