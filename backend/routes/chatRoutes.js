const express = require('express');
const { getMessages, postMessage, getOnlineUsers } = require('../controllers/chatController');

module.exports = function(io) {
  const router = express.Router();
  
  router.get('/messages', getMessages);
  router.post('/messages', function(req, res) {
    postMessage(req, res, io);
  });
  router.get('/users/online', getOnlineUsers);

  return router;
};