import { Get, Post, Body, Controller, Param, HttpException, HttpStatus, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Message, Channel, User } from "@prisma/client";
import './interfaces/chat.interface';

interface channelToAdd{
    name: string,
    password: string
    ownerId: number,
    participants: number[],
    type: string,
}

interface MessageToStore{
    channelId: number;
      content: string;
      senderId: number;
  }

@Controller('chat')
export class ChatController{

    constructor(private chatService: ChatService) {};

    @Get('getAllConvFromId/:id')
    getAllConvFromId(@Param('id')id: number){
        return this.chatService.getAllConvFromId(id);
    }

    @Post('addChannel')
    async addChannel(){
        console.log('add channel...');
        await this.chatService.addChannel();
    }

    @Post('addMessage')
    async addMessage(){
        await this.chatService.addMessage();
    }

    @Get('getLastMsg/:id')
    async getLastMessage(@Param('id')id: number){
        console.log('getLastMsg is called...');
        return this.chatService.getLastMessage(id);
    }

    @Get('getChannelHeader/:id')
    async getChannelHeadersFromUserId(@Param('id')id: number): Promise <ChannelLight>{
        return this.chatService.getChannelHeadersFromId(id);
    }

    @Get('getAllMessagesByChannelId/:id')
    async getAllMessagesByChannelId(@Param('id')id: number): Promise<Message[]>{
        try {
            const messages = this.chatService.getAllMessagesByChannelId(id);
            return messages;
        } catch(error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }

    @Post('addMessageToChannel/:id')
    async addMessageToChannelId(
        @Param('id')id: number,
        @Body() message: MessageToStore){
        try {
            return this.chatService.addMessageToChannelId(id, message);
        } catch (error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }

    @Get('getUsersFromChannelId/:id')
    async getUsersFromChannelId(@Param('id')id: number): Promise<User[]>{
        return this.chatService.getUsersFromChannelId(id);
    }

    @Get('getLoginsFromSubstring/:substring')
    async getLoginsFromSubstring(@Param('substring')substring: string): Promise<{username: string, id:number}[]>{
        return this.chatService.getLoginsFromSubstring(substring)
    }

    @Post('addChannelToUser')
    async addChannelToUser(@Body() channelInfo: channelToAdd)
    {
        console.log("addChannelToUser called");
        try {
            return this.chatService.addChannelToUser(channelInfo);
        } catch (error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }
}
