using NexusBackend.Models.DTOs;

namespace NexusBackend.Services
{
    public interface IMeetingService
    {
        Task<MeetingResponse> ScheduleMeetingAsync(int hostId, CreateMeetingRequest request);
        Task<IEnumerable<MeetingResponse>> GetUserMeetingsAsync(int userId);
        Task<MeetingResponse?> UpdateMeetingStatusAsync(int meetingId, int userId, string status);
        Task<bool> CheckConflictAsync(int userId, DateTime start, DateTime end, int? excludeMeetingId = null);
    }
}