import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [PrismaModule, MailerModule],
})
export class UserModule {}
