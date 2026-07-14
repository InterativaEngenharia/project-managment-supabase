import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import { CreateUsuarioInput, UpdateUsuarioInput } from './usuarios.schema';

// Colunas que só o servidor pode preencher - nunca aceitar do payload do
// cliente, mesmo no caminho "privilegiado" (lider/direcao/admin).
const CAMPOS_SOMENTE_SERVIDOR = ['id', 'created_date', 'updated_date', 'created_by_id', 'created_by', 'is_sample'];

function semCamposDeServidor<T extends Record<string, unknown>>(payload: T): T {
  const limpo = { ...payload };
  for (const campo of CAMPOS_SOMENTE_SERVIDOR) delete (limpo as Record<string, unknown>)[campo];
  return limpo;
}

export const usuariosService = {
  async list(sort?: string) {
    const descending = sort?.startsWith('-');
    const campo = sort ? sort.replace(/^-/, '') : 'nome';
    const camposOrdenaveis = new Set(['nome', 'created_date', 'email']);
    const orderByCampo = camposOrdenaveis.has(campo) ? campo : 'nome';

    return prisma.usuario.findMany({
      orderBy: { [orderByCampo]: descending ? 'desc' : 'asc' }
    });
  },

  async getById(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  async getByEmail(email: string) {
    return prisma.usuario.findFirst({ where: { email } });
  },

  async create(payload: CreateUsuarioInput, createdBy: { id: string; email: string }) {
    return prisma.usuario.create({
      data: {
        id: randomUUID(),
        ...semCamposDeServidor(payload),
        created_date: new Date(),
        updated_date: new Date(),
        created_by_id: createdBy.id,
        created_by: createdBy.email
      }
    });
  },

  async update(id: string, payload: UpdateUsuarioInput) {
    const exists = await prisma.usuario.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.usuario.update({
      where: { id },
      data: {
        ...semCamposDeServidor(payload),
        updated_date: new Date()
      }
    });
  },

  async updateEquipe(id: string, equipeId: string | null) {
    const exists = await prisma.usuario.findUnique({ where: { id } });
    if (!exists) return null;

    return prisma.usuario.update({
      where: { id },
      data: { equipe_id: equipeId, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.usuario.delete({ where: { id } });
  }
};
