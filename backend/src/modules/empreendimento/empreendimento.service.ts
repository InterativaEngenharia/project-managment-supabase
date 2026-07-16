import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateEmpreendimentoInput, UpdateEmpreendimentoInput } from './empreendimento.schema';

export const empreendimentoService = {
  async list(where: Record<string, unknown> = {}, limit?: number) {
    return prisma.empreendimento.findMany({ where, orderBy: { created_date: 'desc' }, take: limit });
  },

  async getById(id: string) {
    return prisma.empreendimento.findUnique({ where: { id } });
  },

  async create(payload: CreateEmpreendimentoInput, createdBy: { id: string; email: string }) {
    return prisma.empreendimento.create({
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

  async update(id: string, payload: UpdateEmpreendimentoInput) {
    return prisma.empreendimento.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.empreendimento.delete({ where: { id } });
  }
};
