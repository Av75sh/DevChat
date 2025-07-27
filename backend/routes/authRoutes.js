const express = require('express');
const router = express.Router();
const {
  register, login, logout, me
} = require('../controllers/chatController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.post('/logout', logout);

module.exports = router;
