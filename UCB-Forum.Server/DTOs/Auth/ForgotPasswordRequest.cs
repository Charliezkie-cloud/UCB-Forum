using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Auth;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; set; } = string.Empty;
}
