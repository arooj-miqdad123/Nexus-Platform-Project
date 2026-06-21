using System.ComponentModel.DataAnnotations;

namespace NexusBackend.Models
{
    public enum MeetingStatus
    {
        Pending,
        Accepted,
        Rejected,
        Completed,
        Cancelled
    }

    public class Meeting
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public MeetingStatus Status { get; set; } = MeetingStatus.Pending;

        public string? MeetLink { get; set; }

        // Foreign Keys
        public int HostId { get; set; }
        public User Host { get; set; } = null!;

        public int ParticipantId { get; set; }
        public User Participant { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}