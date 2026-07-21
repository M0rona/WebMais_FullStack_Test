import { ArgumentsHost, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { Prisma } from '../../infra/prisma/prisma-client';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const jsonMock = jest.fn();
  const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  const response = { status: statusMock };
  const request = { method: 'POST', url: '/test', i18nContext: undefined as unknown };

  const buildHost = (): ArgumentsHost =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    }) as unknown as ArgumentsHost;

  // Erros 5xx são logados de propósito pelo filtro; silenciamos aqui pra não
  // poluir o output do test runner com um "ERROR" que não indica falha real.
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    request.i18nContext = undefined;
  });

  it('traduz cada issue de uma ZodValidationException usando o i18nContext da request', () => {
    request.i18nContext = { t: (key: string) => `traduzido:${key}` };
    const zodError = {
      issues: [
        { message: 'auth.validation.name.min' },
        { message: 'auth.validation.email.invalid' },
      ],
    };
    const exception = new ZodValidationException(zodError);

    new AllExceptionsFilter().catch(exception, buildHost());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['traduzido:auth.validation.name.min', 'traduzido:auth.validation.email.invalid'],
      }),
    );
  });

  it('sem i18nContext na request, mantém a chave crua como mensagem', () => {
    const zodError = { issues: [{ message: 'auth.validation.name.min' }] };
    const exception = new ZodValidationException(zodError);

    new AllExceptionsFilter().catch(exception, buildHost());

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: ['auth.validation.name.min'] }),
    );
  });

  it('repassa a mensagem já resolvida de uma HttpException comum', () => {
    new AllExceptionsFilter().catch(new NotFoundException('Contrato não encontrado'), buildHost());

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Contrato não encontrado' }),
    );
  });

  it('trata BadRequestException com array de mensagens', () => {
    new AllExceptionsFilter().catch(new BadRequestException(['a', 'b']), buildHost());

    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: ['a', 'b'] }));
  });

  it('P2002 do Prisma (constraint única) vira 409 traduzido em vez de 500 genérico', () => {
    request.i18nContext = { t: (key: string) => `traduzido:${key}` };
    const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });

    new AllExceptionsFilter().catch(exception, buildHost());

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'traduzido:common.errors.conflict' }),
    );
  });

  it('erro não-HTTP vira 500 traduzido quando há i18nContext', () => {
    request.i18nContext = { t: () => 'Erro interno traduzido' };

    new AllExceptionsFilter().catch(new Error('boom'), buildHost());

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Erro interno traduzido' }),
    );
  });
});
