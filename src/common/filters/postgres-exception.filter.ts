import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

interface PostgresError {
  code: string;
  message: string;
  detail?: string;
  table?: string;
  constraint?: string;
  column?: string;
}

@Catch()
export class PostgresExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle PostgreSQL errors
    const pgError = exception as PostgresError;

    if (pgError.code === '23505') {
      const match = pgError.detail?.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists./);
      const field = match?.[1];
      const value = match?.[2];

      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: field
          ? `${field} '${value}' already exists`
          : 'Resource already exists',
        error: 'Conflict',
      });
    }

    if (pgError.code === '23503') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Referenced resource does not exist',
        error: 'Conflict',
      });
    }

    if (pgError.code === '42703') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: pgError.message || 'Invalid column',
        error: 'Bad Request',
      });
    }

    // Re-throw as 500 for unhandled errors
    const status = exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message ?? 'Internal server error';

    return response.status(status).json({
      statusCode: status,
      message,
      error: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : exception.name,
    });
  }
}
