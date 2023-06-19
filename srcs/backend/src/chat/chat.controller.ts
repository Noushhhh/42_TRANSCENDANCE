import { Get, Post, Body, Controller, Param } from "@nestjs/common";
import { ChatService } from "./chat.service";
import './interfaces/chat.interface';

@Controller('chat')
export class ChatController{

    constructor(private chatService: ChatService) {};

    @Get('getAllConvFromId/:id')
    getAllConvFromId(@Param('id')id: number){
        return this.chatService.getAllConvFromId(id);
    }

    @Post('addChannel')
    async addChannel(){
        await this.chatService.addChannel();
    }

    @Post('addMessage')
    async addMessage(){
        await this.chatService.addMessage();
    }

    @Get('getLastMsg/:id')
    async getLastMessage(@Param('id')id: number){
        return this.chatService.getLastMessage(id);
    }

    @Get('getChannelHeader/:id')
    async getChannelHeadersFromUserId(@Param('id')id: number): Promise <ChannelType>{
        return this.chatService.getChannelHeadersFromId(id);
    }

}
