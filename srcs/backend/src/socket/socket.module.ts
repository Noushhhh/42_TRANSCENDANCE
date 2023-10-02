import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { ChatService } from "../chat/chat.service";

@Module({
    providers:[SocketService, ChatService],
})
export class SocketModule {};