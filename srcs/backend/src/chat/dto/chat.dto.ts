import { IsAlphanumeric, IsNotEmpty, IsString, Min, IsInt, IsIn, IsOptional, isDate, IsDate, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Type } from 'class-transformer';


class CommonChannelNameDto {
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    channelName!: string;
}

class CommonChannelIdDto {
    @IsInt()
    @Min(0)
    @Type(() => Number)
    channelId!: number;
}

class CommonUserIdDto {
    @IsInt()
    @Min(0)
    @Type(() => Number)
    userId!: number;
}

class CommonChannelIdPostDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    channelId!: number;
}

class CommonUserIdPostDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    userId!: number;
}


export class ChannelNameDto extends CommonChannelNameDto {}

export class ChannelIdDto extends CommonChannelIdDto {}

export class UserIdDto extends CommonUserIdDto {}

export class UserIdPostDto extends CommonUserIdPostDto {}

export class ChannelIdPostDto extends CommonChannelIdPostDto {}

export class SignUpChannelDto extends CommonChannelIdDto {
    @IsNotEmpty()
    @IsString()
    // @Min(6)
    // @Max(22)
    password!: string;

    @IsInt()
    @Min(0)
    userId!: number;
}

export class PairUserIdChannelId {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    channelId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    userId!: number;
}

export class pairUserId{
    @IsInt()
    @Min(0)
    @Type(() => Number)
    callerId!: number;
    
    @IsInt()
    @Min(0)
    @Type(() => Number)
    targetId!: number;
}

export class ManagePasswordDto{
    @IsInt()
    @Min(0)
    @Type(() => Number)
    channelId!: number;

    @IsIn(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED']) // Remplacez ceci par les valeurs de type autorisées
    channelType!: string;

    @IsString()
    // @Min(6)
    // @Max(22)
    actualPassword!: string;

    @IsString()
    // @Min(6)
    // @Max(22)
    newPassword!: string;
}

export class ManageChannelTypeDto{
    @IsInt()
    @Min(0)
    @Type(() => Number)
    channelId!: number;

    @IsIn(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED']) // Remplacez ceci par les valeurs de type autorisées
    channelType!: string;
}

export class LeaveChannelDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    channelId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    userId!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    newOwnerId!: number;
}

export class muteDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    mutedUserId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    callerUserId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    channelId!: number;

    @Type(() => Date)
    @IsDate()
    mutedUntil!: Date;
}

export class MessageToStoreDto {
    @IsInt()
    @Min(0)
    channelId!: number;

    @IsNotEmpty()
    @MaxLength(2000)
    content!: string;

    @IsInt()
    @Min(0)
    senderId!: number;
}

export class getChannelUsernamesDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    channelId!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    substring!: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    userId!: number;
}

export class getUsernamesDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    substring!: string;
}
