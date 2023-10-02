import { IsAlphanumeric, IsNotEmpty, IsString, Min, IsInt } from 'class-validator';
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