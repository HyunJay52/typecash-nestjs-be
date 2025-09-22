import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PointService } from './point.service';
import { RedeemDto } from './dto/point-request.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

// todo : PointController
// 1. 포인트 적립 API
// 2. 포인트 사용 API
// 3. 포인트 조회 API
// 4. 포인트 내역 조회 API

@Controller('point')
@UseGuards(JwtAuthGuard)
export class PointController {
    constructor(private readonly pointService: PointService) {}

    // 1. 포인트 적립 API - 광고 시청 후 포인트 적립
    @Post('/ad-watch-reward')
    async addRewardForAdWatch(@Request() req, @Body('amount') amount: number) {
        // addPointDto에는 userId, 포인트 등 필요한 정보가 포함되어야 합니다.
        console.log('addRewardForAdWatch called: ', req.user.id, amount);
        return this.pointService.updateRewardForAdWatch({
            userId: req.user.id,
            amount,
        });
    }

    // 2. 포인트 사용 API - 포인트로 상품권 교환 신청
    @Post('/redeem/giftcard')
    async redeemPoints(
        @Request() req,
        @Body()
        redeemDto: RedeemDto,
    ) {
        console.log('redeemPoints called: ', req.user.id, redeemDto);
        // redeemDto에는 userId, giftCardId, pointsToUse 등이 포함되어야 합니다.
        return this.pointService.redeemPoints(req.user.id, redeemDto);
    }
}
