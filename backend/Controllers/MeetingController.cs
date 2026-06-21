using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusBackend.Models.DTOs;
using NexusBackend.Services;

namespace NexusBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MeetingController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [HttpPost]
        public async Task<IActionResult> ScheduleMeeting([FromBody] CreateMeetingRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
                var meeting = await _meetingService.ScheduleMeetingAsync(userId, request);
                return Ok(new { success = true, data = meeting });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMyMeetings()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var meetings = await _meetingService.GetUserMeetingsAsync(userId);
            return Ok(new { success = true, data = meetings });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateMeetingStatusRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var meeting = await _meetingService.UpdateMeetingStatusAsync(id, userId, request.Status);
            return meeting == null ? NotFound() : Ok(new { success = true, data = meeting });
        }
    }
}