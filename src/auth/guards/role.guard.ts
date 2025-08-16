import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersType } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requeireRoles = this.reflector.getAllAndOverride<UsersType[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requeireRoles) {
            return true; // 권한이 필요하지 않은 경우
        }

        const { user } = context.switchToHttp().getRequest();
        return requeireRoles.some((role) => user.role == role);
    }
}
