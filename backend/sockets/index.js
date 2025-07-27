const { connectedUsers, users } = require('../controllers/chatController');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-chat', (userData) => {
      const user = users.get(userData.userId);
      if (user) {
        user.isOnline = true;
        connectedUsers.set(socket.id, user);
        socket.userId = user.id;

        socket.broadcast.emit('user-joined', {
          username: user.username,
          userId: user.id
        });

        const online = Array.from(connectedUsers.values()).map(u => ({
          id: u.id,
          username: u.username
        }));
        io.emit('online-users-updated', online);
      }
    });

    socket.on('typing-start', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user-typing', {
          username: user.username,
          userId: user.id
        });
      }
    });

    socket.on('typing-stop', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user-stopped-typing', {
          username: user.username,
          userId: user.id
        });
      }
    });

    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        user.isOnline = false;
        connectedUsers.delete(socket.id);

        socket.broadcast.emit('user-left', {
          username: user.username,
          userId: user.id
        });

        const online = Array.from(connectedUsers.values()).map(u => ({
          id: u.id,
          username: u.username
        }));
        io.emit('online-users-updated', online);
      }
    });
  });
};
