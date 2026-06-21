using System.ComponentModel.DataAnnotations;

namespace NexusBackend.Models.DTOs
{
    public class CreateMeetingRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public int ParticipantId { get; set; }
    }

    public class UpdateMeetingStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty; // Accepted, Rejected, Cancelled
    }

    public class MeetingResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? MeetLink { get; set; }
        public UserDto Host { get; set; } = null!;
        public UserDto Participant { get; set; } = null!;
    }
}