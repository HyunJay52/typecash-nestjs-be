import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { GiftType, GiftTypeToKorean } from '@/common/enum/point.enum';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {
        const nodemailer = require('nodemailer');
    }

    private generateVerificationCode() {
        // return uuidv4().replace(/\D/g, '').slice(0, 6).padEnd(6, '0');
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async sendEmail(to: string, subject: string, content: string) {
        return await this.mailerService.sendMail({
            to: to,
            from: 'typecash.ad@gmail.com',
            subject: subject,
            html: content,
        });

        // this.logger.log(`result of sendMail: ${transporter}`);
        // return this.mailerService.sendMail({
        //     to,
        //     subject,
        //     html: content,
        // });
    }

    async sendVerificationCode(email: string) {
        const verificationCode = this.generateVerificationCode();
        await this.sendEmail(
            email,
            '[TypeCash] 이메일 인증 코드 전송',
            `<p>안녕하세요, TypeCash 입니다.</p><p><b>인증 코드는: ${verificationCode} 입니다.</b></p>`,
        );
        return verificationCode;
    }

    async sendPasswordChangeNotification(email: string) {
        return await this.mailerService.sendMail({
            to: email,
            from: 'typecash.ad@gmail.com',
            subject: '[TypeCash] 비밀번호 변경 알림',
            html: `
              <p>안녕하세요, TypeCash 입니다.</p>
              <p>회원님의 비밀번호가 성공적으로 변경되었습니다.</p>
              <p>본인이 요청하지 않은 변경이라면, 즉시 고객센터로 연락해주세요.</p>
            `,
        });
    }

    async sendUserRedeemRequestEmail(
        email: string,
        phoneNumber: string,
        giftCardId: GiftType,
    ) {
        await this.sendEmail(
            'typecash.ad@gmail.com', // 관리자 이메일로 발송
            `[TypeCash] 상품권 교환 요청: ${email}`,
            `<p>상품권 교환 요청이 접수되었습니다.</p>
            <p>요청자 이메일: ${email}, 전화번호: ${phoneNumber}</p>
            <p>상품권 ID: ${giftCardId}</p>
            <p>상품권 종류: ${GiftTypeToKorean[giftCardId]}</p>`,
        );
    }

    // async sendVerificationCode0(email: string) {
    //         try {
    //             this.logger.log(`Sending verification code to email: ${email}`);
    //             // Generate a 6-digit verification code from a UUID
    //             const verificationCode = await this.createVerificationCode();
    //             this.logger.log(`Generated verification code: ${verificationCode}`);

    //             // Send email using nodemailer (Naver SMTP)
    //             const transporter = await this.mailerService.sendMail({
    //                 to: email,
    //                 from: 'typecash.ad@gmail.com',
    //                 subject: '[TypeCash] 이메일 인증 번호',
    //                 html: `<p>안녕하세요, TypeCash 입니다.</p><p><b>인증코드: ${verificationCode}</b></p>`,
    //             });

    //             this.logger.log(`result of sendMail: ${transporter}`);

    //             return { message: 'Verification code sent to email' };
    //         } catch (error) {
    //             this.logger.error(`Error sending verification code: ${error}`);
    //             throw new ConflictException('Failed to send verification code');
    //         }
    // }
}
