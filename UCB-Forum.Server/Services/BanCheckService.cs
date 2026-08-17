using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Data;

namespace UCB_Forum.Server.Services;

public class BanCheckService
{
    private readonly AppDbContext _db;

    public BanCheckService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Returns true if the user has an active, non-expired ban record.
    /// </summary>
    public async Task<bool> IsUserBannedAsync(int userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _db.UserBans
            .AnyAsync(
                b => b.UserId == userId
                  && b.IsActive
                  && (!b.ExpiresAt.HasValue || b.ExpiresAt.Value > now),
                cancellationToken);
    }
}
