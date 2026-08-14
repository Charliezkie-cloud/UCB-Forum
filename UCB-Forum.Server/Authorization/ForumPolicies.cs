namespace UCB_Forum.Server.Authorization;

public static class ForumPolicies
{
    public const string RequireAdmin = "RequireAdmin";
    public const string RequireModeratorOrAdmin = "RequireModeratorOrAdmin";
    public const string CanViewCategory = "CanViewCategory";
    public const string CanPostInCategory = "CanPostInCategory";
}
