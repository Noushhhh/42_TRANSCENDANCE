import { Get, Post, Body, Controller, Param, HttpException, HttpStatus, UseGuards, Query } from "@nestjs/common";
import {
    ChannelNameDto, PairUserIdChannelId, SignUpChannelDto, ManageChannelTypeDto,
    pairUserId, UserIdDto, ManagePasswordDto, ChannelIdDto, ChannelIdPostDto, LeaveChannelDto, muteDto, MessageToStoreDto
} from "./dto/chat.dto";
import { IsIn, IsNumber, IsString, IsInt, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatService } from "./chat.service";
import { Message, User } from "@prisma/client";
import { ChannelType } from "@prisma/client";
import './interfaces/chat.interface';
import { AdminGuard } from "./guards/admin.guards";
import { OwnerGuard } from "./guards/owner.guards";
import { ParseIntPipe } from "@nestjs/common";

export class ChannelDTO {
    @IsString()
    name!: string;

    @IsString()
    password!: string;

    @IsNumber()
    @Type(() => Number)
    ownerId!: number;

    @IsNumber({}, { each: true })
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

    @IsNumber({}, { each: true })
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
        @Body() userIdDto: UserIdDto) {
        return this.chatService.getAllConvFromId(userIdDto.userId);
    }

    @Get('getChannelName')
    async getChannelName(
        @Query() dto: PairUserIdChannelId): Promise<string> {
        return this.chatService.getChannelName(dto.channelId, dto.userId);
    }

    @Get('getChannelHeader')
    async getChannelHeadersFromUserId(
        @Query() dto: PairUserIdChannelId): Promise<ChannelLight> {
        return this.chatService.getChannelHeadersFromId(dto.channelId, dto.userId);
    }

    @Get('getAllMessagesByChannelId')
    async getAllMessagesByChannelId(
        @Query() dto: PairUserIdChannelId): Promise<Message[]> {
        return this.chatService.getAllMessagesByChannelId(dto.channelId, dto.userId);
    }

    @Post('addMessageToChannel')
    async addMessageToChannelId(
        @Body() message: MessageToStoreDto) {
            return this.chatService.addMessageToChannelId(message);
    }

    @Get('getUsersFromChannelId')
    async getUsersFromChannelId(
        @Query() dto: ChannelIdDto): Promise<User[]> {
        return this.chatService.getUsersFromChannelId(dto.channelId);
    }

    @Get('getLoginsInChannelFromSubstring/:channelId/:substring/:userId')
    async getLoginsInChannelFromSubstring(
        @Param('substring') substring: string,
        @Param('channelId') channelId: number,
        @Param('userId') userId: number): Promise<User[]> {
        return this.chatService.getLoginsInChannelFromSubstring(channelId, substring, userId)
    }

    @Get('getLoginsFromSubstring/:substring')
    async getLoginsFromSubstring(@Param('substring') substring: string): Promise<User[]> {
        return this.chatService.getLoginsFromSubstring(substring)
    }

    @Post('addChannelToUser')
    async addChannelToUser(@Body() channelInfo: CreateChannelDto): Promise<number> {
        try {
            return this.chatService.addChannelToUser(channelInfo);
        } catch (error) {
            throw new HttpException('Cannot find channel', HttpStatus.NOT_FOUND);
        }
    }

    @Get('isAdmin')
    async isAdmin(
        @Query() dto: PairUserIdChannelId): Promise<boolean> {
        return this.chatService.isAdmin(dto.userId, dto.channelId);
    }

    @Get('isOwner')
    async isOwner(
        @Query() dto: PairUserIdChannelId): Promise<boolean> {
        return this.chatService.isAdmin(dto.userId, dto.channelId);
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
        @Body() dto: LeaveChannelDto): Promise<boolean> {
        return this.chatService.leaveChannel(dto.userId, dto.channelId, dto.newOwnerId);
    }

    @Get('getNumberUsersInChannel/:channelId')
    async getNumberUsersInChannel(
        @Param('channelId') channelId: number): Promise<number> {
        return this.chatService.getNumberUsersInChannel(channelId);
    }

    @Get('getAdmins')
    async getAdmins(
        @Query() dto: ChannelIdPostDto): Promise<User[]> {
        console.log(dto);
        return this.chatService.getAdmins(dto.channelId);
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
        @Param('channelId') channelId: number): Promise<number> {
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
        @Body() userIdDto: UserIdDto): Promise<number[]> {
        return this.chatService.getBlockedUsersById(userIdDto.userId);
    }

    @UseGuards(OwnerGuard)
    @Post('manageChannelPassword')
    async manageChannelPassword(
        @Body() data: ManagePasswordDto) {
        return this.chatService.manageChannelPassword(data.channelId, data.channelType, data.actualPassword, data.newPassword);
    }

    @UseGuards(OwnerGuard)
    @Post('manageChannelType')
    async manageChannelType(
        @Body() data: ManageChannelTypeDto) {
        return this.chatService.manageChannelType(data.channelId, data.channelType);
    }

    @UseGuards(OwnerGuard)
    @Post('getChannelType')
    async getChannelType(
        @Body() data: ChannelIdDto) {
        return this.chatService.getChannelType(data.channelId);
    }

    @Post('isMute')
    async isMute(
        @Body() dto: PairUserIdChannelId): Promise<{isMuted: boolean, rowId: number}>{
        return this.chatService.isMute(dto);
    }

    @Post('mute')
    async mute(
        @Body() dto: muteDto) {
        return this.chatService.mute(dto);
    }

}
