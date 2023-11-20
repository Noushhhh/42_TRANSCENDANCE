import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
    constructor(private prisma: PrismaService) { }

    // Method to clear expired sessions
    public async clearExpiredSessions() {
        // Update all users whose session expiration timestamp is in the past
        await this.prisma.user.updateMany({
            where: {
                sessionExpiresAt: { lt: new Date() }, // 'lt' means 'less than'. This condition selects users with expired sessions
            },
            data: {
                sessionId: null, // Clears the sessionId
                sessionExpiresAt: null, // Clears the session expiration timestamp
            },
        });
        console.log('Expired sessions cleared'); // Logging to indicate that the cleanup process is complete
    }
}
