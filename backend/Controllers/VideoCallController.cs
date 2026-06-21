using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NexusBackend.Hubs;

namespace NexusBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideoCallController : ControllerBase
    {
        private readonly IHubContext<VideoCallHub> _hubContext;

        public VideoCallController(IHubContext<VideoCallHub> hubContext)
        {
            _hubContext = hubContext;
        }

        // Get room info or create a new room link
        [HttpGet("room/{roomId}")]
        public IActionResult GetRoomInfo(string roomId)
        {
            return Ok(new
            {
                success = true,
                data = new
                {
                    roomId = roomId,
                    roomUrl = $"wss://your-api-url.com/hubs/videocall?roomId={roomId}",
                    maxParticipants = 2,
                    createdAt = DateTime.UtcNow
                }
            });
        }

        // Generate a unique room ID for a meeting
        [HttpPost("create-room")]
        public IActionResult CreateRoom([FromBody] CreateRoomRequest request)
        {
            var roomId = Guid.NewGuid().ToString("N")[..8]; // 8 character room ID

            return Ok(new
            {
                success = true,
                data = new
                {
                    roomId = roomId,
                    roomUrl = $"/hubs/videocall?roomId={roomId}",
                    meetingTitle = request.MeetingTitle,
                    expiresAt = DateTime.UtcNow.AddHours(24)
                }
            });
        }

        // Send signal to a specific user in room
        [HttpPost("send-signal")]
        public async Task<IActionResult> SendSignal([FromBody] SignalRequest request)
        {
            await _hubContext.Clients.Group(request.RoomId)
                .SendAsync(request.SignalType, request.Data, request.FromConnectionId);

            return Ok(new { success = true, message = "Signal sent" });
        }
    }

    public class CreateRoomRequest
    {
        public string? MeetingTitle { get; set; }
    }

    public class SignalRequest
    {
        public string RoomId { get; set; } = string.Empty;
        public string SignalType { get; set; } = string.Empty; // "ReceiveOffer", "ReceiveAnswer", etc.
        public string Data { get; set; } = string.Empty;
        public string FromConnectionId { get; set; } = string.Empty;
    }
}