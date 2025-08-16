import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'refresh-token',
) {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: (req) => {
                const token = req?.cookies?.refreshToken; // Get refresh token from cookies
                return token || null; // Return null if no token found
            },
            ignoreExpiration: false, // Validate expiration
            passReqToCallback: true, // Pass request to the validate method
            secretOrKey:
                configService.get<string>('JWT_SECRET') ||
                'dev_378b31aa192e7790a3983e351b18bb87d973faed88a971d2c1453f331fa0e409', // Use environment variable or default secret
        });
    }

    async validate(req: Request, payload: { sub: number; email: string }) {
        const refreshToken = req?.headers?.authorization?.split(' ')[1]; // Extract token from Authorization header

        if (!refreshToken) {
            throw new Error('Refresh token not found');
        }

        // const result = await this.authService.validateUser()
        return { userId: payload.sub, email: payload.email };
    }

    // * 리프레시 토큰 사용 시 새 리프레시 토큰 발급
    // async generateNewRefreshToken(userId: number, payload: any) {
    //     const newRefreshToken = this.authService.sign(payload, { expiresIn: '7d' });
    //     await this.authService.saveRefreshToken(userId, newRefreshToken);
    //     return newRefreshToken;
    // }
}

// * 클라이언트에 토큰 반환 시 쿠키 설정 옵션
// res.cookie('refreshToken', refreshToken, {
//   httpOnly: true,
//   secure: true, // HTTPS에서만 작동
//   sameSite: 'strict',
//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
// });
