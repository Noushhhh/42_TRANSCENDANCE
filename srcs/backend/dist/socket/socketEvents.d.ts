import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { OnModuleInit } from '@nestjs/common';
import { SocketService } from './socket.service';
export declare class SocketEvents implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly socketService;
    server: Server;
    constructor(socketService: SocketService);
    onModuleInit(): void;
    handleConnection(socket: Socket): void;
    listUserConnected: Map<number, string>;
    readMap(map: Map<number, string>): void;
    handleSetNewUserConnected(userId: number, client: Socket): void;
    handleIsUserConnected(userId: number, client: Socket): boolean;
    handleDisconnect(client: Socket): void;
    handleMessage(data: Message, client: Socket): void;
}
