export enum TransactionType {
    EARN = 'earn',
    REDEEM = 'redeem',
    EXPIRE = 'expire',
}

export enum TransactionSource {
    AD_REWARD = 'ad_reward',
    REWARD_REDEEM = 'reward_redeem',
    ETC = 'etc',
}

// todo : 상품권 타입 정의 (클라이언트와 서버 간의 일관성을 위해)
// 상품권 타입은 클라이언트와 서버 간의 일관성을 위해 정의되어야 합니다.
// 예를 들어, 상품권은 'gift_card', 쿠폰은 'coupon',
// 현금은 'cash' 등으로 정의할 수 있습니다.
export enum GiftType {
    NAVER_POINT = 'naver_point',
    STARBUCKS = 'starbucks',
    AMAZON = 'amazon',
    GOOGLE_PLAY = 'google_play',
    APPLE_STORE = 'apple_store',
    PAYPAL = 'paypal',
    GIFT_CARD = 'gift_card',
    COUPON = 'coupon',
    CASH = 'cash',
}
export const GiftTypeToNumber: { [Key in GiftType]: number } = {
    [GiftType.NAVER_POINT]: 1,
    [GiftType.STARBUCKS]: 2,
    [GiftType.AMAZON]: 3,
    [GiftType.GOOGLE_PLAY]: 4,
    [GiftType.APPLE_STORE]: 5,
    [GiftType.PAYPAL]: 6,
    [GiftType.GIFT_CARD]: 7,
    [GiftType.COUPON]: 8,
    [GiftType.CASH]: 9,
};
export const GiftTypeToKorean: { [Key in GiftType]: string } = {
    [GiftType.NAVER_POINT]: '네이버 포인트',
    [GiftType.STARBUCKS]: '스타벅스',
    [GiftType.AMAZON]: '아마존',
    [GiftType.GOOGLE_PLAY]: '구글 플레이',
    [GiftType.APPLE_STORE]: '애플 스토어',
    [GiftType.PAYPAL]: '페이팔',
    [GiftType.GIFT_CARD]: '상품권',
    [GiftType.COUPON]: '쿠폰',
    [GiftType.CASH]: '현금',
};
