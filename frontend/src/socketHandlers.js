import { io } from 'socket.io-client';

export const SOCKET_URL = 'http://localhost:5000';

export const initializeSocket = (user, room, handlers) => {
  const socket = io(SOCKET_URL, { withCredentials: true });

  socket.on('connect', () => {
    socket.emit('join-room', { room, userId: user.id, username: user.username });
  });

  socket.on('new-message', handlers.onNewMessage);
  socket.on('online-users-updated', handlers.onUserUpdate);

  socket.on('offer', async ({ offer }) => {
    await handlers.setupCall(false);
    await handlers.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await handlers.peerConnection.createAnswer();
    await handlers.peerConnection.setLocalDescription(answer);
    socket.emit('answer', { answer });
  });

  socket.on('answer', ({ answer }) => {
    handlers.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on('ice-candidate', ({ candidate }) => {
    if (handlers.peerConnection) {
      handlers.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  });

  return socket;
};
