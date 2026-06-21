using Microsoft.EntityFrameworkCore;
using NexusBackend.Data;
using NexusBackend.Models;
using NexusBackend.Models.DTOs;

namespace NexusBackend.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly NexusDbContext _context;

        public MeetingService(NexusDbContext context)
        {
            _context = context;
        }

        public async Task<MeetingResponse> ScheduleMeetingAsync(int hostId, CreateMeetingRequest request)
        {
            // Conflict detection
            var hasConflict = await CheckConflictAsync(hostId, request.StartTime, request.EndTime);
            if (hasConflict)
                throw new Exception("Time conflict with another meeting");

            var hasParticipantConflict = await CheckConflictAsync(request.ParticipantId, request.StartTime, request.EndTime);
            if (hasParticipantConflict)
                throw new Exception("Participant has a conflicting meeting");

            var meeting = new Meeting
            {
                Title = request.Title,
                Description = request.Description,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                HostId = hostId,
                ParticipantId = request.ParticipantId,
                MeetLink = $"https://meet.nexus.com/room-{Guid.NewGuid()}"
            };

            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            return await GetMeetingResponseAsync(meeting.Id);
        }

        public async Task<IEnumerable<MeetingResponse>> GetUserMeetingsAsync(int userId)
        {
            var meetings = await _context.Meetings
                .Include(m => m.Host)
                .Include(m => m.Participant)
                .Where(m => m.HostId == userId || m.ParticipantId == userId)
                .OrderBy(m => m.StartTime)
                .ToListAsync();

            return meetings.Select(m => MapToResponse(m));
        }

        public async Task<MeetingResponse?> UpdateMeetingStatusAsync(int meetingId, int userId, string status)
        {
            var meeting = await _context.Meetings.FindAsync(meetingId);
            if (meeting == null) return null;

            // Only participant can accept/reject, host can cancel
            if (!Enum.TryParse<MeetingStatus>(status, true, out var newStatus))
                throw new Exception("Invalid status");

            meeting.Status = newStatus;
            await _context.SaveChangesAsync();

            return await GetMeetingResponseAsync(meetingId);
        }

        public async Task<bool> CheckConflictAsync(int userId, DateTime start, DateTime end, int? excludeMeetingId = null)
        {
            var query = _context.Meetings
                .Where(m => (m.HostId == userId || m.ParticipantId == userId)
                    && m.Status != MeetingStatus.Rejected
                    && m.Status != MeetingStatus.Cancelled
                    && m.StartTime < end && m.EndTime > start);

            if (excludeMeetingId.HasValue)
                query = query.Where(m => m.Id != excludeMeetingId.Value);

            return await query.AnyAsync();
        }

        private async Task<MeetingResponse> GetMeetingResponseAsync(int meetingId)
        {
            var meeting = await _context.Meetings
                .Include(m => m.Host)
                .Include(m => m.Participant)
                .FirstAsync(m => m.Id == meetingId);

            return MapToResponse(meeting);
        }

        private static MeetingResponse MapToResponse(Meeting m) => new()
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            StartTime = m.StartTime,
            EndTime = m.EndTime,
            Status = m.Status.ToString(),
            MeetLink = m.MeetLink,
            Host = new UserDto
            {
                Id = m.Host.Id,
                Email = m.Host.Email,
                FullName = m.Host.FullName,
                Role = m.Host.Role.ToString()
            },
            Participant = new UserDto
            {
                Id = m.Participant.Id,
                Email = m.Participant.Email,
                FullName = m.Participant.FullName,
                Role = m.Participant.Role.ToString()
            }
        };
    }
}