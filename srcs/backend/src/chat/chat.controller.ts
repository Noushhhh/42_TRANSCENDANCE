import { Get, Post, Body, Controller, Param, HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import { ChannelNameDto, PairUserIdChannelId, SignUpChannelDto, pairUserId, UserIdDto, ChannelIdDto } from "./dto/chat.dto";
import { IsIn, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatService } from "./chat.service";
import { Message, User } from "@prisma/client";
import { ChannelType } from "@prisma/client";
import './interfaces/chat.interface';
import { AdminGuard } from "./guards/admin.guards";

export class ChannelDTO {
    @IsString()
    name!: string;
  
    @IsString()
    password!: string;
  
    @IsNumber()
    @Type(() => Number)
    ownerId!: number;
  
    @IsNumber({},{each: true})
    participants!: number[];
  
    @IsString()
    type!: string;
}

export class CreateChannelDto {
    @IsString()
    name!: string;

    @IsString()
    password!: string;

    @IsNumber()
    @Type(() => Number)
    ownerId!: number;

    @IsNumber({},{each: true})
    participants!: number[];
    
    @IsIn(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED']) // Remplacez ceci par les valeurs de type autorisées
    type!: string;
}

interface MessageToStore {
    channelId: number;
    content: string;
    senderId: number;
}

interface isChannelExist {
    isExist: boolean,
    channelType: ChannelType,
    id: number,
}

@Controller('chat')
export class ChatController {

    constructor(private chatService: ChatService) { };

    @Post('getAllConvFromId')
    async getAllConvFromId(
        @Body()userIdDto: UserIdDto) {
        return this.chatService.getAllConvFromId(userIdDto.userId);
    }

    @Get('getLastMsg/:id')
    async getLastMessage(@Param('id') id: number) {
        return this.chatService.getLastMessage(id);
    }

    @Post('getChannelName')
    async getChannelName(
        @Body() data: PairUserIdChannelId): Promise<string>{
        return this.chatService.getChannelName(data.channelId, data.userId);
    }
    
    @Post('getChannelHeader')
    async getChannelHeadersFromUserId(@Body()pair: PairUserIdChannelId): Promise<ChannelLight> {
        return this.chatService.getChannelHeadersFromId(pair.channelId, pair.userId);
    }

    @Post('getAllMessagesByChannelId')
    async getAllMessagesByChannelId(
        @Body() PairIdDto: PairUserIdChannelId): Promise<Message[]> {
        try {
            const messages = this.chatService.getAllMessagesByChannelId(PairIdDto.userId, PairIdDto.channelId);
            return messages;
        } catch (error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }

    @Post('addMessageToChannel')
    async addMessageToChannelId(
        @Body() message: MessageToStore) {
        try {
            return this.chatService.addMessageToChannelId(message);
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
    async addChannelToUser(@Body() channelInfo: CreateChannelDto) {
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

    @UseGuards(AdminGuard)
    @Post('kickUserFromChannel/:userId/:channelId/:callerId')
    async kickUserFromChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number,
        @Param('callerId') callerId: number): Promise<boolean> {
        console.log("kick user called");
        return this.chatService.kickUserFromChannel(userId, channelId, callerId);
    }

    @UseGuards(AdminGuard)
    @Post('banUserFromChannel/:userId/:channelId/:callerId')
    async banUserFromChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number,
        @Param('callerId') callerId: number): Promise<boolean> {
        return this.chatService.banUserFromChannel(userId, channelId, callerId);
    }

    @Post('leaveChannel')
    async leaveChannel(
        @Body() pair: PairUserIdChannelId): Promise<boolean> {
        return this.chatService.leaveChannel(pair.userId, pair.channelId);
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

    @UseGuards(AdminGuard)
    @Post('addAdminToChannel/:inviterId/:invitedId/:channelId')
    async addAdminToChannel(
        @Param('inviterId') inviterId: number,
        @Param('invitedId') invitedId: number,
        @Param('channelId') channelId: number): Promise<boolean> {
        return this.chatService.addAdminToChannel(inviterId, invitedId, channelId);
    }

    @UseGuards(AdminGuard)
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
        @Body() data: SignUpChannelDto): Promise<void> {
        return this.chatService.addUserToProtectedChannel(data.channelId, data.password, data.userId);
    }

    @Post('isChannelNameExist')
    async isChannelNameExist(
        @Body() channelNameDto: ChannelNameDto): Promise<isChannelExist | false> {
        return this.chatService.isChannelNameExist(channelNameDto.channelName);
    }

    @Post('isUserIsBan')
    async isUserIsBan(
        @Body() pair: PairUserIdChannelId): Promise<boolean> {
        return this.chatService.isUserIsBan(pair.channelId, pair.userId);
    }

    @Post('blockUser')
    async blockUser(
        @Body() pairIdDto: pairUserId) {
        return this.chatService.blockUser(pairIdDto.callerId, pairIdDto.targetId);
    }

    @Post('unblockUser')
    async unblockUser(
        @Body() pairIdDto: pairUserId) {
        return this.chatService.unblockUser(pairIdDto.callerId, pairIdDto.targetId);
    }

    @Post('isUserIsBlockedBy')
    async isUserIsBlockedBy(
        @Body() pairIdDto: pairUserId) {
            return this.chatService.isUserIsBlockedBy(pairIdDto.callerId, pairIdDto.targetId);
        }

    @Post('getBlockedUsersById')
    async getBlockedUsersById(
        @Body() userIdDto: UserIdDto): Promise<number[]>{
            return this.chatService.getBlockedUsersById(userIdDto.userId);
        }
}
