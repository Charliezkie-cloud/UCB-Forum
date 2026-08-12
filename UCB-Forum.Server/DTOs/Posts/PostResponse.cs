namespace UCB_Forum.Server.Dtos.Posts;

public class PostResponse
{
    public int PostId { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public int? ParentPostId { get; set; }
    public int AuthorId { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;

    public bool IsPinned { get; set; }
    public int LikesCount { get; set; }
    public int ReplyCount { get; set; }
    public bool IsLikedByCaller { get; set; }
    public bool IsDeleted { get; set; }
}
