// src/auth/strategies/jwt.strategy.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly logger = new Logger(JwtAccessTokenStrategy.name);

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        super({
            // * get refresh token from the request cookeie
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // 토큰 만료 확인
            // passReqToCallback: true, // 요청 객체를 콜백에 전달
            secretOrKey:
                configService.get<string>('JWT_SECRET') ||
                'dev_378b31aa192e7790a3983e351b18bb87d973faed88a971d2c1453f331fa0e409', // 실제 환경에서는 환경 변수 사용 권장
        });
    }

    async validate(payload: { email: string; sub: number }) {
        const user = await this.prisma.users.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                rewardBalance: true,
                // 필요한 다른 필드 추가
            },
        });

        if (!user) {
            throw new UnauthorizedException('인증 정보가 유효하지 않습니다');
        }

        return user;
    }
}
