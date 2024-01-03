import { IsAlphanumeric, IsNotEmpty, IsString, Min, IsInt, IsIn, IsOptional, IsDate, MaxLength, Max, MinLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';


class CommonChannelNameDto {
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    @MaxLength(22)
    channelName!: string;
}

class CommonChannelIdDto {
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @Max(2000000)
    channelId!: number;
}

class CommonUserIdDto {
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @Max(2000000)
    userId!: number;
}

class CommonChannelIdPostDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
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
    @MinLength(6)
    @MaxLength(22)
    password!: string;
}

export class PairUserIdChannelId {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    @IsNotEmpty()
    channelId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    @IsNotEmpty()
    userId!: number;
}

export class pairUserId{
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @Max(2000000)
    callerId!: number;
    
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @Max(2000000)
    targetId!: number;
}

export class ManagePasswordDto{
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @Max(2000000)
    channelId!: number;

    @IsIn(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED'])
    channelType!: string;

    @IsString()
    //@MinLength(6)
    //@MaxLength(22)
    actualPassword!: string;

    @IsString()
    //@MinLength(6)
    //@MaxLength(22)
    newPassword!: string;
}

export class ManageChannelTypeDto{
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @Max(2000000)
    channelId!: number;

    @IsIn(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED']) // Remplacez ceci par les valeurs de type autorisées
    channelType!: string;
}

export class LeaveChannelDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    channelId!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    newOwnerId!: number;
}

export class muteDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    mutedUserId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    channelId!: number;

    @Type(() => Date)
    @IsDate()
    mutedUntil!: Date;
}

export class MessageToStoreDto {
    @IsInt()
    @Min(0)
    @Max(2000000)
    channelId!: number;

    @IsNotEmpty()
    @MaxLength(5000)
    @IsString()
    content!: string;

}

export class getChannelUsernamesDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    @Max(2000000)
    channelId!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    substring!: string;

}

export class getUsernamesDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    substring!: string;
}

export class KickOrBanChannelDto {    
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    targetId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    channelId!: number;
}

export class ManageAdminDto {

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    invitedId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2000000)
    channelId!: number;
}

export class CreateChannelDto {
    @IsString()
    @MaxLength(35)
    name!: string;

    @IsString()
    @MaxLength(35)
    password!: string;

    @IsNumber({}, { each: true })
    participants!: number[];

    @IsIn(['PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED'])
    type!: string;
}
