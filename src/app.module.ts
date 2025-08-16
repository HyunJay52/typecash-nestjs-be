import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdModule } from './ad/ad.module';
import { UserModule } from './user/user.module';
import { PointModule } from './point/point.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from './filter/http-exception.filter';
import { MissionModule } from './mssion/mission.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // 환경 변수를 전역으로 사용 가능하게 설정
            cache: true, // 환경 변수 캐싱 활성화
        }),
        PrismaModule,
        AuthModule,
        AdModule,
        UserModule,
        PointModule,
        MissionModule,
        MailerModule.forRootAsync({
            useFactory: () => ({
                transport: {
                    service: 'gmail',
                    auth: {
                        user: 'typecash.ad@gmail.com',
                        // user: 'typcash_ad@naver.com', // process.env.EMAIL_ADDRESS || '',
                        // pass: '.5jcZmA/V6/iwKP', // process.env.EMAIL_PASSWORD || '',
                        pass: 'asmooxlxykyddufr',
                    },
                    tls: {
                        rejectUnauthorized: false, // Allow self-signed certificates
                    },
                },
                defaults: {
                    from: `"TypeCash Admin" <typecash.ad@gmail.com>`,
                },
            }),
        }),
    ],
    controllers: [AppController],
    providers: [
        PrismaService,
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
})
export class AppModule {}
