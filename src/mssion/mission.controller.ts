import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Request,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { MissionService } from './mission.service';
import { debug } from 'console';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { SubmitMissionDto } from './dto/mission-request.dto';

@Controller('mission')
@UseGuards(JwtAuthGuard)
export class MissionController {
    constructor(private readonly missionService: MissionService) {}

    @Get('daily-mission-summary')
    async getDailyMissionSummary(@Request() req) {
        debug('getDailyMissionSummary called: ', req.header, req.user);
        return this.missionService.getDailyMissionSummary(req.user.id);
    }

    // ! 서비스 수정 필요
    @Get('current')
    getCurrentMission(
        @Request() req,
        // @Query('hour', ParseIntPipe) hour: number,
    ) {
        debug('getCurrentMission called: ', req.header, req.user);
        return this.missionService.getCurrentMission(req.user.id);
    }

    // 1. Push a sentence for typing on Flutter app
    @Get(':missionId/sentence')
    getMissionSentence(@Param('missionId') missionId: string) {
        //
    }

    // 2. Save user trying count and check mission completion
    @Post('submit')
    @HttpCode(HttpStatus.OK)
    async submitMission(@Request() req, @Body() dto: SubmitMissionDto) {
        debug('submitMission called: ', req.header, req.user, dto);
        const isCorrect = await this.missionService.submitMission(
            req.user.id,
            dto,
        );

        return {
            isCorrect,
        };
    }

    // 3. Send data to app if a user completed the mission
    @Post('/admin/reset-mission')
    resetMission() {
        return this.missionService.resetAllMissions();
    }
}
