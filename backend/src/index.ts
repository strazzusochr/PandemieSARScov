import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

// Cloud Logic: Forward to Python AI Engine
const AI_ENGINE_URL = 'http://localhost:8000';

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Forward request to Python AI
  socket.on('request_ai_action', async (data) => {
    console.log('--- AI REQUEST RECEIVED FROM CLIENT:', socket.id);
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/decide`, data);
      console.log('--- AI ENGINE RESPONSE:', response.data.suggested_action);
      socket.emit('ai_action_received', response.data);
      console.log('--- SENT TO CLIENT:', socket.id);
    } catch (error: any) {
      console.error('--- AI ERROR:', error.message);
      socket.emit('ai_error', { message: 'AI Engine unreachable' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`V4 Backend running on port ${PORT}`);
});
