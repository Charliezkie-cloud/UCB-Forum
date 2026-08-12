namespace UCB_Forum.Server.Dtos.Posts;

public class CreatePostRequest
{
    public int CategoryId { get; set; }
    public int? ParentPostId { get; set; }
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;
}
