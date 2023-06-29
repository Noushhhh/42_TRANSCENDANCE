import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        console.log(process.env);
        super({
            datasources: {
                db: {
                    // url: process.env.DATABASE_URL
                    url: "postgresql://42_lyon:BornToCode@db_container:5432/ft_transcendance_database?schema=public"
                },
            },
        });
    }
}
