import { PartialType } from '@nestjs/mapped-types';
import { CreateMissionDto } from './mission-request.dto';
import {
    DailyMissionSummary,
    MissionStatus,
    MissionStatusResponse,
} from '../interface/mission.interface';

export class UpdateMissionDto extends PartialType(CreateMissionDto) {}

export class MissionResponseDto {
    mission: {
        id: any; // id: number;
        content: any; // content: string;
    };
    missionLog: any;
    canAttempt: boolean;
}

export class DailyMissionSummaryDto implements DailyMissionSummary {
    totalMissions: number;
    completedMissions: number;
    pendingMissions: number;
    missedMissions: number;
    currentMission: {
        hour: number;
        available: boolean;
        content?: string;
        missionId?: number;
    };
    missionStatus: MissionStatusResponse[];
}

export class GetDailyMissionSummaryResponseDto {
    totalMissions: number;
    completedMissions: number;
    pendingMissions: number;
    missedMissions: number;
    currentMission: {
        hour: number;
        available: boolean;
        content?: string;
        missionId?: string;
    };
    missionStatus: MissionStatusResponse[];
}
