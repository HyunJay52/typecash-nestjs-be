export class RedeemPointsResponseDto {
    userId: number;
    amount: number;
    balanceAfter: number;
}

export class AddPointResponseDto {
    transactionId: number;
    userId: number;
    amount: number;
    balanceAfter: number;
    source: string;
    expiresAt?: Date; // Optional, if applicable
}
