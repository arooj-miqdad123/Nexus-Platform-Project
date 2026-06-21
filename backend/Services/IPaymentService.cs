using NexusBackend.Models.DTOs;

namespace NexusBackend.Services
{
    public interface IPaymentService
    {
        Task<PaymentResponse> CreatePaymentIntentAsync(int userId, CreatePaymentRequest request);
        Task<bool> ConfirmPaymentAsync(string transactionId);
        Task<IEnumerable<TransactionResponse>> GetUserTransactionsAsync(int userId);
    }
}