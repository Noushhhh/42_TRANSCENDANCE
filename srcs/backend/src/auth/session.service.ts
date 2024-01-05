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
                expiredAt: { lt: new Date() }, // 'lt' means 'less than'. This condition selects sessions that have expired
                isValid: false // Selects only the invalid sessions
            },
        });
        console.log('Expired sessions cleared');
    }



}


