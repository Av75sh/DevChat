import React, { useState } from 'react';
import AuthForm from './AuthForm';
import ChatRoom from './ChatRoom';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showAuth, setShowAuth] = useState(true);

  return showAuth ? (
    <AuthForm setUser={setUser} setShowAuth={setShowAuth} />
  ) : (
    <ChatRoom
      user={user}
      roomCode={roomCode}
      setRoomCode={setRoomCode}
      currentRoom={currentRoom}
      setCurrentRoom={setCurrentRoom}
    />
  );
};

export default App;
