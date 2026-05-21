import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { initializeSocketMarket } from './controllers/socket/SocketMarketController';
import { startMarketWorker } from './workers/jobs/marketWorker';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

async function startServer() {
  try {
    // 1. Boot up core infrastructure
    await initializeDatabase();
    console.log('✅ PostgreSQL connected');

    await initializeRedis();
    console.log('✅ Redis connected');

    // 2. Attach real-time controllers
    initializeSocketMarket(io);
    console.log('✅ WebSockets initialized');

    startMarketWorker();

    // 3. Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Political Sim Server is running on port ${PORT}`);
      console.log(`📊 Admin Panel accessible at http://localhost:${PORT}/admin`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
