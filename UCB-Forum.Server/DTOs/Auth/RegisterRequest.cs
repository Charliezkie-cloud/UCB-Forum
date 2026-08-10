using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Auth;

public class RegisterRequest
{
    [Required]
    [MinLength(3)]
    [MaxLength(255)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}
