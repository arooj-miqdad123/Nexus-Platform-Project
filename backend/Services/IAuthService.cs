using NexusBackend.Models;
using NexusBackend.Models.DTOs;

namespace NexusBackend.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserDto?> GetProfileAsync(int userId);
        Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<bool> Enable2FAAsync(int userId);
        Task<bool> Verify2FAAsync(TwoFactorRequest request);
    }
}