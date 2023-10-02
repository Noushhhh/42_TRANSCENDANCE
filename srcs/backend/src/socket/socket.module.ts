import { Module } from "@nestjs/common";
import { SocketEvents } from "./SocketEvents";
import { SocketService } from "./socket.service";
import { ChatService } from "../chat/chat.service";

@Module({
    providers:[SocketEvents, SocketService, ChatService],
})
export class SocketModule {};