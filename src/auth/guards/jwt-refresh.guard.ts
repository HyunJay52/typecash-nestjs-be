import { PrismaService } from '@/prisma/prisma.service';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshTokenGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('JwtRefreshTokenGuard canActivate called');
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.body?.refresh_token;

        if (!refreshToken)
            throw new UnauthorizedException('Refresh token is required');

        const payload = this.jwtService.verify(refreshToken);

        // todo : check if the refresh token exists in the database
        const tokenRecord = await this.prisma.userTokens.findFirst({
            where: {
                userId: payload.sub,
                refreshToken: refreshToken,
                expiresAt: {
                    gt: new Date(), // Check if the token is not expired
                },
            },
        });

        if (!tokenRecord)
            throw new UnauthorizedException('Invalid or expired refresh token');

        request.user = {
            id: payload.sub,
            email: payload.email,
        };

        return true;
    }
}
