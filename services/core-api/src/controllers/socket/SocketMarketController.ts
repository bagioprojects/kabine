import { Server, Socket } from 'socket.io';

export function initializeSocketMarket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Citizen connected to market websocket: ${socket.id}`);

    socket.on('join:market', (data: any) => {
      socket.join('market:updates');
      console.log(`📈 Citizen joined market updates: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Citizen disconnected from market: ${socket.id}`);
    });
  });
}
