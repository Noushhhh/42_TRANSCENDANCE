import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // thanks to that, prisma service available in all the modules
@Module ({
    providers: [PrismaService],
    exports: [PrismaService]
})
export class PrismaModule {}