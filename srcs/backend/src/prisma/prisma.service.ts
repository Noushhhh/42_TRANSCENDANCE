import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: "postgresql://42_lyon:BornToCode@localhost:5434/ft_transcendance_database"
                },
            },
        });
    }
}
