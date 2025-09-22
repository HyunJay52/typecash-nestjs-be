import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '@/prisma/prisma.service';
import { MissionData } from './model/mission-data.model';
import { SubmitMissionDto } from './dto/mission-request.dto';
import {
    DailyMissionSummary,
    MissionStatus,
    MissionStatusResponse,
} from './interface/mission.interface';
import { MissionResponseDto } from './dto/mission-response.dto';

// ! note about current bugㄴ
// * 이미 로그가 있는 경우, 최초 조회만 됨 다시 조회되면 문제는 바뀌지 않지만, 로그 정보 조회가 안되고 null 반환 (데이터 베이스 상에는 존재) -> 일단 수정
// * 클라이언트 서버 데이터베이스 상의 시간 정보 일치 시켜야함 (ex. UTC 기준으로) -> 현지 시간

@Injectable()
export class MissionService {
    private readonly logger = new Logger(MissionService.name);
    private missionList: MissionData[] = [];
    private readonly filePath = path.join(
        process.cwd(),
        'src/assets/mission_data.json',
    );

    constructor(private readonly prisma: PrismaService) {}

    async onModuleInit() {
        await this.loadMissionList();
    }

    private async loadMissionList() {
        try {
            // const filePath = path.join(
            //     process.cwd(),
            //     'src/assets/mission_data.json',
            // );
            const data = fs.readFileSync(this.filePath, 'utf8');
            this.missionList = JSON.parse(data);
            this.logger.log(`Loaded ${this.missionList.length} mission items`);
        } catch (error) {
            this.logger.error('Failed to load quiz data', error);
            this.missionList = [];
        }
    }
    // ! ------------------------------------ 로직검사 필요 ---------------------------
    getMissionById(id: string): MissionData | undefined {
        return this.missionList.find((mission) => mission.id === parseInt(id));
    }

    private updateMissionDataFile() {
        // fs.writeFileSync(
        //     this.filePath,
        //     JSON.stringify(this.missionList, null, 2),
        //     'utf-8',
        // );
        // debug(
        //     `Updated quiz_data.json with ${this.missionList.length} missions`,
        // );
        try {
            // const filePath = path.join(
            //     process.cwd(),
            //     'src/assets/mission_data.json',
            // );
            fs.writeFileSync(
                this.filePath,
                JSON.stringify(this.missionList, null, 2),
                'utf8',
            );
            this.logger.log('Mission data saved successfully');
        } catch (error) {
            this.logger.error('Failed to save mission data', error);
        }
    }
    // ! ------------------------------------ 로직검사 필요 ---------------------------

    private getCurrentHour(): number {
        return new Date().getUTCHours(); // UTC 시간으로 변경
    }

