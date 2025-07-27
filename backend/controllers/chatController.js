const User = require('../models/User');
const Message = require('../models/Message');

const users = new Map();
const globalMessages = [];
const connectedUsers = new Map();

const register = (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = Array.from(users.values()).find(
    user => user.email === email || user.username === username
  );

  if (existingUser) {
    return res.json({ success: false, message: 'User already exists' });
  }

  const user = new User(username, email, password);
  users.set(user.id, user);
  req.session.userId = user.id;

  res.json({
    success: true,
    data: {
      user: { id: user.id, username: user.username, email: user.email },
      token: 'demo-token-' + user.id
    }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  const user = Array.from(users.values()).find(u => u.email === email);

  if (!user || user.password !== password) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  user.isOnline = true;

  res.json({
    success: true,
    data: {
      user: { id: user.id, username: user.username, email: user.email },
      token: 'demo-token-' + user.id
    }
  });
};

const me = (req, res) => {
  const user = users.get(req.session.userId);
  if (!user) return res.json({ success: false, message: 'User not found' });

  res.json({ success: true, data: { user: { id: user.id, username: user.username, email: user.email } } });
};

const logout = (req, res) => {
  const user = users.get(req.session.userId);
  if (user) user.isOnline = false;
  req.session.destroy();
  res.json({ success: true });
};

const getMessages = (req, res) => {
  const recent = globalMessages.slice(-50).map(msg => {
    const sender = users.get(msg.sender);
    return {
      _id: msg.id,
      content: msg.content,
      messageType: msg.messageType,
      reactions: msg.reactions,
      sender: { username: sender?.username || 'Unknown' },
      createdAt: msg.createdAt
    };
  });
  res.json({ success: true, data: { messages: recent } });
};

const postMessage = (req, res, io) => {
  const { content } = req.body;
  const message = new Message(content.trim(), req.session.userId);
  globalMessages.push(message);

  const sender = users.get(message.sender);
  const msgData = {
    _id: message.id,
    content: message.content,
    messageType: message.messageType,
    reactions: [],
    sender: { username: sender?.username || 'Unknown' },
    createdAt: message.createdAt
  };

  io.emit('new-message', msgData);

  res.json({ success: true, data: { message: msgData } });
};

const getOnlineUsers = (req, res) => {
  const online = Array.from(connectedUsers.values()).map(u => ({
    id: u.id,
    username: u.username
  }));
  res.json({ success: true, data: { users: online } });
};

const createDemoData = () => {
  const demo1 = new User('Alice', 'alice@example.com', 'password');
  const demo2 = new User('Bob', 'bob@example.com', 'password');
  users.set(demo1.id, demo1);
  users.set(demo2.id, demo2);

  const welcome = new Message('Welcome to DevChat! 🚀', demo1.id);
  globalMessages.push(welcome);
};

module.exports = {
  register,
  login,
  me,
  logout,
  getMessages,
  postMessage,
  getOnlineUsers,
  createDemoData,
  users,
  connectedUsers
};
