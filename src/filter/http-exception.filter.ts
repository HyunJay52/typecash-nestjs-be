import { Catch, ExceptionFilter, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown) {
    // Handle the exception
    this.logger.error('An error occurred:', exception);
    // You can also log the error to a logging service or return a custom response
  }
}
