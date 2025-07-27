const express = require('express');
const {
  getMessages,
  postMessage,
  getOnlineUsers
} = require('../controllers/chatController');
const isAuthenticated  = require('../middleware/authMiddleware');

module.exports = (io) => {
  const router = express.Router();

  router.get('/messages', isAuthenticated, getMessages);
  router.post('/messages', isAuthenticated, (req, res) => postMessage(req, res, io));
  router.get('/users/online', isAuthenticated, getOnlineUsers);

  return router;
};
