import {
    GiftType,
    TransactionSource,
    TransactionType,
} from '@/common/enum/point.enum';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class AddPointDto {
    /**
     * 사용자 ID
     * @example 1
     */
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    userId: number;

    /**
     * 추가할 포인트 금액
     * @example 100
     */
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    amount: number;

    /**
     * 포인트 추가 사유
     * @example '광고 시청', '상품 구매'
     */
    @IsNotEmpty()
    @IsString()
    reason: string; // 예: '광고 시청', '상품 구매' 등

    /**
     * 포인트 추가 시간
     * @example '2023-10-01T12:00:00Z'
     */
    @IsNotEmpty()
    @IsString()
    timestamp?: Date; // 포인트 추가 시간, 기본값은 현재 시간

    @IsOptional()
    @IsInt()
    sourceId?: number;

    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType = TransactionType.EARN; // 기본값 설정

    @IsOptional()
    @IsEnum(TransactionSource)
    source?: TransactionSource = TransactionSource.AD_REWARD; // 기본값 설정
}

export class UpdateRewardAmountDto {
    /**
     * 사용자 ID
     * @example 1
     */
    @IsNotEmpty()
    @IsInt()
    userId: number;

    /**
     * 업데이트할 리워드 포인트 양
     * @example 100
     */
    @IsNotEmpty()
    @IsInt()
    amount: number; // 업데이트할 리워드 포인트 양
}

export class RedeemDto {
    @IsNotEmpty()
    @IsEnum(GiftType)
    giftCardId: GiftType; // 상품권 ID

    @IsNotEmpty()
    @IsInt()
    pointsToUse: number; // 사용하려는 포인트 양

    @IsNotEmpty()
    phoneNumber: string; // 사용자 전화번호
}
