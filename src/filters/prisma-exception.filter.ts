// src/filters/prisma-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client'
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    switch (exception.code) {
      case 'P2002':  // Unique Violation
        response.status(409).json({
          statusCode: 409,
          message: 'Resource already exists',
        });
        break;
      case 'P2025':  // No Record
        response.status(404).json({
          statusCode: 404,
          message: 'Resource not found',
        });
        break;
      default:
        response.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
        });
    }
  }
}