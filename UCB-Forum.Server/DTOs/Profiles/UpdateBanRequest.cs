using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Profiles;

public class UpdateBanRequest
{
    [Required(ErrorMessage = "Ban reason is required.")]
    [MaxLength(500, ErrorMessage = "Ban reason cannot exceed 500 characters.")]
    public string Reason { get; set; } = string.Empty;

    public DateTime? ExpiresAt { get; set; }
}
