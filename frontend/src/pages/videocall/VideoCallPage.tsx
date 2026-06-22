import React, { useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import type { HubConnection } from '@microsoft/signalr'; // <-- SignalR ki type import ki hai

// Backend URL
const BACKEND_URL = 'http://localhost:5243';

export const VideoCallPage: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);

    // 1. any ya unknown ki jagah proper HubConnection type de di
    const connectionRef = useRef<HubConnection | null>(null);

    const [roomId, setRoomId] = useState('');
    const [roomInput, setRoomInput] = useState('');
    const [isInCall, setIsInCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const startLocalStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setLocalStream(stream);
        return stream;
    };

    const joinRoom = async () => {
        if (!roomInput.trim()) return toast.error('Enter Room ID ');
        const id = roomInput.trim();
        setRoomId(id);

        try {
            // Import SignalR dynamically
            const signalR = await import('@microsoft/signalr');
            const connection = new signalR.HubConnectionBuilder()
                .withUrl(`${BACKEND_URL}/hubs/videocall`)
                .withAutomaticReconnect()
                .build();

            connectionRef.current = connection;

            const stream = await startLocalStream();

            peerRef.current = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            stream.getTracks().forEach(track => peerRef.current!.addTrack(track, stream));

            peerRef.current.ontrack = (event) => {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
            };

            peerRef.current.onicecandidate = async (event) => {
                if (event.candidate) {
                    await connection.invoke('SendIceCandidate', id, JSON.stringify(event.candidate));
                }
            };

            connection.on('UserJoined', async (userName: string, connId: string) => {
                toast.success(`${userName} joined`);
                if (connId !== connection.connectionId) {
                    const offer = await peerRef.current!.createOffer();
                    await peerRef.current!.setLocalDescription(offer);
                    await connection.invoke('SendOffer', id, JSON.stringify(offer));
                }
            });

            connection.on('ReceiveOffer', async (offer: string) => {
                await peerRef.current!.setRemoteDescription(JSON.parse(offer));
                const answer = await peerRef.current!.createAnswer();
                await peerRef.current!.setLocalDescription(answer);
                await connection.invoke('SendAnswer', id, JSON.stringify(answer));
            });

            connection.on('ReceiveAnswer', async (answer: string) => {
                await peerRef.current!.setRemoteDescription(JSON.parse(answer));
            });

            connection.on('ReceiveIceCandidate', async (candidate: string) => {
                await peerRef.current!.addIceCandidate(JSON.parse(candidate));
            });

            connection.on('UserLeft', (userName: string) => {
                toast.error(`${userName} left the call`);
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            });

            await connection.start();
            await connection.invoke('JoinRoom', id, 'User');
            setIsInCall(true);
            toast.success(`Room ${id} joined!`);
        } catch (err) {
            console.error(err);
            toast.error('Connection failed. IS Backend Running?');
        }
    };

    const toggleMute = () => {
        localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setIsMuted(p => !p);
        // 2. Clear clean invoke call bina kisi 'any' k
        connectionRef.current?.invoke('ToggleAudio', roomId, !isMuted);
    };

    const toggleVideo = () => {
        localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setIsVideoOff(p => !p);
        connectionRef.current?.invoke('ToggleVideo', roomId, !isVideoOff);
    };

    const endCall = async () => {
        await connectionRef.current?.invoke('LeaveRoom', roomId, 'User');
        await connectionRef.current?.stop();
        peerRef.current?.close();
        localStream?.getTracks().forEach(t => t.stop());
        setIsInCall(false);
        setLocalStream(null);
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        toast.success('Call end ho gayi');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Video Call</h1>

            {!isInCall ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow">
                    <Video className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                    <h2 className="text-xl font-semibold mb-4">Join or Create a room</h2>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            className="flex-1 border rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
                            placeholder="Write Room Id"
                            value={roomInput}
                            onChange={e => setRoomInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && joinRoom()}
                        />
                        <Button onClick={joinRoom}>Join</Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                        Both users must use the same Room ID
                    </p>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                Aap (Local)
                            </span>
                        </div>
                        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                Remote User
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button onClick={toggleMute}
                            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleVideo}
                            className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5" />}
                        </button>
                        <button onClick={endCall}
                            className="p-4 rounded-full bg-red-500 hover:bg-red-600">
                            <PhoneOff className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-3">Room: <strong>{roomId}</strong></p>
                </div>
            )}
        </div>
    );
};