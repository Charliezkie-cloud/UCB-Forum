namespace UCB_Forum.Server.Dtos.Profiles;

public class PagedProfilesResponse
{
    public IReadOnlyList<ProfileResponse> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
