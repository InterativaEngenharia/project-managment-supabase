import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateDocumentoInput, UpdateDocumentoInput } from './documento.schema';

export const documentoService = {
  async list() {
    return prisma.documento.findMany({ orderBy: { created_date: 'desc' } });
  },

  async getById(id: string) {
    return prisma.documento.findUnique({ where: { id } });
  },

  async create(payload: CreateDocumentoInput, createdBy: { id: string; email: string }) {
    return prisma.documento.create({
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

  async update(id: string, payload: UpdateDocumentoInput) {
    const exists = await prisma.documento.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.documento.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.documento.delete({ where: { id } });
  }
};
