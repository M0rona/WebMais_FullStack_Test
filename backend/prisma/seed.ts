import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CONTRACT_NUMBER_PREFIX,
  CONTRACT_NUMBER_SEQUENCE,
} from '../src/common/constants/contract.constants';
import { ContractStatus, ContractType, PrismaClient } from '../src/generated/prisma/client';

const CLIENT_COUNT = 100;
const CONTRACT_COUNT = 100;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

function calculateCpfCheckDigit(digits: number[], weightStart: number): number {
  const sum = digits.reduce((total, digit, index) => total + digit * (weightStart - index), 0);
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

function generateCpf(): string {
  const base = Array.from({ length: 9 }, () => faker.number.int({ min: 0, max: 9 }));
  const digit1 = calculateCpfCheckDigit(base, 10);
  const digit2 = calculateCpfCheckDigit([...base, digit1], 11);
  return [...base, digit1, digit2].join('');
}

function calculateCnpjCheckDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((total, digit, index) => total + digit * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function generateCnpj(): string {
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const base = Array.from({ length: 12 }, () => faker.number.int({ min: 0, max: 9 }));
  const digit1 = calculateCnpjCheckDigit(base, weights1);
  const digit2 = calculateCnpjCheckDigit([...base, digit1], weights2);
  return [...base, digit1, digit2].join('');
}

function generateUniqueDocument(usedDocuments: Set<string>): string {
  let document: string;
  do {
    document = faker.datatype.boolean({ probability: 0.7 }) ? generateCpf() : generateCnpj();
  } while (usedDocuments.has(document));
  usedDocuments.add(document);
  return document;
}

async function nextContractNumber(): Promise<string> {
  const rows = await prisma.$queryRawUnsafe<Array<{ nextval: bigint | number | string }>>(
    `SELECT nextval('${CONTRACT_NUMBER_SEQUENCE}')`,
  );
  const sequenceValue = String(rows[0].nextval);
  return `${CONTRACT_NUMBER_PREFIX}${sequenceValue.padStart(4, '0')}`;
}

// Distribuição pensada pra deixar a listagem com casos de teste variados nos
// filtros de status: mais contrato ativo (o estado "normal" do dia a dia), o
// resto espalhado entre rascunho, vencido e encerrado.
const STATUS_WEIGHTS: Array<{ value: ContractStatus; weight: number }> = [
  { value: ContractStatus.DRAFT, weight: 15 },
  { value: ContractStatus.ACTIVE, weight: 45 },
  { value: ContractStatus.EXPIRED, weight: 15 },
  { value: ContractStatus.CLOSED, weight: 25 },
];

function pickStatus(): ContractStatus {
  return faker.helpers.weightedArrayElement(STATUS_WEIGHTS);
}

function buildDueDate(status: ContractStatus): Date {
  if (status === ContractStatus.EXPIRED) {
    return faker.date.past({ years: 1 });
  }
  if (status === ContractStatus.CLOSED) {
    return faker.date.between({ from: '2024-01-01', to: new Date() });
  }
  return faker.date.future({ years: 1 });
}

function buildClosedAt(status: ContractStatus, dueDate: Date): Date | null {
  if (status !== ContractStatus.CLOSED) return null;
  return faker.date.between({ from: dueDate, to: new Date() });
}

function buildItems() {
  const itemCount = faker.number.int({ min: 1, max: 4 });
  return Array.from({ length: itemCount }, () => {
    const quantity = faker.number.int({ min: 1, max: 20 });
    const unitValue = Number(faker.commerce.price({ min: 10, max: 5000 }));
    return {
      description: faker.commerce.productName(),
      quantity,
      unitValue,
      subtotal: quantity * unitValue,
    };
  });
}

async function seedClients(): Promise<string[]> {
  const usedDocuments = new Set<string>();
  const clients = Array.from({ length: CLIENT_COUNT }, () => ({
    id: randomUUID(),
    name: faker.person.fullName(),
    document: generateUniqueDocument(usedDocuments),
  }));

  await prisma.client.createMany({ data: clients });
  console.log(`${clients.length} clientes inseridos.`);
  return clients.map((client) => client.id);
}

async function seedContracts(clientIds: string[]): Promise<void> {
  for (let i = 0; i < CONTRACT_COUNT; i++) {
    const status = pickStatus();
    const dueDate = buildDueDate(status);
    const items = buildItems();
    const value = items.reduce((sum, item) => sum + item.subtotal, 0);

    await prisma.contract.create({
      data: {
        number: await nextContractNumber(),
        type: faker.helpers.arrayElement(Object.values(ContractType)),
        status,
        dueDate,
        closedAt: buildClosedAt(status, dueDate),
        value,
        clientId: faker.helpers.arrayElement(clientIds),
        items: { create: items },
      },
    });
  }
  console.log(`${CONTRACT_COUNT} contratos inseridos.`);
}

async function main() {
  const clientIds = await seedClients();
  await seedContracts(clientIds);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
