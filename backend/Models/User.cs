using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace NexusBackend.Models
{
    public enum UserRole
    {
        Investor,
        Entrepreneur
    }

    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        public UserRole Role { get; set; }

        public string? Bio { get; set; }
        public string? CompanyName { get; set; }
        public string? InvestmentHistory { get; set; }
        public string? StartupHistory { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string? PhoneNumber { get; set; }

        public bool Is2FAEnabled { get; set; } = false;
        public string? TwoFactorCode { get; set; }
        public DateTime? TwoFactorCodeExpiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Meeting>? MeetingsAsHost { get; set; }
        public ICollection<Meeting>? MeetingsAsParticipant { get; set; }
        public ICollection<Document>? Documents { get; set; }
        public ICollection<Transaction>? Transactions { get; set; }
    }
}