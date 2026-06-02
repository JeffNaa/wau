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

  private handlePrismaError(exception: any, response: Response, code: string) {
    const meta = exception.meta || {};

    // P2002 — Unique constraint violation
    if (code === 'P2002') {
      const target = (meta.target as string[])?.join(', ') || meta.target || 'field';
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: this.t('errors.23505', { field: target, value: '' }),
        error: 'Conflict',
      });
    }

    // P2003 — Foreign key constraint violation
    if (code === 'P2003') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: this.t('errors.23503'),
        error: 'Conflict',
      });
    }

    // P2025 — Record not found
    if (code === 'P2025') {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.t('errors.validation.record_not_found'),
        error: 'Not Found',
      });
    }

    // P2000 — Input value too long
    if (code === 'P2000') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.t('errors.validation.input_too_long', { field: meta.column_name || 'field' }),
        error: 'Bad Request',
      });
    }

    // P2001 — Record does not exist
    if (code === 'P2001') {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.t('errors.validation.record_not_found'),
        error: 'Not Found',
      });
    }

    // P2011 — Null constraint violation
    if (code === 'P2011') {
      const field = meta.constraint?.fields?.[0] || 'field';
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.t('errors.validation.required', { field }),
        error: 'Bad Request',
      });
    }

    // P2012 — Missing required value
    if (code === 'P2012') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.t('errors.validation.required_fields'),
        error: 'Bad Request',
      });
    }

    // Generic Prisma client error — don't leak raw Prisma message
    const rawMessage = exception.message || '';
    const cleanMessage = rawMessage
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/Invalid `[^`]+` invocation in[^:]+:\d+:\d+/, this.t('errors.validation.database_error'));

    return response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: cleanMessage.includes('needs at least one of')
        ? this.t('errors.validation.missing_identifier')
        : cleanMessage,
      error: 'Bad Request',
    });
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Prisma Client validation errors (e.g. missing unique key in findUnique)
    const prismaCode = exception?.code;
    if (prismaCode?.startsWith('P')) {
      return this.handlePrismaError(exception, response, prismaCode);
    }

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
