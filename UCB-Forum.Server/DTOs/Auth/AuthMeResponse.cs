namespace UCB_Forum.Server.Dtos.Auth;

public class AuthMeResponse
{
    public bool Authenticated { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public int UserRoleCode { get; set; }
}
