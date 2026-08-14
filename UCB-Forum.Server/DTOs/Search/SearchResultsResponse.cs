using UCB_Forum.Server.Dtos.Categories;
using UCB_Forum.Server.Dtos.Posts;
using UCB_Forum.Server.Dtos.Profiles;

namespace UCB_Forum.Server.Dtos.Search;

public class SearchResultsResponse
{
    public string Query { get; set; } = string.Empty;
    public IReadOnlyList<PostResponse> Posts { get; set; } = [];
    public IReadOnlyList<CategoryResponse> Categories { get; set; } = [];
    public IReadOnlyList<ProfileResponse> Profiles { get; set; } = [];
}
