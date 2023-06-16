import { Controller } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Get, Post, Body } from "@nestjs/common";

@Controller('chat')
export class ChatController{

    constructor(private chatService: ChatService) {};

    @Get('test')
    getTest(): string{
        return 'ok mec on est laaaaa';
    }

    // @Get('storemsg')
    // gethello(){
    //     this.chatService.storeMessage();
    // }

}
