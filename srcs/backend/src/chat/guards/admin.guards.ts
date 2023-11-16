import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private config: ConfigService,
                private prisma: PrismaService) {};

    canActivate = async (context: ExecutionContext): Promise<boolean> => {

        const request = context.switchToHttp().getRequest();

        let channelId: number | undefined = undefined;

        if (request.body && 'channelId' in request.body) {
            channelId = Number(request.body.channelId);
        } else if (request.params && request.params.hasOwnProperty('channelId')){
            channelId = Number(request.params.channelId);
        }

        if (!channelId)
            return false;

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
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            include: { admins: true }
        });

        if (!channel)
            throw new NotFoundException('Channel not found');

        return channel.admins.some(admin => (admin.id === userId))
    }
}