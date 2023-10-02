import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { SocketService } from "./socket.service";
import { ChatService } from "../chat/chat.service";

@Module({
    providers:[ChatGateway, SocketService, ChatService],
})
export class SocketModule {};