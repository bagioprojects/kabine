import { Server, Socket } from 'socket.io';

export class PoliticsHandler {
  public static register(io: Server, socket: Socket) {
    socket.on('politics:subscribe', (data: any) => {
      socket.join('politics:news');
    });
  }
}
