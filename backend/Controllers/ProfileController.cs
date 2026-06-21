using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusBackend.Models.DTOs;
using NexusBackend.Services;

namespace NexusBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IAuthService _authService;

        public ProfileController(IAuthService authService)
        {
            _authService = authService;
        }

        // GET: api/profile
        [HttpGet]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var profile = await _authService.GetProfileAsync(userId);

            if (profile == null)
                return NotFound(new { success = false, message = "Profile not found" });

            return Ok(new { success = true, data = profile });
        }

        // GET: api/profile/{id} - Get any user's public profile
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfileById(int id)
        {
            var profile = await _authService.GetProfileAsync(id);

            if (profile == null)
                return NotFound(new { success = false, message = "Profile not found" });

            return Ok(new { success = true, data = profile });
        }

        // PUT: api/profile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var profile = await _authService.UpdateProfileAsync(userId, request);

            if (profile == null)
                return NotFound(new { success = false, message = "Profile not found" });

            return Ok(new { success = true, message = "Profile updated successfully", data = profile });
        }

        // POST: api/profile/picture
        [HttpPost("picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file uploaded" });

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            // Save file
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profiles");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"profile_{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user profile picture URL
            var updateRequest = new UpdateProfileRequest
            {
                // ProfilePictureUrl update karne ke liye AuthService mein method add karein
                // Ya direct DbContext use karein
            };

            return Ok(new
            {
                success = true,
                message = "Profile picture uploaded",
                data = new { imageUrl = $"/profiles/{fileName}" }
            });
        }

        // GET: api/profile/stats
        [HttpGet("stats")]
        public IActionResult GetMyStats()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            return Ok(new
            {
                success = true,
                data = new
                {
                    userId = userId,
                    role = role,
                    totalMeetings = 0, // Service se fetch karein
                    totalDocuments = 0,
                    totalTransactions = 0
                }
            });
        }
    }
}