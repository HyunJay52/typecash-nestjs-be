export interface MissionData {
    id: number; // 미션 ID
    content: string; // 미션 내용
    used: boolean; // 미션 사용 여부
}

export interface MissionStatus {
    hour: number;
    available: boolean;
    completed: boolean;
    missionId?: string;
}

export interface MissionStatusResponse {
    hour: number;
    available: boolean;
    completed: boolean;
    missionId?: number;
}

export interface DailyMissionSummary {
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
