using Microsoft.EntityFrameworkCore;
using NexusBackend.Data;
using NexusBackend.Models;
using NexusBackend.Models.DTOs;

namespace NexusBackend.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly NexusDbContext _context;
        private readonly IConfiguration _config;

        public PaymentService(NexusDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<PaymentResponse> CreatePaymentIntentAsync(int userId, CreatePaymentRequest request)
        {
            // Mock payment - Stripe integration placeholder
            var transaction = new Transaction
            {
                UserId = userId,
                Type = TransactionType.Deposit,
                Amount = request.Amount,
                Currency = request.Currency,
                Status = TransactionStatus.Pending,
                Description = request.Description,
                StripePaymentIntentId = $"pi_mock_{Guid.NewGuid()}"
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new PaymentResponse
            {
                TransactionId = transaction.TransactionId,
                Amount = transaction.Amount,
                Status = transaction.Status.ToString(),
                ClientSecret = $"secret_{transaction.StripePaymentIntentId}" // Frontend ke liye
            };
        }

        public async Task<bool> ConfirmPaymentAsync(string transactionId)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.TransactionId == transactionId);

            if (transaction == null) return false;

            transaction.Status = TransactionStatus.Completed;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<TransactionResponse>> GetUserTransactionsAsync(int userId)
        {
            return await _context.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TransactionResponse
                {
                    Id = t.Id,
                    TransactionId = t.TransactionId,
                    Type = t.Type.ToString(),
                    Amount = t.Amount,
                    Status = t.Status.ToString(),
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }
    }
}