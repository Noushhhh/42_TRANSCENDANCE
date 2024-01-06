import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
    constructor(private prisma: PrismaService) { }


    // ─────────────────────────────────────────────────────────────────────────────


    // Method to clear expired sessions
    public async clearExpiredSessions() {
        await this.prisma.session.deleteMany({
            where: {
                OR: [
                    {
                        expiredAt: { lt: new Date() }, // Sessions that have expired
                    },
                    {
                        isValid: false, // Sessions that are marked as invalid
                    }
                ],
            },
        });
        console.log('Expired sessions cleared');
    }


}


