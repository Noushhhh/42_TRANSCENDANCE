import { Module } from "@nestjs/common";
import { SocketEvents } from "./socketEvents";
import { SocketService } from "./socket.service";

@Module({
    providers:[SocketEvents, SocketService],
})
export class SocketModule {};