import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreatePavimentoInput, UpdatePavimentoInput } from './pavimento.schema';

export const pavimentoService = {
  async list(empreendimentoId?: string) {
    return prisma.pavimento.findMany({
      where: empreendimentoId ? { empreendimento_id: empreendimentoId } : undefined,
      orderBy: { nome: 'asc' }
    });
  },

  async getById(id: string) {
    return prisma.pavimento.findUnique({ where: { id } });
  },

  async create(payload: CreatePavimentoInput, createdBy: { id: string; email: string }) {
    return prisma.pavimento.create({
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

  async update(id: string, payload: UpdatePavimentoInput) {
    return prisma.pavimento.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.pavimento.delete({ where: { id } });
  }
};