    private formatDate(date: Date): string {
        return date.toISOString().replace('T', ' ').split('.')[0]; // UTC 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
        // return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    }

    private getAvailableHours(): number[] {
        // 9AM to 9PM (9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21)
        // return Array.from({ length: 13 }, (_, i) => i + 9);
        return Array.from({ length: 24 }, (_, i) => i + 1);
    }

    private getMissionForCurrentHour(
        date: string,
        hour: number,
    ): MissionData | undefined {
        // 현재 시간에 해당하는 미션을 찾기
        return this.missionList.find(
            (mission) => mission.date === date && mission.hour === hour,
        );
    }

    resetAllMissions() {
        this.missionList.forEach((mission) => {
            mission.used = false;
            mission.date = undefined;
            mission.hour = undefined;
        });
        this.updateMissionDataFile();
    }

    private createNewMissionForHour(date: string, hour: number): MissionData {
        const unusedMissions = this.missionList.find(
            (mission) => !mission.used,
        );
        // const unusedMissions = this.missionList.filter((mission) => !mission.used);

        if (!unusedMissions) {
            // todo reset 전에 관리자 이메일 알림 추가
            this.resetAllMissions();
            return this.missionList[0]; // 모든 미션이 사용된 경우
        }

        unusedMissions.used = true;
        unusedMissions.date = date;
        unusedMissions.hour = hour;

        this.updateMissionDataFile();

        return unusedMissions; // 첫 번째 미션을 반환
    }

    // * 현시각 미션 생성
    async getCurrentMission(userId: number): Promise<MissionResponseDto> {
        // todo : 현재 시간에 미션을 푼 경우에는 다음 미션 문장을 생성하지 않음
        // ! api 요청마다 이 상태에서는 새로운 문제가 갱신됨 : 예를 들면, 8시 문제를 풀었든 안 풀었든 api를 요청하면 새로운 문제를 가져옴
        const now = new Date();
        const currentHour = this.getCurrentHour();
        const today = new Date();
        const startOfDayUTC = new Date(
            Date.UTC(
                today.getUTCFullYear(),
                today.getUTCMonth(),
                today.getUTCDate(),
            ),
        );

        if (!this.getAvailableHours().includes(currentHour)) {
            return {
                mission: {
                    id: null,
                    content:
                        '현재 시간에는 미션을 시도할 수 없습니다. 9시부터 21시 사이에 시도해주세요.',
                },
                missionLog: null,
                canAttempt: false,
            };
        }

        // 현재 시간에 해당하는 미션 조회
        let mission: MissionData | undefined = this.getMissionForCurrentHour(
            this.formatDate(startOfDayUTC),
            currentHour,
        );
        this.logger.log(
            `Checking mission for date: ${this.formatDate(startOfDayUTC)}, hour: ${currentHour}`,
            `mission: ${JSON.stringify(mission)}`,
        );

        if (!mission) {
            // 현재 시간에 해당하는 미션이 없으면 새로 생성
            this.logger.warn(
                `No mission found for date: ${this.formatDate(startOfDayUTC)}, hour: ${currentHour}`,
            );
            mission = this.createNewMissionForHour(
                this.formatDate(startOfDayUTC),
                currentHour,
            );

            const missionLogData = await this.prisma.userMissionLogs.create({
                data: {
                    userId: userId,
                    missionId: mission.id.toString(),
                    date: today,
                    hour: currentHour,
                    isCorrect: false, // 초기값은 false로 설정
                },
            });

            this.logger.log(
                `Created new mission for user ${userId}: ${JSON.stringify(
                    mission,
                )}`,
            );

            return {
                mission: {
                    id: mission.id,
                    content: mission.content,
                },
                missionLog: missionLogData,
                canAttempt: true, // 새로 생성된 미션은 시도 가능
            };
        }

        this.logger.log(
            `Mission already exists for user ${userId}: ${JSON.stringify(mission)}`,
        );
        // 유저가 이미 해당 시간에 미션을 시도했는지 확인
        const missionLog = await this.prisma.userMissionLogs.findFirst({
            where: {
                userId: userId,
                missionId: mission.id.toString(),
                // date: startOfDayUTC,
                date: {
                    gte: startOfDayUTC, // 오늘 자정부터
                    lt: new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000), // 다음 날 자정까지
                },
                hour: currentHour,
            },
        });

        if (!missionLog) {
            this.logger.warn(
                `Mission log not found for user ${userId} and mission ${mission.id}`,
            );
            return {
                mission: {
                    id: mission.id,
                    content: mission.content,
                },
                missionLog: null,
                canAttempt: true, // 로그가 없으면 시도 가능
            };
        }
        this.logger.log(`missionLog: ${JSON.stringify(missionLog)}`);

        return {
            mission: {
                id: mission.id,
                content: mission.content,
            },
            missionLog: missionLog,
            canAttempt: !missionLog.isCorrect, // 이미 시도한 미션이지만, 정답이 아니면 다시 시도 가능
        };
    }

