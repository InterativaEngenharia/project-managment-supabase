import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateSobraUsuarioInput, UpdateSobraUsuarioInput } from './sobrausuario.schema';

export const sobraUsuarioService = {
  async list(empreendimentoId?: string) {
    return prisma.sobraUsuario.findMany({
      where: empreendimentoId ? { empreendimento_id: empreendimentoId } : undefined,
      orderBy: { created_date: 'desc' }
    });
  },

  async getById(id: string) {
    return prisma.sobraUsuario.findUnique({ where: { id } });
  },

  async create(payload: CreateSobraUsuarioInput, createdBy: { id: string; email: string }) {
    return prisma.sobraUsuario.create({
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

  async update(id: string, payload: UpdateSobraUsuarioInput) {
    const exists = await prisma.sobraUsuario.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.sobraUsuario.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.sobraUsuario.delete({ where: { id } });
  }
};
