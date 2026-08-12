namespace UCB_Forum.Server.Dtos.Posts;

public class PagedPostsResponse
{
    public IReadOnlyList<PostResponse> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
