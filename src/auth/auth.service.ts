import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { compareHashedData, hashPassword } from '@/utils/password.util';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/auth-request.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) {}

    // * user 로그인 검증 : 사용자 이메일과 비밀번호를 검증
    async validateUser(loginUserDto: LoginDto): Promise<any> {
        const { email, password } = loginUserDto;

        const user = await this.prisma.users.findFirst({
            where: {
                email: email,
            },
        });

        // * hash password compare
        const isPasswordValid = user
            ? await compareHashedData(password, user.password)
            : false;

        if (!user || !isPasswordValid) {
            // 404 Not Found 상태 코드 발생
            throw new NotFoundException(`User with ID ${email} not found`);
        }

        this.logger.log(`User ${user} logged in successfully`);
        const { password: _, ...result } = user; // Exclude password from the response
        return result;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };

        // * Access token 생성 : Short Lived JWT
        const accessToken = await this.createAccessToken(payload);
        // * Refresh token 생성 : Long Lived JWT
        const refreshToken = await this.createRefreshToken(payload);

        // * save refresh token to the database
        await this.saveRefreshToken(user.id, refreshToken);

        this.logger.log(`access token : ${accessToken}`);
        this.logger.log(`refresh token : ${refreshToken}`);

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                rewardBalance: user.rewardBalance,
            },
        };
    }

    async logout(userId: number) {
        // Refresh Token 삭제
        await this.prisma.userTokens.update({
            where: { userId },
            data: { refreshToken: '' },
        });

        return { message: 'Logout successful' };
    }

    // * Access token 재발급 : Short Lived JWT
    private async createAccessToken(payload: { email: string; sub: number }) {
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m', // 15 min
        });

        return accessToken;
    }

    // * Refresh token 재발급 : Long Lived JWT
    private async createRefreshToken(payload: { email: string; sub: number }) {
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d', // 7 days
        });

        // * save refresh token to the database
        await this.saveRefreshToken(payload.sub, refreshToken);

        return refreshToken;
    }

    async saveRefreshToken(userId: number, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        this.logger.log(`Hashed refresh token: ${hashedRefreshToken}`);

        await this.prisma.userTokens.upsert({
            where: { userId },
            update: {
                refreshToken: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
            },
            create: {
                userId,
                refreshToken: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        this.logger.log(`Refresh token saved for user ${userId}`);
    }

    async refreshToken(refreshToken: string) {
        const payload = this.jwtService.verify(refreshToken);

        const isValid = await this.compareUserRefreshToken(
            payload.sub,
            refreshToken,
        );

        if (!isValid) {
            throw new NotFoundException('Invalid refresh token');
        }

        const newAccessToken = await this.createAccessToken(payload);

        this.logger.log(`New access token : ${newAccessToken}`);

        return {
            access_token: newAccessToken,
        };
    }

    async compareUserRefreshToken(userId: number, refreshToken: string) {
        const tokenRecord = await this.prisma.userTokens.findFirst({
            where: {
                userId,
                refreshToken,
                expiresAt: {
                    gt: new Date(), // Check if the token is not expired
                },
            },
        });

        if (!tokenRecord) {
            throw new NotFoundException('Refresh token not found or expired');
        }

        const isValid = await compareHashedData(
            refreshToken,
            tokenRecord.refreshToken,
        );

        return isValid;
    }

    // * 비밀번호 재설정 코드 생성 및 이메일 전송
    async sendVerificationCode(email: string) {
        const user = await this.prisma.users.findFirst({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        const verificationCode =
            await this.emailService.sendVerificationCode(email);

        return {
            message: 'Verification code sent to email',
            verificationCode, // For testing purposes, you might want to remove this in production
        };
    }

    async updateAsHashedPassword(password: string) {
        const hasedPassword = await hashPassword(password);
        this.logger.log('Hased password: ', hasedPassword);

        const updateResult = this.prisma.users.update({
            where: {
                id: 10001,
                email: 'addict520@naver.com',
            },
            data: { password: hasedPassword },
        });

        this.logger.log(
            'update hased password: ',
            (await updateResult).password,
        );

        const result = await compareHashedData(password, hasedPassword);
        this.logger.log('Password comparison result:', result);
    }

    async resetPassword(email: string, newPassword: string) {
        const user = await this.prisma.users.findFirst({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        const hashedPassword = await hashPassword(newPassword);
        this.logger.log('Hashed password: ', hashedPassword);

        // Save the code to the user (or a separate table if preferred)
        await this.prisma.users.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            }, // expires in 15 min
        });

        // TODO: Send the code via email (implement your email service here)
        console.log(`Send password reset code ${newPassword} to ${email}`);

        return { message: 'Password reset code sent to email' };
    }
}
