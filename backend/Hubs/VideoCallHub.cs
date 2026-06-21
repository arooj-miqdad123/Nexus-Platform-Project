using Microsoft.AspNetCore.SignalR;

namespace NexusBackend.Hubs
{
    public class VideoCallHub : Hub
    {
        public async Task JoinRoom(string roomId, string userName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserJoined", userName, Context.ConnectionId);
        }

        public async Task LeaveRoom(string roomId, string userName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserLeft", userName);
        }

        public async Task SendOffer(string roomId, string offer)
        {
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveOffer", offer, Context.ConnectionId);
        }

        public async Task SendAnswer(string roomId, string answer)
        {
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveAnswer", answer, Context.ConnectionId);
        }

        public async Task SendIceCandidate(string roomId, string candidate)
        {
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveIceCandidate", candidate, Context.ConnectionId);
        }

        public async Task ToggleAudio(string roomId, bool isMuted)
        {
            await Clients.OthersInGroup(roomId).SendAsync("UserAudioToggled", Context.ConnectionId, isMuted);
        }

        public async Task ToggleVideo(string roomId, bool isVideoOff)
        {
            await Clients.OthersInGroup(roomId).SendAsync("UserVideoToggled", Context.ConnectionId, isVideoOff);
        }
    }
}