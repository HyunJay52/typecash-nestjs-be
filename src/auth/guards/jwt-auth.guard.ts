import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {
        super();
    }

    canActivate(context: ExecutionContext) {
        console.log('JwtAuthGuard canActivate called');

        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            this.logger.log('Public route, skipping JWT auth');
            return true; // Public route, skip JWT auth
        }

        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            this.logger.error('Authentication failed', err || info);
            throw err || new Error('Unauthorized');
        }
        return user;
    }
}
