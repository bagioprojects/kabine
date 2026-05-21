import { Server, Socket } from 'socket.io';
import { MarketHandler } from './handlers/MarketHandler';
import { PoliticsHandler } from './handlers/PoliticsHandler';

export class SocketManager {
  private io: Server;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      transports: ['websocket', 'polling']
    });

    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket] User connected: ${socket.id}`);

      // Middleware or authentication can go here
      // const userId = socket.handshake.auth.token...

      // Register Handlers
      MarketHandler.register(this.io, socket);
      PoliticsHandler.register(this.io, socket);

      socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${socket.id}`);
      });
    });
  }

  // Utility to emit global events from HTTP controllers
  public broadcastGlobal(event: string, payload: any) {
    this.io.emit(event, payload);
  }
}
