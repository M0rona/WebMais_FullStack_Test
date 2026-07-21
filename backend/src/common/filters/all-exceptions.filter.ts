import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { ZodValidationException } from 'nestjs-zod';
import type { ZodIssue } from 'zod';
import { Prisma } from '../../infra/prisma/prisma-client';

const PRISMA_UNIQUE_CONSTRAINT_CODE = 'P2002';

interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const i18n = I18nContext.current(host);

    const isHttpException = exception instanceof HttpException;
    const isUniqueConstraintViolation =
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === PRISMA_UNIQUE_CONSTRAINT_CODE;

    const status: number = isUniqueConstraintViolation
      ? HttpStatus.CONFLICT
      : isHttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[];
    if (exception instanceof ZodValidationException) {
      message = this.translateZodIssues(exception, i18n);
    } else if (isUniqueConstraintViolation) {
      message = i18n?.t('common.errors.conflict') ?? 'Registro duplicado';
    } else if (isHttpException) {
      message = this.extractMessage(exception);
    } else {
      message = i18n?.t('common.errors.internal') ?? 'Erro interno do servidor';
    }

    if ((!isHttpException && !isUniqueConstraintViolation) || status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    response.status(status).json(body);
  }

  private translateZodIssues(
    exception: ZodValidationException,
    i18n: I18nContext | undefined,
  ): string[] {
    const zodError = exception.getZodError() as { issues?: ZodIssue[] } | undefined;
    const issues = zodError?.issues ?? [];
    return issues.map((issue) => (i18n ? i18n.t(issue.message) : issue.message));
  }

  private extractMessage(exception: HttpException): string | string[] {
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    if (typeof response === 'object' && response !== null && 'message' in response) {
      return (response as { message: string | string[] }).message;
    }
    return exception.message;
  }
}
