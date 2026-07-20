import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

/** Gera um CPF com dígito verificador válido, único a cada execução — evita
 * colidir com o `@unique` de Client.document ao rodar o e2e repetidas vezes
 * contra o mesmo banco (aqui usamos o banco de dev do docker-compose, não um
 * banco de teste isolado — simplificação aceitável dado o escopo). */
function generateValidCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  const checkDigit = (digits: number[], factorStart: number): number => {
    const sum = digits.reduce((acc, digit, index) => acc + digit * (factorStart - index), 0);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = checkDigit(base, 10);
  const d2 = checkDigit([...base, d1], 11);
  return [...base, d1, d2].join('');
}

describe('App (e2e)', () => {
  let app: INestApplication;
  const unique = Date.now();

  let accessToken: string;
  let clientId: string;
  let contractId: string;
  let itemId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejeita acesso a rota protegida sem token', async () => {
    await request(app.getHttpServer()).get('/clients').expect(401);
  });

  it('registra um usuário e retorna um token válido', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'E2E User', email: `e2e-${unique}@webmais.com`, password: '123456' })
      .expect(201);

    expect(typeof response.body.accessToken).toBe('string');
    accessToken = response.body.accessToken as string;
  });

  it('cria um cliente', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Cliente E2E', document: generateValidCpf() })
      .expect(201);

    clientId = response.body.id as string;
    expect(clientId).toBeDefined();
  });

  it('cria um contrato em DRAFT com value calculado a partir dos itens', async () => {
    const dueDate = new Date(Date.now() + 7 * 86_400_000).toISOString();

    const response = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        clientId,
        type: 'SERVICE',
        dueDate,
        items: [{ description: 'Consultoria', quantity: 2, unitValue: 500 }],
      })
      .expect(201);

    contractId = response.body.id as string;
    itemId = response.body.items[0].id as string;
    expect(response.body.status).toBe('DRAFT');
    expect(response.body.value).toBe(1000);
  });

  it('rejeita aprovar contrato sem itens', async () => {
    await request(app.getHttpServer())
      .delete(`/contracts/${contractId}/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/contracts/${contractId}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('aprova o contrato assim que tem ao menos um item', async () => {
    await request(app.getHttpServer())
      .post(`/contracts/${contractId}/items`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'Consultoria', quantity: 1, unitValue: 300 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`/contracts/${contractId}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(response.body.status).toBe('ACTIVE');
  });

  it('encerra o contrato e bloqueia edição depois de encerrado', async () => {
    const response = await request(app.getHttpServer())
      .post(`/contracts/${contractId}/close`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(response.body.status).toBe('CLOSED');

    await request(app.getHttpServer())
      .patch(`/contracts/${contractId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'SUPPLY' })
      .expect(400);
  });

  it('retorna o resumo de contratos por status', async () => {
    const response = await request(app.getHttpServer())
      .get('/contracts/summary')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        draft: expect.any(Number),
        active: expect.any(Number),
        expired: expect.any(Number),
        closed: expect.any(Number),
      }),
    );
  });
});
