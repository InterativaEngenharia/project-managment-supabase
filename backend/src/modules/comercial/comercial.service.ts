import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateComercialInput, UpdateComercialInput } from './comercial.schema';

export const comercialService = {
  async list(where: Record<string, unknown> = {}, limit?: number) {
    return prisma.comercial.findMany({ where, orderBy: { created_date: 'desc' }, take: limit });
  },

  async getById(id: string) {
    return prisma.comercial.findUnique({ where: { id } });
  },

  async create(payload: CreateComercialInput, createdBy: { id: string; email: string }) {
    return prisma.comercial.create({
      data: {
        id: randomUUID(),
        ...payload,
        created_date: new Date(),
        updated_date: new Date(),
        created_by_id: createdBy.id,
        created_by: createdBy.email
      }
    });
  },

  async update(id: string, payload: UpdateComercialInput) {
    const exists = await prisma.comercial.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.comercial.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.comercial.delete({ where: { id } });
  }
};
