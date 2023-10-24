import { Module } from "@nestjs/common";
import { ChatService } from "../chat/chat.service";
import { SocketService } from "./socket.service";

@Module({
    providers:[ChatService, SocketService],
})
export class SocketModule {};