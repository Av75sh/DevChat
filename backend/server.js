const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const { createDemoData } = require('./controllers/chatController');

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_ORIGIN 
  ? process.env.CLIENT_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

console.log('🌐 Allowed origins:', allowedOrigins);

const sessionMiddleware = session({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false, 
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(sessionMiddleware);

const io = socketIo(server, {
  cors: { 
    origin: allowedOrigins, 
    methods: ['GET', 'POST'], 
    credentials: true 
  }
});

io.engine.use(sessionMiddleware);

app.get('/', (req, res) => {
  res.json({ 
    message: 'DevChat Server running ✅',
    allowedOrigins: allowedOrigins,
    sessionActive: !!req.session.userId
  });
});

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const setupSocket = require('./sockets');

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID} - User: ${req.session.userId || 'none'}`);
  next();
});

console.log('Mounting /api/auth routes...');
app.use('/api/auth', authRoutes);

console.log('Mounting /api routes...');
const chatRouter = chatRoutes(io);
app.use('/api', chatRouter);

console.log('Routes mounted successfully!');
setupSocket(io);
createDemoData();

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Secure cookies: ${process.env.NODE_ENV === 'production'}`);
});