namespace UCB_Forum.Server.Dtos.Posts;

public class UpdatePostRequest
{
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;
}
