import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, Video, PhoneOff } from 'lucide-react';
import { apiCall } from './api';
import { initializeSocket } from './socketHandlers';
import { motion } from 'framer-motion';

const ChatRoom = ({ user, roomCode, setRoomCode, currentRoom, setCurrentRoom }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inCall, setInCall] = useState(false);
  const [stream, setStream] = useState(null);
  const socket = useRef(null);
  const peerConnection = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setupCall = async (isInitiator) => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.onicecandidate = e => {
      if (e.candidate) {
        socket.current.emit('ice-candidate', { candidate: e.candidate });
      }
    };

    peerConnection.current.ontrack = e => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = e.streams[0];
      }
    };

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(localStream);
    localStream.getTracks().forEach(track => peerConnection.current.addTrack(track, localStream));

    if (localVideo.current) {
      localVideo.current.srcObject = localStream;
    }
  };

  const handleEnterRoom = async () => {
    setCurrentRoom(roomCode.trim());
    socket.current = initializeSocket(user, roomCode.trim(), {
      onNewMessage: msg => setMessages(prev => [...prev, msg]),
      onUserUpdate: setOnlineUsers,
      setupCall,
      peerConnection: peerConnection.current
    });
    const res = await apiCall('/messages/' + roomCode.trim());
    setMessages(res.data.messages);
  };

  useEffect(() => {
    if (currentRoom) {
      handleEnterRoom();
    }
  }, []);

  const createRoom = () => {
    const newRoom = Math.random().toString(36).substring(2, 8);
    setRoomCode(newRoom);
    setCurrentRoom(newRoom);
    socket.current = initializeSocket(user, newRoom, {
      onNewMessage: msg => setMessages(prev => [...prev, msg]),
      onUserUpdate: setOnlineUsers,
      setupCall,
      peerConnection: peerConnection.current
    });
    setMessages([]);
    alert('Room created. Share this code: ' + newRoom);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const msg = newMessage.trim();
    setNewMessage('');
    await apiCall('/messages', 'POST', { content: msg, room: currentRoom });
  };

  const startCall = async () => {
    setInCall(true);
    setTimeout(async () => {
      await setupCall(true);
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.current.emit('offer', { offer });
    }, 100);
  };

  const endCall = () => {
    if (peerConnection.current) peerConnection.current.close();
    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setInCall(false);
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl mb-4">Welcome {user.username}</h1>
        <input type="text" placeholder="Enter room code" value={roomCode} onChange={e => setRoomCode(e.target.value)} className="p-3 bg-gray-700 text-white rounded mb-2 w-full max-w-sm" />
        <button onClick={handleEnterRoom} className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded mb-2 w-full max-w-sm">Join Room</button>
        <button onClick={createRoom} className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded w-full max-w-sm">Create New Room</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex justify-between items-center bg-gray-800 p-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">Room: {currentRoom}</h2>
          <p className="text-sm text-gray-400">Users Online: {onlineUsers.length}</p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          {!inCall && <button onClick={startCall} className="bg-green-600 hover:bg-green-700 transition p-2 rounded"><Video size={16} /></button>}
          {inCall && <button onClick={endCall} className="bg-red-600 hover:bg-red-700 transition p-2 rounded"><PhoneOff size={16} /></button>}
          <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 transition p-2 rounded"><LogOut size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col space-y-4" id="messages">
        {messages.map(msg => (
          <motion.div
            key={msg._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`max-w-md px-4 py-2 rounded-lg shadow text-sm ${
              msg.sender._id === user.id ? 'bg-blue-600 text-white self-end ml-auto' : 'bg-gray-700 text-white self-start'
            }`}
          >
            <div className="text-xs text-gray-300 mb-1">
              {msg.sender.username} · {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
            <p>{msg.content}</p>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {inCall && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 justify-center bg-black">
          <video ref={localVideo} autoPlay playsInline muted className="w-full sm:w-1/2 rounded-xl border-2 border-blue-500" />
          <video ref={remoteVideo} autoPlay playsInline className="w-full sm:w-1/2 rounded-xl border-2 border-green-500" />
        </div>
      )}

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-full">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;