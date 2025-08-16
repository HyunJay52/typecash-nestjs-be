import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { EmailModule } from '@/email/email.module';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh.guard';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule], // Import ConfigModule to use environment variables
            inject: [ConfigService],
            global: true, // Make JWT module globally available
            useFactory: (configService: ConfigService) => ({
                secret:
                    configService.get<string>('JWT_SECRET') ||
                    'dev_378b31aa192e7790a3983e351b18bb87d973faed88a971d2c1453f331fa0e409', // Use environment variable or default secret
                signOptions: {
                    expiresIn:
                        configService.get<string>('JWT_ACCESS_EXPIRES') ||
                        '10m',
                }, // Token expiration time
            }),
        }),
        UserModule,
        EmailModule,
    ],
    providers: [
        AuthService,
        JwtAccessTokenStrategy,
        JwtRefreshTokenStrategy,
        JwtAuthGuard,
        JwtRefreshTokenGuard,
    ],
    controllers: [AuthController],
})
export class AuthModule {}
