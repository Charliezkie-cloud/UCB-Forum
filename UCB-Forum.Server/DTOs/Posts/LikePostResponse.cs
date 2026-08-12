namespace UCB_Forum.Server.Dtos.Posts;

public class LikePostResponse
{
    public int PostId { get; set; }
    public int LikesCount { get; set; }
    public bool IsLikedByCaller { get; set; }
}
