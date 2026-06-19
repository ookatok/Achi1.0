import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCodes } from '../errors/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCodes.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as any;
        message = respObj.message || exception.message;
        
        // Handle array message (like built-in NestJS validations if any)
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
        
        code = respObj.code || this.getDefaultCodeForStatus(status);
        if (respObj.errors) {
          details = respObj.errors;
          code = ErrorCodes.VALIDATION_ERROR;
        }
      } else {
        message = exception.message;
      }
    } else {
      // Unhandled/JavaScript error
      const err = exception as Error;
      message = err.message || message;
      this.logger.error(
        `Unhandled exception: ${message}`,
        err.stack,
        `${request.method} ${request.url}`
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      success: false,
      data: null,
      error: {
        code,
        message,
        details,
      },
    });
  }

  private getDefaultCodeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCodes.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCodes.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCodes.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCodes.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCodes.CONFLICT;
      default:
        return ErrorCodes.INTERNAL_SERVER_ERROR;
    }
  }
}
