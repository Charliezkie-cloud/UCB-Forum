namespace UCB_Forum.Server.Dtos.Auth;

public class ForgotPasswordResponse
{
    public string ResetToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
