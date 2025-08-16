import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { EmailModule } from '@/email/email.module';

@Module({
    imports: [PrismaModule, EmailModule],
    controllers: [PointController],
    providers: [PointService],
})
export class PointModule {}
