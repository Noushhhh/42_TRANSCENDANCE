import { IsAlphanumeric, IsNotEmpty, IsString, Min, IsInt, IsIn } from 'class-validator';
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

export class ChannelNameDto extends CommonChannelNameDto {}

export class ChannelIdDto extends CommonChannelIdDto {}

export class UserIdDto extends CommonUserIdDto {}

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
    @IsInt()
    @Min(0)
    @Type(() => Number)
    channelId!: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
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

    @IsNotEmpty()
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