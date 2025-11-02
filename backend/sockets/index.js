const { connectedUsers, users } = require('../controllers/chatController');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (data) => {
      const { room, userId, username } = data;
      const user = users.get(userId);
      
      if (user) {
        socket.join(room);
        socket.currentRoom = room;
        
        user.isOnline = true;
        connectedUsers.set(socket.id, user);
        socket.userId = user.id;

        console.log(`${username} joined room: ${room}`);

        socket.to(room).emit('user-joined', {
          username: user.username,
          userId: user.id
        });

        const roomSockets = io.sockets.adapter.rooms.get(room);
        const onlineInRoom = [];
        if (roomSockets) {
          roomSockets.forEach(socketId => {
            const u = connectedUsers.get(socketId);
            if (u) {
              onlineInRoom.push({ id: u.id, username: u.username });
            }
          });
        }
        io.to(room).emit('online-users-updated', onlineInRoom);
      }
    });

    socket.on('offer', (data) => {
      socket.to(socket.currentRoom).emit('offer', data);
    });

    socket.on('answer', (data) => {
      socket.to(socket.currentRoom).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
      socket.to(socket.currentRoom).emit('ice-candidate', data);
    });

    socket.on('typing-start', () => {
      const user = connectedUsers.get(socket.id);
      if (user && socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user-typing', {
          username: user.username,
          userId: user.id
        });
      }
    });

    socket.on('typing-stop', () => {
      const user = connectedUsers.get(socket.id);
      if (user && socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user-stopped-typing', {
          username: user.username,
          userId: user.id
        });
      }
    });

    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        const room = socket.currentRoom;
        user.isOnline = false;
        connectedUsers.delete(socket.id);

        console.log(`${user.username} disconnected from room: ${room}`);

        if (room) {
          socket.to(room).emit('user-left', {
            username: user.username,
            userId: user.id
          });

          const roomSockets = io.sockets.adapter.rooms.get(room);
          const onlineInRoom = [];
          if (roomSockets) {
            roomSockets.forEach(socketId => {
              const u = connectedUsers.get(socketId);
              if (u) {
                onlineInRoom.push({ id: u.id, username: u.username });
              }
            });
          }
          io.to(room).emit('online-users-updated', onlineInRoom);
        }
      }
    });
  });
};