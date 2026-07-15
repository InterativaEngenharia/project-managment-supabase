import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateControleOSInput, UpdateControleOSInput } from './controleos.schema';

export const controleOSService = {
  async list() {
    return prisma.controleOS.findMany({ orderBy: { created_date: 'desc' } });
  },

  async getById(id: string) {
    return prisma.controleOS.findUnique({ where: { id } });
  },

  async create(payload: CreateControleOSInput, createdBy: { id: string; email: string }) {
    return prisma.controleOS.create({
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

  async update(id: string, payload: UpdateControleOSInput) {
    const exists = await prisma.controleOS.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.controleOS.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.controleOS.delete({ where: { id } });
  }
};
