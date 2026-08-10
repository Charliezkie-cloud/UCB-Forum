namespace UCB_Forum.Server.Models;

public class User
{
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Email { get; set; } = string.Empty;
    public byte[] Password { get; set; } = Array.Empty<byte>();
    public int UserRoleCode { get; set; } = (int)UserRole.Guest;

    public Profile? Profile { get; set; }
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<PostLike> PostLikes { get; set; } = new List<PostLike>();
}
