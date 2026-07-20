import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;
