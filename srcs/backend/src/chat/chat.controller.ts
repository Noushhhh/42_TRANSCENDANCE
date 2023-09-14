import { Get, Post, Body, Controller, Param, HttpException, HttpStatus } from "@nestjs/common";
import { ChannelNameDto, PairUserIdChannelId, SignUpChannelDto } from "./dto/chat.dto";
import { ChatService } from "./chat.service";
import { Message, User } from "@prisma/client";
import { ChannelType } from "@prisma/client";
import './interfaces/chat.interface';

interface channelToAdd {
    name: string,
    password: string,
    ownerId: number,
    participants: number[],
    type: string,
}

interface MessageToStore {
    channelId: number;
    content: string;
    senderId: number;
}

interface isChannelExist{
    isExist: boolean,
    channelType: ChannelType,
    id: number,
}

@Controller('chat')
export class ChatController {

    constructor(private chatService: ChatService) { };

    @Get('getAllConvFromId/:id')
    getAllConvFromId(@Param('id') id: number) {
        return this.chatService.getAllConvFromId(id);
    }

    @Post('addChannel')
    async addChannel() {
        await this.chatService.addChannel();
    }

    @Post('addMessage')
    async addMessage() {
        await this.chatService.addMessage();
    }

    @Get('getLastMsg/:id')
    async getLastMessage(@Param('id') id: number) {
        return this.chatService.getLastMessage(id);
    }

    @Get('getChannelHeader/:id')
    async getChannelHeadersFromUserId(@Param('id') id: number): Promise<ChannelLight> {
        return this.chatService.getChannelHeadersFromId(id);
    }

    @Get('getAllMessagesByChannelId/:id')
    async getAllMessagesByChannelId(@Param('id') id: number): Promise<Message[]> {
        try {
            const messages = this.chatService.getAllMessagesByChannelId(id);
            return messages;
        } catch (error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }

    @Post('addMessageToChannel/:id')
    async addMessageToChannelId(
        @Param('id') id: number,
        @Body() message: MessageToStore) {
        try {
            return this.chatService.addMessageToChannelId(id, message);
        } catch (error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }

    @Get('getUsersFromChannelId/:id')
    async getUsersFromChannelId(@Param('id') id: number): Promise<User[]> {
        return this.chatService.getUsersFromChannelId(id);
    }

    @Get('getLoginsInChannelFromSubstring/:channelId/:substring')
    async getLoginsInChannelFromSubstring(
        @Param('substring') substring: string,
        @Param('channelId') channelId: number): Promise<User[]> {
        return this.chatService.getLoginsInChannelFromSubstring(channelId, substring)
    }

    @Get('getLoginsFromSubstring/:substring')
    async getLoginsFromSubstring(@Param('substring') substring: string): Promise<User[]> {
        return this.chatService.getLoginsFromSubstring(substring)
    }

    @Post('addChannelToUser')
    async addChannelToUser(@Body() channelInfo: channelToAdd) {
        try {
            return this.chatService.addChannelToUser(channelInfo);
        } catch (error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }

    @Get('isAdmin/:userId/:channelId')
    async isAdmin(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number): Promise<boolean> {
        return this.chatService.isAdmin(userId, channelId);
    }

    @Post('kickUserFromChannel/:userId/:channelId/:callerId')
    async kickUserFromChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number,
        @Param('callerId') callerId: number): Promise<boolean> {
        return this.chatService.kickUserFromChannel(userId, channelId, callerId);
    }

    @Post('banUserFromChannel/:userId/:channelId/:callerId')
    async banUserFromChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number,
        @Param('callerId') callerId: number): Promise<boolean> {
        return this.chatService.banUserFromChannel(userId, channelId, callerId);
    }

    @Post('leaveChannel/:userId/:channelId')
    async leaveChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number): Promise<boolean> {
        return this.chatService.leaveChannel(userId, channelId);
    }

    @Get('getNumberUsersInChannel/:channelId')
    async getNumberUsersInChannel(
        @Param('channelId') channelId: number): Promise<number> {
        return this.chatService.getNumberUsersInChannel(channelId);
    }

    @Get('getAdmins/:channelId')
    async getAdmins(
        @Param('channelId') channelId: number): Promise<User[]> {
        return this.chatService.getAdmins(channelId);
    }

    @Get('isUserIsInChannel/:userId/:channelId')
    async isUserIsInChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number): Promise<boolean> {
        return this.chatService.isUserIsInChannel(userId, channelId);
    }

    @Post('addAdminToChannel/:inviterId/:invitedId/:channelId')
    async addAdminToChannel(
        @Param('inviterId') inviterId: number,
        @Param('invitedId') invitedId: number,
        @Param('channelId') channelId: number): Promise<boolean> {
        return this.chatService.addAdminToChannel(inviterId, invitedId, channelId);
    }

    @Post('removeAdminFromChannel/:inviterId/:invitedId/:channelId')
    async removeAdminFromChannel(
        @Param('inviterId') inviterId: number,
        @Param('invitedId') invitedId: number,
        @Param('channelId') channelId: number): Promise<boolean> {
        return this.chatService.removeAdminFromChannel(inviterId, invitedId, channelId);
    }

    @Post('addUserToChannel/:userId/:channelId')
    async addUserToChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number): Promise<void> {
        return this.chatService.addUserToChannel(userId, channelId);
    }

    @Post('addUserToProtectedChannel')
    async addUserToProtectedChannel(
        @Body() data: SignUpChannelDto): Promise<void>{
            return this.chatService.addUserToProtectedChannel(data.channelId, data.password, data.userId);
        }

    @Post('isChannelNameExist')
    async isChannelNameExist(
        @Body() channelNameDto: ChannelNameDto): Promise<isChannelExist | false>{
            return this.chatService.isChannelNameExist(channelNameDto.channelName);
        }

    @Post('isUserIsBan')
    async isUserIsBan(
        @Body() pair: PairUserIdChannelId): Promise<boolean>{
            console.log(`isUserIsBan called with userId: ${pair.userId} and channelId: ${pair.channelId}`);
            return this.chatService.isUserIsBan(pair.channelId, pair.userId);
        }
}
