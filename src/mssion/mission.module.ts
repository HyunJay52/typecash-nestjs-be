import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
    controllers: [MissionController],
    providers: [MissionService],
    imports: [PrismaModule],
})
export class MissionModule {}
