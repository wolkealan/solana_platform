const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const connectionRoutesFactory = require('./routes/connectionRoutes');
const messageRoutesFactory = require('./routes/messageRoutes');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutesFactory(io)); // Pass io to connectionRoutes
app.use('/api/messages', messageRoutesFactory(io)); // Pass io to messageRoutes

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (walletAddress) => {
    socket.join(walletAddress); // Join a room based on wallet address
    console.log(`${walletAddress} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});