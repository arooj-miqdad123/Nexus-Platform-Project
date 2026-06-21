using System.ComponentModel.DataAnnotations;

namespace NexusBackend.Models
{
    public enum TransactionType
    {
        Deposit,
        Withdraw,
        Transfer
    }

    public enum TransactionStatus
    {
        Pending,
        Completed,
        Failed,
        Cancelled
    }

    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string TransactionId { get; set; } = Guid.NewGuid().ToString();

        public TransactionType Type { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public string? Currency { get; set; } = "USD";

        public TransactionStatus Status { get; set; } = TransactionStatus.Pending;

        public string? Description { get; set; }

        public string? StripePaymentIntentId { get; set; }

        // Foreign Key
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}