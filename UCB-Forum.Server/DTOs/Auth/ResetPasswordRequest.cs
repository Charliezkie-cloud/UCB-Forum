using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Auth;

public class ResetPasswordRequest
{
    [Required]
    public string ResetToken { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [MaxLength(100)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
