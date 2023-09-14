import { IsAlphanumeric, IsNotEmpty, IsString, Min, Max, isNumber, IsInt, IsPositive } from 'class-validator';

class CommonChannelNameDto {
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    channelName!: string;
}

class CommonChannelIdDto {
    @IsInt()
    @Min(0)
    channelId!: number;
}
export class ChannelNameDto extends CommonChannelNameDto {}

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
    channelId!: number;

    @IsInt()
    @Min(0)
    userId!: number;
}