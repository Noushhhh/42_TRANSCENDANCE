import { Get, Post, Body, Controller, UseGuards, Query } from "@nestjs/common";
import {
    ChannelNameDto, PairUserIdChannelId, SignUpChannelDto, ManageChannelTypeDto,
    UserIdDto, ManagePasswordDto, ChannelIdDto, ChannelIdPostDto, LeaveChannelDto, muteDto, MessageToStoreDto, getChannelUsernamesDto,
    getUsernamesDto, KickOrBanChannelDto, ManageAdminDto, CreateChannelDto
} from "./dto/chat.dto";
import { ChatService } from "./chat.service";
import { Message, User } from "@prisma/client";
import { ChannelType } from "@prisma/client";
import './interfaces/chat.interface';
import { AdminGuard } from "./guards/admin.guards";
import { OwnerGuard } from "./guards/owner.guards";
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { GetUser } from "../auth/decorator/get-user.decorator";

interface isChannelExist {
    isExist: boolean,
    channelType: ChannelType,
    id: number,
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    
    constructor(private chatService: ChatService) { };
    
    @Post('getAllConvFromId')
    async getAllConvFromId(@GetUser('id') userId: number): Promise<number[]> {
        return this.chatService.getAllConvFromId(userId);
    }

    @Get('getChannelName')
    async getChannelName(
        @GetUser('id') userId: number,
        @Query() dto: ChannelIdDto): Promise<string | null> {
        return this.chatService.getChannelName(dto.channelId, userId);
    }

    @Get('getChannelHeader')
    async getChannelHeadersFromUserId(
        @GetUser('id') userId: number,
        @Query() dto: ChannelIdDto): Promise<ChannelLight> {
        return this.chatService.getChannelHeadersFromId(dto.channelId, userId);
    }

    @Get('getAllMessagesByChannelId')
    async getAllMessagesByChannelId(
        @GetUser('id') userId: number,
        @Query() dto: ChannelIdDto): Promise<Message[]> {
        return this.chatService.getAllMessagesByChannelId(dto.channelId, userId);
    }

    @Post('addMessageToChannel')
    async addMessageToChannelId(
        @GetUser('id') userId: number,
        @Body() message: MessageToStoreDto) {
        return this.chatService.addMessageToChannelId(message, userId);
    }

    @Get('getUsersFromChannelId')
    async getUsersFromChannelId(
        @Query() dto: ChannelIdDto): Promise<User[]> {
        return this.chatService.getUsersFromChannelId(dto.channelId);
    }

    @Get('getUsernamesInChannelFromSubstring')
    async getUsernamesInChannelFromSubstring(
        @GetUser('id') userId: number,
        @Query() dto: getChannelUsernamesDto): Promise<User[]> {
        return this.chatService.getUsernamesInChannelFromSubstring(dto.channelId, dto.substring, userId)
    }

    @Get('getUsernamesFromSubstring')
    async getUsernamesFromSubstring(
        @Query() dto: getUsernamesDto): Promise<User[]> {
        return this.chatService.getUsernamesFromSubstring(dto.substring)
    }

    @Post('addChannelToUser')
    async addChannelToUser(
        @GetUser('id') ownerId: number,
        @Body() channelInfo: CreateChannelDto): Promise<number> {
        return this.chatService.addChannelToUser(channelInfo, ownerId);
    }

    @Get('isOwner')
    async isOwner(
        @GetUser('id') userId: number,
        @Query() dto: ChannelIdDto): Promise<boolean> {
        return this.chatService.isOwner(userId, dto.channelId);
    }

    @UseGuards(AdminGuard)
    @Post('kickUserFromChannel')
    async kickUserFromChannel(
        @GetUser('id') userId: number,
        @Body() dto: KickOrBanChannelDto): Promise<boolean> {
        return this.chatService.kickUserFromChannel(dto.targetId, dto.channelId, userId);
    }

    @UseGuards(AdminGuard)
    @Post('banUserFromChannel')
    async banUserFromChannel(
        @GetUser('id') userId: number,
        @Body() dto: KickOrBanChannelDto): Promise<boolean> {
        return this.chatService.banUserFromChannel(dto.targetId, dto.channelId, userId);
    }

    @Post('leaveChannel')
    async leaveChannel(
        @GetUser('id') userId: number,
        @Body() dto: LeaveChannelDto): Promise<boolean> {
        return this.chatService.leaveChannel(userId, dto.channelId, dto.newOwnerId);
    }

    @Get('getNumberUsersInChannel')
    async getNumberUsersInChannel(
        @Query() dto: ChannelIdDto): Promise<number> {
        return this.chatService.getNumberUsersInChannel(dto.channelId);
    }

    @Get('getAdmins')
    async getAdmins(
        @Query() dto: ChannelIdPostDto): Promise<User[]> {
        return this.chatService.getAdmins(dto.channelId);
    }

    @UseGuards(AdminGuard)
    @Post('addAdminToChannel')
    async addAdminToChannel(
        @GetUser('id') userId: number,
        @Body() dto: ManageAdminDto): Promise<boolean> {
        return this.chatService.addAdminToChannel(userId, dto.invitedId, dto.channelId);
    }

    @UseGuards(AdminGuard)
    @Post('removeAdminFromChannel')
    async removeAdminFromChannel(
        @GetUser('id') userId: number,
        @Body() dto: ManageAdminDto): Promise<boolean> {
        return this.chatService.removeAdminFromChannel(userId, dto.invitedId, dto.channelId);
    }

    @Post('addUserToChannel')
    async addUserToChannel(
        @GetUser('id') callerId: number,
        @Body() dto: PairUserIdChannelId): Promise<number> {
        return this.chatService.addUserToChannel(dto.userId, dto.channelId, callerId);
    }

    @Post('addUserToProtectedChannel')
    async addUserToProtectedChannel(
        @GetUser('id') userId: number,
        @Body() data: SignUpChannelDto): Promise<void> {
        return this.chatService.addUserToProtectedChannel(data.channelId, data.password, userId);
    }

    @Post('isChannelNameExist')
    async isChannelNameExist(
        @Body() dto: ChannelNameDto): Promise<isChannelExist | false> {
        return this.chatService.isChannelNameExist(dto.channelName);
    }

    @Post('isUserIsBan')
    async isUserIsBan(
        @GetUser('id') userId: number,
        @Body() pair: ChannelIdDto): Promise<boolean> {
        return this.chatService.isUserIsBan(pair.channelId, userId);
    }

    @Post('blockUser')
    async blockUser(
        @GetUser('id') userId: number,
        @Body() target: UserIdDto) {
        return this.chatService.blockUser(userId, target.userId);
    }

    @Post('unblockUser')
    async unblockUser(
        @GetUser('id') userId: number,
        @Body() target: UserIdDto) {
        return this.chatService.unblockUser(userId, target.userId);
    }

    @Post('isUserIsBlockedBy')
    async isUserIsBlockedBy(
        @GetUser('id') userId: number,
        @Body() target: UserIdDto): Promise<boolean> {
        return this.chatService.isUserIsBlockedBy(userId, target.userId);
    }

    @Post('getBlockedUsersById')
    async getBlockedUsersById(
        @GetUser('id') userId: number): Promise<number[]> {
        return this.chatService.getBlockedUsersById(userId);
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

    @UseGuards(AdminGuard)
    @Post('mute')
    async mute(
        @GetUser('id') callerId: number,
        @Body() dto: muteDto) {
        return this.chatService.mute(callerId, dto);
    }

}
