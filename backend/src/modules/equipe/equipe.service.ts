import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateEquipeInput, UpdateEquipeInput } from './equipe.schema';

export const equipeService = {
  async list() {
    return prisma.equipe.findMany({ orderBy: { nome: 'asc' } });
  },

  async getById(id: string) {
    return prisma.equipe.findUnique({ where: { id } });
  },

  async create(payload: CreateEquipeInput, createdBy: { id: string; email: string }) {
    return prisma.equipe.create({
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

  async update(id: string, payload: UpdateEquipeInput) {
    const exists = await prisma.equipe.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.equipe.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.equipe.delete({ where: { id } });
  }
};
