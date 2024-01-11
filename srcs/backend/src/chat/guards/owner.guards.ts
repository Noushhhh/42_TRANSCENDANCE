import { Injectable, CanActivate, ExecutionContext, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { IsInt, Min, Max } from 'class-validator';

export class OwnerGuardDTO {
  @IsInt()
  @Min(0)
  @Max(2000000)
  channelId!: string;
}

@Injectable()
export class OwnerGuard implements CanActivate {

    constructor(private config: ConfigService,
                private prisma: PrismaService) {};

    canActivate = async (context: ExecutionContext): Promise<boolean> => {

        const request = context.switchToHttp().getRequest();

        const body = request.body;

        // Vérifiez si channelId est présent dans le corps de la requête
        if (!body || !body.channelId) {
            throw new BadRequestException('Missing channelId in request body');
        }

        const channelId: number = Number(body.channelId);

        const jwtCookie = request.cookies['token'];
        const secret = this.config.get('JWT_SECRET');
        const user = jwt.verify(jwtCookie, secret);

        let userId: number;
        if (!user)
            return false;
        if (user.sub)
            userId = parseInt(user.sub.toString(), 10);
        else
            return false;

        if (channelId < 0 || channelId > 2000000)
            throw new ForbiddenException("Incorrect channelId")
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            include: { owner: true }
        });

        if (!channel)
            throw new NotFoundException('Channel not found');

        if (channel.ownerId === userId){
            return true;
        }

        throw new UnauthorizedException("Unauthorized access");
    }
}