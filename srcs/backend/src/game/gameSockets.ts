import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class gameSockets {
  private socketMap: Map<string, Socket> = new Map();
  server!: Server;

  setSocket(clientId: string, socket: Socket) {
    this.socketMap.set(clientId, socket);
  }

  getSocket(clientId: string) {
    return this.socketMap.get(clientId);
  }

  removeSocket(clientId: string) {
    this.socketMap.delete(clientId);
  }
}