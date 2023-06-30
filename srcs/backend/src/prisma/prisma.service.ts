import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        console.log("teeeeeeeeest icicicicicicicicicici");
        console.log(process.env.DATABASE_URL);
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL},
            },
        });
    }
}
