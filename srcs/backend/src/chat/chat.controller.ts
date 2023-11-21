import { Get, Post, Body, Controller, Param, HttpException, HttpStatus, UseGuards, Query } from "@nestjs/common";
import {
    ChannelNameDto, PairUserIdChannelId, SignUpChannelDto, ManageChannelTypeDto,
    pairUserId, UserIdDto, ManagePasswordDto, ChannelIdDto, ChannelIdPostDto, LeaveChannelDto, muteDto, MessageToStoreDto, getChannelUsernamesDto,
    getUsernamesDto, KickOrBanChannelDto, ManageAdminDto
} from "./dto/chat.dto";
import { IsIn, IsNumber, IsString, IsInt, Min, IsDate, Max, maxLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatService } from "./chat.service";
import { Message, User } from "@prisma/client";
import { ChannelType } from "@prisma/client";
import './interfaces/chat.interface';
import { AdminGuard } from "./guards/admin.guards";
import { OwnerGuard } from "./guards/owner.guards";
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';

export class ChannelDTO {
    @IsString()
    @MaxLength(35)
    name!: string;

    @IsString()
    @MaxLength(35)
    password!: string;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(2000000)
    ownerId!: number;

    @IsNumber({}, { each: true })
    participants!: number[];

    @IsString()
    type!: string;
}

export class CreateChannelDto {
    @IsString()
    @MaxLength(35)
    name!: string;

    @IsString()
    @MaxLength(35)
    password!: string;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(2000000)
    ownerId!: number;

    @IsNumber({}, { each: true })
    participants!: number[];

    @IsIn(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED'])
    type!: string;
}

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

    @Get('getUsernamesInChannelFromSubstring')
    async getUsernamesInChannelFromSubstring(
        @Query() dto: getChannelUsernamesDto): Promise<User[]> {
        return this.chatService.getUsernamesInChannelFromSubstring(dto.channelId, dto.substring, dto.userId)
    }

    @Get('getUsernamesFromSubstring')
    async getUsernamesFromSubstring(
        @Query() dto: getUsernamesDto): Promise<User[]> {
        return this.chatService.getUsernamesFromSubstring(dto.substring)
    }

    @Post('addChannelToUser')
    async addChannelToUser(
        @Body() channelInfo: CreateChannelDto): Promise<number> {
        return this.chatService.addChannelToUser(channelInfo);
    }

    @Get('isOwner')
    async isOwner(
        @Query() dto: PairUserIdChannelId): Promise<boolean> {
        return this.chatService.isOwner(dto.userId, dto.channelId);
    }

    @UseGuards(AdminGuard)
    @Post('kickUserFromChannel')
    async kickUserFromChannel(
        @Body() dto: KickOrBanChannelDto): Promise<boolean> {
        return this.chatService.kickUserFromChannel(dto.userId, dto.channelId, dto.callerId);
    }

    @UseGuards(AdminGuard)
    @Post('banUserFromChannel')
    async banUserFromChannel(
        @Body() dto: KickOrBanChannelDto): Promise<boolean> {
        return this.chatService.banUserFromChannel(dto.userId, dto.channelId, dto.callerId);
    }

    @Post('leaveChannel')
    async leaveChannel(
        @Body() dto: LeaveChannelDto): Promise<boolean> {
        return this.chatService.leaveChannel(dto.userId, dto.channelId, dto.newOwnerId);
    }

    @Get('getNumberUsersInChannel')
    async getNumberUsersInChannel(
        @Query() dto: ChannelIdDto): Promise<number> {
        return this.chatService.getNumberUsersInChannel(dto.channelId);
    }

    @Get('getAdmins')
    async getAdmins(
        @Query() dto: ChannelIdPostDto): Promise<User[]> {
        console.log(dto);
        return this.chatService.getAdmins(dto.channelId);
    }

    @UseGuards(AdminGuard)
    @Post('addAdminToChannel')
    async addAdminToChannel(
        @Body() dto: ManageAdminDto): Promise<boolean> {
        return this.chatService.addAdminToChannel(dto.inviterId, dto.invitedId, dto.channelId);
    }

    @UseGuards(AdminGuard)
    @Post('removeAdminFromChannel')
    async removeAdminFromChannel(
        @Body() dto: ManageAdminDto): Promise<boolean> {
        return this.chatService.removeAdminFromChannel(dto.inviterId, dto.invitedId, dto.channelId);
    }

    @Post('addUserToChannel')
    async addUserToChannel(
        @Body() dto: PairUserIdChannelId): Promise<number> {
        return this.chatService.addUserToChannel(dto.userId, dto.channelId);
    }

    @Post('addUserToProtectedChannel')
    async addUserToProtectedChannel(
        @Body() data: SignUpChannelDto): Promise<void> {
        return this.chatService.addUserToProtectedChannel(data.channelId, data.password, data.userId);
    }

    @Post('isChannelNameExist')
    async isChannelNameExist(
        @Body() dto: ChannelNameDto): Promise<isChannelExist | false> {
        return this.chatService.isChannelNameExist(dto.channelName);
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

    @UseGuards(AdminGuard)
    @Post('mute')
    async mute(
        @Body() dto: muteDto) {
        return this.chatService.mute(dto);
    }

}
