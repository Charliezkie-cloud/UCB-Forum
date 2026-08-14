namespace UCB_Forum.Server.Models;

public class Post
{
    public int PostId { get; set; }
    public int CategoryId { get; set; }
    public int? ParentPostId { get; set; }
    public int AuthorId { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; }
    public bool IsDeleted { get; set; }
    public int LikesCount { get; set; }

    public Category Category { get; set; } = null!;
    public User Author { get; set; } = null!;
    public Post? ParentPost { get; set; }
    public ICollection<Post> Replies { get; set; } = new List<Post>();
    public ICollection<PostLike> PostLikes { get; set; } = new List<PostLike>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
