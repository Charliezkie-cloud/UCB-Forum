namespace UCB_Forum.Server.Options;

public class RateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    public int PermitLimit { get; set; } = 100;
    public int WindowInSeconds { get; set; } = 60;
    public int QueueLimit { get; set; } = 0;

    public int AuthPermitLimit { get; set; } = 10;
    public int AuthWindowInSeconds { get; set; } = 60;
}
