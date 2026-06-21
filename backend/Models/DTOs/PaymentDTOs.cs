using System.ComponentModel.DataAnnotations;

namespace NexusBackend.Models.DTOs
{
    public class CreatePaymentRequest
    {
        [Required]
        public decimal Amount { get; set; }

        public string? Currency { get; set; } = "USD";

        public string? Description { get; set; }
    }

    public class PaymentResponse
    {
        public string TransactionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ClientSecret { get; set; }
    }

    public class TransactionResponse
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}