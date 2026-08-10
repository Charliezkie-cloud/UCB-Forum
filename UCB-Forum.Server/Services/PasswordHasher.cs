using System.Security.Cryptography;

namespace UCB_Forum.Server.Services;

/// <summary>
/// Stores passwords as varbinary(64): 16-byte salt + 48-byte PBKDF2-SHA256 hash.
/// </summary>
public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 48;
    private const int Iterations = 100_000;

    public static byte[] Hash(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            HashSize);

        var result = new byte[SaltSize + HashSize];
        Buffer.BlockCopy(salt, 0, result, 0, SaltSize);
        Buffer.BlockCopy(hash, 0, result, SaltSize, HashSize);
        return result;
    }

    public static bool Verify(string password, byte[] stored)
    {
        if (string.IsNullOrEmpty(password) || stored.Length != SaltSize + HashSize)
        {
            return false;
        }

        var salt = stored.AsSpan(0, SaltSize);
        var expectedHash = stored.AsSpan(SaltSize, HashSize);
        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            HashSize);

        return CryptographicOperations.FixedTimeEquals(expectedHash, actualHash);
    }
}
