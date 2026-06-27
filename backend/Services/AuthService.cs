using Microsoft.EntityFrameworkCore;
using NexusBackend.Data;
using NexusBackend.Helpers;
using NexusBackend.Models;
using NexusBackend.Models.DTOs;

namespace NexusBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly NexusDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthService(NexusDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email already exists");

            if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
                throw new Exception("Invalid role. Use 'Investor' or 'Entrepreneur'");

            var user = new User
            {
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtHelper.GenerateToken(user);

            return new AuthResponse
            {
                Token = token,
                RefreshToken = Guid.NewGuid().ToString(),
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Invalid email or password");

            if (user.Is2FAEnabled)
            {
                var code = new Random().Next(100000, 999999).ToString();
                user.TwoFactorCode = code;
                user.TwoFactorCodeExpiry = DateTime.UtcNow.AddMinutes(10);
                await _context.SaveChangesAsync();
                throw new Exception($"2FA required. Code sent: {code}");
            }

            var token = _jwtHelper.GenerateToken(user);

            return new AuthResponse
            {
                Token = token,
                RefreshToken = Guid.NewGuid().ToString(),
                User = MapToUserDto(user)
            };
        }

        public async Task<UserDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user == null ? null : MapToUserDto(user);
        }

        public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            if (request.FullName != null) user.FullName = request.FullName;
            if (request.Bio != null) user.Bio = request.Bio;
            if (request.CompanyName != null) user.CompanyName = request.CompanyName;
            if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
            if (request.InvestmentHistory != null) user.InvestmentHistory = request.InvestmentHistory;
            if (request.StartupHistory != null) user.StartupHistory = request.StartupHistory;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToUserDto(user);
        }

        public async Task<bool> Enable2FAAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Is2FAEnabled = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Verify2FAAsync(TwoFactorRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !user.Is2FAEnabled) return false;

            if (user.TwoFactorCode == request.Code && user.TwoFactorCodeExpiry > DateTime.UtcNow)
            {
                user.TwoFactorCode = null;
                user.TwoFactorCodeExpiry = null;
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        // ✅ ForgotPassword — token generate karo aur RETURN karo (response mein aayega)
        public async Task<string> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                throw new Exception("Yeh email registered nahi hai");

            var resetToken = Guid.NewGuid().ToString("N"); // clean token without dashes
            user.TwoFactorCode = resetToken;
            user.TwoFactorCodeExpiry = DateTime.UtcNow.AddMinutes(30);
            await _context.SaveChangesAsync();

            return resetToken; // ✅ frontend ko return karo
        }

        // ✅ ResetPassword — token verify karo, password update karo
        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                throw new Exception("Invalid request");

            if (user.TwoFactorCode != request.Token || user.TwoFactorCodeExpiry < DateTime.UtcNow)
                throw new Exception("Token invalid ya expired hai");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.TwoFactorCode = null;
            user.TwoFactorCodeExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private static UserDto MapToUserDto(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString(),
            Bio = user.Bio,
            CompanyName = user.CompanyName,
            ProfilePictureUrl = user.ProfilePictureUrl
        };
    }
}
