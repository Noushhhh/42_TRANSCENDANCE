import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor () {
        super ({ // calls the constructor of the extended class 
            datasources: { // constructor needs datasources, db and url
                db: {
                    url: 'postgresql://42_lyon:BornToCode@localhost:5434/ft_transcendance_database?schema=public'
                },
            },
        });
    }
}
