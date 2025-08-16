import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    Request,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/auth-request.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(ValidationPipe) loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto);
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req) {
        return this.authService.logout(req.user.id);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refreshToken(body.refreshToken);
    }

    // * Http only cookie 방식으로 refresh token을 관리할 경우 주석 해제
    // @UseGuards(JwtRefreshTokenStrategy) << 왜 필요???
    // @Post('refresh')
    // async refresh(@Req() request) {
    //     const refreshToken = request.cookies['refresh_token'];
    //     return this.authService.refreshToken(refreshToken);
    // }

    @Post('send-verification-code')
    @HttpCode(HttpStatus.OK)
    async sendVerificationCode(@Body('email') email: string) {
        Logger.log(`Sending verification code to email: ${email}`);
        return await this.authService.sendVerificationCode(email);
    }

    // @Public()
    // @Post('verify-reset-code')
    // @HttpCode(HttpStatus.OK)
    // async verifyResetCode(@Body() verifyDto: { email: string; code: string }) {
    //     return this.authService.verifyResetCode(
    //         verifyDto.email,
    //         verifyDto.code,
    //     );
    // }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    resetPassword(
        @Body('email') email: string,
        @Body('newPassword') newPassword: string,
    ) {
        Logger.log(`Password reset requested for email: ${email}`);
        return this.authService.resetPassword(email, newPassword);
    }
}
