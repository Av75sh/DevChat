const { users } = require('../controllers/chatController');

const isAuthenticated = (req, res, next) => {
  const user = users.get(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  req.user = user;
  next();
};

module.exports = isAuthenticated;
