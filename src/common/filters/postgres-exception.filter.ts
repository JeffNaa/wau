import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Optional } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from '../../i18n/i18n.service';

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
  constructor(@Optional() private readonly i18n?: I18nService) {}

  private t(key: string, args?: Record<string, any>): string {
    return this.i18n?.t(key, args) ?? key;
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const pgError = exception as PostgresError;

    if (pgError.code === '23505') {
      const match = pgError.detail?.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists./);
      const field = match?.[1];
      const value = match?.[2];

      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: field
          ? this.t('errors.23505', { field, value })
          : this.t('errors.23505_fallback'),
        error: 'Conflict',
      });
    }

    if (pgError.code === '23503') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: this.t('errors.23503'),
        error: 'Conflict',
      });
    }

    if (pgError.code === '42703') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: pgError.message || this.t('errors.42703'),
        error: 'Bad Request',
      });
    }

    const status = exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message ?? this.t('errors.500');

    return response.status(status).json({
      statusCode: status,
      message,
      error: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : exception.name,
    });
  }
}
