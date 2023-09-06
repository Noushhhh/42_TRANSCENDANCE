import { Socket } from 'socket.io';
export declare class SocketService {
    private socketMap;
    setSocket(clientId: string, socket: Socket): void;
    getSocket(clientId: string): Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
    removeSocket(clientId: string): void;
}
