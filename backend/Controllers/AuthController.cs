using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusBackend.Models.DTOs;
using NexusBackend.Services;

namespace NexusBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("2FA required"))
                    return Ok(new { success = true, requires2FA = true, message = ex.Message });

                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> Verify2FA([FromBody] TwoFactorRequest request)
        {
            var result = await _authService.Verify2FAAsync(request);
            if (!result) return BadRequest(new { success = false, message = "Invalid code" });

            return Ok(new { success = true, message = "2FA verified" });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var profile = await _authService.GetProfileAsync(userId);
            return profile == null ? NotFound() : Ok(new { success = true, data = profile });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var profile = await _authService.UpdateProfileAsync(userId, request);
            return profile == null ? NotFound() : Ok(new { success = true, data = profile });
        }

        [Authorize]
        [HttpPost("enable-2fa")]
        public async Task<IActionResult> Enable2FA()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var result = await _authService.Enable2FAAsync(userId);
            return Ok(new { success = result, message = result ? "2FA enabled" : "Failed" });
        }
    }
}