using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusBackend.Models.DTOs;
using NexusBackend.Services;

namespace NexusBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var payment = await _paymentService.CreatePaymentIntentAsync(userId, request);
            return Ok(new { success = true, data = payment });
        }

        [HttpPost("confirm/{transactionId}")]
        public async Task<IActionResult> ConfirmPayment(string transactionId)
        {
            var result = await _paymentService.ConfirmPaymentAsync(transactionId);
            return result
                ? Ok(new { success = true, message = "Payment confirmed" })
                : BadRequest(new { success = false, message = "Payment failed" });
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var transactions = await _paymentService.GetUserTransactionsAsync(userId);
            return Ok(new { success = true, data = transactions });
        }
    }
}