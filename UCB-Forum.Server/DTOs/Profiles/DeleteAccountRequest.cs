using System.ComponentModel.DataAnnotations;

namespace UCB_Forum.Server.Dtos.Profiles;

public class DeleteAccountRequest
{
    [Required(ErrorMessage = "Current password is required.")]
    public string CurrentPassword { get; set; } = string.Empty;
}
