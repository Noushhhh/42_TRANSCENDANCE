import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL},
            },
        });
    }

    cleanDb() {
        try {
            return this.$transaction([
                this.matchHistory.deleteMany(),
                this.bookmark.deleteMany(),
                this.message.deleteMany(),
                this.refreshToken.deleteMany(),
                this.mutedUser.deleteMany(),
                this.channel.deleteMany(),
                this.user.deleteMany(),
        ])
        } catch (error){
            console.log(error);
        }
    }
}
