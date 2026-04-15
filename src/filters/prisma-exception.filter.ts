import { Prisma } from '../generated/prisma/client'
import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      `Prisma error: ${exception.message}`,
      exception.stack,
    );

    const httpException = this.mapToHttpException(exception);
    const status = httpException.getStatus();

    response.status(status).json({
      statusCode: status,
      message: httpException.message,
    });
  }

  private mapToHttpException(exception: any): HttpException {
    
    const combinedMessage = [
      exception.message,
      exception.cause?.message,
      exception.cause?.originalMessage,
      exception.meta?.cause,
    ]
      .filter(Boolean)
      .join(' | ');

    // ─── DB-level Constraint Mapping ───

    if (combinedMessage.includes('no_schedule_overlap')) {
      return new ConflictException('Schedule conflicts with existing session');
    }

    if (combinedMessage.includes('remaining_sessions_non_negative')) {
      return new ForbiddenException('No remaining sessions available');
    }

    if (combinedMessage.includes('session_count_balance')) {
      return new ForbiddenException('Session count mismatch');
    }

    if (combinedMessage.includes('used_sessions_non_negative')) {
      return new ForbiddenException('Invalid session state');
    }

    // fallback based on PostgreSQL error code 
    const pgCode = exception.cause?.code ?? exception.cause?.originalCode;
    if (pgCode === '23P01') {
      // Exclusion constraint violation
      return new ConflictException('Resource conflict detected');
    }
    if (pgCode === '23514') {
      // Check constraint violation
      return new ForbiddenException('Operation violates business rules');
    }

    // ─── Prisma error code mapping ───
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return new ConflictException('Duplicate value');
        case 'P2025':
          return new NotFoundException('Resource not found');
        case 'P2003':
          return new ConflictException('Related resource not found');
        default:
          return new InternalServerErrorException();
      }
    }

    return new InternalServerErrorException();
  }
}