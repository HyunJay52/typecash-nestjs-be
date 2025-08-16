import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_ERROR';
        let errorMessage = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorCode = 'HTTP_ERROR';
            errorMessage = exception.message;
        } else if (exception instanceof PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2024':
                    status = HttpStatus.REQUEST_TIMEOUT;
                    errorCode = 'TIMEOUT';
                    errorMessage = 'Request timeout';
                    break;
                case 'P2025':
                    status = HttpStatus.NOT_FOUND;
                    errorCode = 'NOT_FOUND';
                    errorMessage = 'Record not found';
                    break;
                case 'P2034':
                    status = HttpStatus.CONFLICT;
                    errorCode = 'CONFLICT';
                    errorMessage = 'Transaction conflict';
                    break;
                default:
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                    errorCode = 'OPERATION_FAILED';
                    errorMessage = 'Database operation failed';
                    break;
            }
        }

        // * error logging
        this.logger.error(`${request.method} ${request.url}`, {
            status,
            code: errorCode,
            error: errorMessage,
            stack: exception.stack,
            timeStamp: new Date().toISOString(),
        });

        response.status(status).json({
            status: status,
            code: errorCode,
            error: errorMessage,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