    // * 미션 시도
    async submitMission(
        userId: number,
        dto: SubmitMissionDto,
    ): Promise<boolean> {
        const { missionId, answer } = dto;

        const today = new Date();
        const startOfDayUTC = new Date(
            Date.UTC(
                today.getUTCFullYear(),
                today.getUTCMonth(),
                today.getUTCDate(),
            ),
        );
        const endOfDayUTC = new Date(
            startOfDayUTC.getTime() + 24 * 60 * 60 * 1000,
        );

        const missionLog = await this.prisma.userMissionLogs.findFirst({
            where: {
                userId: userId,
                missionId: missionId.toString(),
                date: {
                    gte: startOfDayUTC, // UTC 기준 오늘 자정
                    lt: endOfDayUTC, // UTC 기준 다음 날 자정
                },
            },
        });

        if (!missionLog) {
            this.logger.warn(
                `Mission log not found for user ${userId} and mission ${missionId}`,
            );
            throw new NotFoundException('미션 로그를 찾을 수 없습니다.');
        }

        if (missionLog.isCorrect) {
            this.logger.warn(
                `Mission already completed for user ${userId} and mission ${missionId}`,
            );
            throw new BadRequestException('이미 완료된 미션입니다.');
        }

        const missionItem = this.missionList.find(
            (item) => item.id === missionId,
        );
        if (!missionItem) {
            this.logger.warn(`Mission not found for ID ${missionId}`);
            throw new NotFoundException('해당 미션을 찾을 수 없습니다.');
        }

        const isCorrect = missionItem.content.trim() === answer.trim();
        // 시도 횟수 증가 및 결과 업데이트
        await this.prisma.userMissionLogs.update({
            where: { id: missionLog.id },
            data: {
                attemptCount: missionLog.attemptCount + 1,
                isCorrect,
                submittedAt: new Date(Date.now()), // UTC 기준 시간
            },
        });

        // todo : 포인트 지급 로직 추가 -> 화면 설계상 포인트 지급은 광고 시청 후 지급
        return isCorrect;
    }

    // * 유저 미션 현황 조회
    async getDailyMissionSummary(userId: number): Promise<DailyMissionSummary> {
        const availableHours = this.getAvailableHours();
        // todo : utc to kts
        const currentHour = this.getCurrentHour();

        const today = new Date();
        const startOfDayUTC = new Date(
            Date.UTC(
                today.getUTCFullYear(),
                today.getUTCMonth(),
                today.getUTCDate(),
            ),
        );
        const endOfDayUTC = new Date(
            startOfDayUTC.getTime() + 24 * 60 * 60 * 1000,
        );

        // * 오늘 미션 로그 가져오기
        const missionLogs = await this.prisma.userMissionLogs.findMany({
            where: {
                userId: userId,
                date: {
                    gte: startOfDayUTC, // 오늘 자정부터
                    lt: endOfDayUTC, // 다음 날 자정까지
                },
            },
        });

        // * 시간별 미션 상태 정리
        const missionStatus: MissionStatusResponse[] = availableHours.map(
            (hour) => {
                const log = missionLogs.find((log) => log.hour === hour);
                const isPastHour = hour < currentHour;
                const isFutureHour = hour > currentHour;

                return {
                    hour,
                    available:
                        (hour === currentHour || isFutureHour) &&
                        (!log || !log.isCorrect),
                    completed: log?.isCorrect || false,
                    missionId: log?.missionId
                        ? parseInt(log.missionId)
                        : undefined,
                };
            },
        );

        //* 현재 시간의 미션 내용 가져오기
        let currentMissionContent: string | undefined;
        let currentMissionId: string | undefined;

        if (availableHours.includes(currentHour)) {
            const currentLog = missionLogs.find(
                (log) => log.hour === currentHour,
            );

            if (currentLog) {
                const mission = this.missionList.find(
                    (item) => item.id === parseInt(currentLog.missionId),
                );
                currentMissionContent = mission?.content;
                currentMissionId = currentLog.missionId;
            } else if (!currentLog) {
                const newMission = await this.getCurrentMission(userId);
                if (newMission) {
                    currentMissionContent = newMission.mission.content;
                    currentMissionId = newMission.mission.id;
                }
            }
        }

        const completedMissions = missionStatus.filter(
            (m) => m.completed,
        ).length;
        const pendingMissions = missionStatus.filter((m) => m.available).length;
        const missedMissions = missionStatus.filter(
            (m) => !m.available && !m.completed && m.hour < currentHour,
        ).length;

        return {
            totalMissions: availableHours.length,
            completedMissions: missionStatus.filter((m) => m.completed).length,
            pendingMissions: missionStatus.filter((m) => m.available).length,
            missedMissions: missionStatus.filter(
                (m) => !m.available && !m.completed && m.hour < currentHour,
            ).length,
            currentMission: {
                hour: currentHour,
                available:
                    availableHours.includes(currentHour) &&
                    (!missionLogs.find((log) => log.hour === currentHour)
                        ?.isCorrect ||
                        false),
                content: currentMissionContent || '',
                missionId: parseInt(currentMissionId || ''),
            },
            missionStatus,
        };
    }
}
