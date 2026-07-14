import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateDisciplinaInput, UpdateDisciplinaInput } from './disciplinas.schema';

export const disciplinasService = {
  async list() {
    return prisma.disciplina.findMany({ orderBy: { nome: 'asc' } });
  },

  async getById(id: string) {
    return prisma.disciplina.findUnique({ where: { id } });
  },

  async create(payload: CreateDisciplinaInput, createdBy: { id: string; email: string }) {
    return prisma.disciplina.create({
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

  async update(id: string, payload: UpdateDisciplinaInput) {
    const exists = await prisma.disciplina.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.disciplina.update({
      where: { id },
      data: {
        ...payload,
        updated_date: new Date()
      }
    });
  },

  async delete(id: string) {
    await prisma.disciplina.delete({ where: { id } });
  }
};
