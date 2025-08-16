import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
    AddPointDto,
    RedeemDto,
    UpdateRewardAmountDto,
} from './dto/point-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
    GiftTypeToNumber,
    TransactionSource,
    TransactionType,
} from '@/common/enum/point.enum';
import { EmailService } from '@/email/email.service';
import { RedeemPointsResponseDto } from './dto/point-response.dto';

@Injectable()
export class PointService {
    private readonly logger = new Logger(PointService.name);

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) {}

    async updateRewardForAdWatch(dto: UpdateRewardAmountDto) {
        // * 여기서 광고 시청에 대한 보상을 추가하는 로직을 구현합니다.
        return this.prisma.$transaction(async (prisma) => {
            // todo user 유효성
            const user = await prisma.users.findUnique({
                where: { id: dto.userId },
            });
            if (!user)
                throw new NotFoundException(
                    `User with ID ${dto.userId} not found`,
                );

            // todo 광고 시청 기록이 있는지 확인

            // todo 포인트 만료일 설정 (기본 1년)
            const expiresAt = new Date(
                Date.UTC(
                    new Date().getUTCFullYear() + 1,
                    new Date().getUTCMonth(),
                    new Date().getUTCDate(),
                    new Date().getUTCHours(),
                    new Date().getUTCMinutes(),
                    new Date().getUTCSeconds(),
                    new Date().getUTCMilliseconds(),
                ),
            );

            const rewardPoints = dto.amount; // 예시로 100 포인트를 추가
            const balanceAfter = user.rewardBalance + dto.amount; // 예시로 100 포인트를 추가
            this.logger.debug(`DTO amount: ${dto.amount}`);
            this.logger.debug(`Reward points: ${rewardPoints}`);
            this.logger.debug(`Balance after: ${balanceAfter}`);

            // todo 리워드 트랜젝션 로그 생성
            const transactionLog = await prisma.rewardTransactionLogs.create({
                data: {
                    userId: dto.userId,
                    type: TransactionType.EARN,
                    source: TransactionSource.AD_REWARD,
                    sourceId: 12345,
                    amount: rewardPoints, // 예시로 100 포인트를 추가
                    balanceAfter: balanceAfter,
                    expiresAt,
                },
            });

            // todo 유저 리워드 밸런스 업데이트
            const updatedUser = await prisma.users.update({
                where: { id: dto.userId },
                data: {
                    rewardBalance: balanceAfter, // 계산된 balanceAfter를 직접 할당
                },
            });

            // UserRewards 테이블도 업데이트 (존재하는 경우)
            await prisma.userRewards.upsert({
                where: { userId: dto.userId },
                update: {
                    totalReward: { increment: dto.amount },
                    availableReward: { increment: dto.amount },
                    updatedAt: new Date(),
                },
                create: {
                    userId: user.id,
                    totalReward: dto.amount,
                    availableReward: dto.amount,
                    updatedAt: new Date(),
                },
            });

            this.logger.log(
                `Added ${rewardPoints} reward points to user ${user.id} for ad watch`,
            );

            return {
                transactionId: transactionLog.id,
                userId: dto.userId,
                amount: dto.amount,
                balanceAfter: updatedUser.rewardBalance,
                // type: TransactionType.EARN,
                // source: TransactionSource.AD_REWARD,
                expiresAt,
            };
        });
    }

    async redeemPoints(
        userId: number,
        reddeemDto: RedeemDto,
    ): Promise<RedeemPointsResponseDto> {
        const result = await this.prisma.$transaction(async (prisma) => {
            // todo 유저 유효성 검사
            const user = await prisma.users.findUnique({
                where: { id: userId },
            });
            if (!user)
                throw new NotFoundException(`User with ID ${userId} not found`);

            // * user phone number update
            if (reddeemDto.phoneNumber) {
                await prisma.users.update({
                    where: { id: userId },
                    data: { phoneNumber: reddeemDto.phoneNumber },
                });
            }

            // todo 포인트 잔액 확인
            if (user.rewardBalance < reddeemDto.pointsToUse) {
                throw new Error(
                    `Insufficient points. Current balance: ${user.rewardBalance}`,
                );
            }

            // todo 포인트 사용 기록 생성
            const transactionLog = await prisma.rewardTransactionLogs.create({
                data: {
                    userId,
                    type: TransactionType.REDEEM,
                    source: TransactionSource.REWARD_REDEEM,
                    sourceId: GiftTypeToNumber[reddeemDto.giftCardId], // 상품권 ID
                    amount: -reddeemDto.pointsToUse, // 포인트 사용은 음수로 기록
                    balanceAfter: user.rewardBalance - reddeemDto.pointsToUse,
                    expiresAt: null,
                },
            });

            // todo 리워드 교환 요청 생성 -> 이메일 발송
            this.emailService.sendUserRedeemRequestEmail(
                user.email,
                reddeemDto.phoneNumber,
                reddeemDto.giftCardId,
            );

            // todo 유저 리워드 밸런스 업데이트
            const balanceAfter = user.rewardBalance - reddeemDto.pointsToUse; // 포인트 사용 후 잔액
            await prisma.users.update({
                where: { id: userId },
                data: {
                    rewardBalance: balanceAfter, // 포인트 사용 후 잔액 업데이트
                },
            });

            // todo UserRewards 테이블 업데이트
            // userId가 유니크(Primary Key)이므로 이미 존재하면 create가 실행되지 않고 update만 동작합니다.
            // upsert는 레코드가 없을 때만 create를 실행하므로, 유저가 처음 포인트를 사용하는 경우에만 생성됩니다.
            // 이미 userRewards 레코드가 있다면 update만 수행되어 중복 생성되지 않습니다.
            await prisma.userRewards.upsert({
                where: { userId },
                update: {
                    availableReward: { decrement: reddeemDto.pointsToUse },
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    totalReward: -reddeemDto.pointsToUse,
                    availableReward: -reddeemDto.pointsToUse,
                    updatedAt: new Date(),
                },
            });

            // todo 포인트 사용 후 잔액 반환 `return { userId, balanceAfter }`
            return {
                userId,
                amount: -reddeemDto.pointsToUse, // 사용한 포인트는 음
                balanceAfter,
            };
        });

        return result;
    }

    private removeExpiredPoints(id: number) {
        // trigger point expiration check
        return `This action removes a #${id} point`;
    }
}
