import { Server, Socket } from 'socket.io';

export class MarketHandler {
  public static register(io: Server, socket: Socket) {
    socket.on('market:subscribe', (data: any) => {
      socket.join('market:ticker');
    });
  }
}
