import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketEvents {

    
    

    

}
