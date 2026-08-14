using Microsoft.AspNetCore.Authorization;

namespace UCB_Forum.Server.Authorization.Requirements;

public class ViewCategoryRequirement : IAuthorizationRequirement
{
    public bool IsVerified { get; }

    public ViewCategoryRequirement(bool isVerified = false)
    {
        IsVerified = isVerified;
    }
}

public class PostCategoryRequirement : IAuthorizationRequirement
{
}
