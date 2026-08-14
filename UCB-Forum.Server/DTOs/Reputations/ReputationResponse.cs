namespace UCB_Forum.Server.Dtos.Reputations;

public class ReputationResponse
{
    public int TargetUserId { get; set; }
    public int Reputation { get; set; }
    public bool HasVoted { get; set; }
    public bool? IsPositive { get; set; }
}
