import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import {
  CreatePlanejamentoDocumentoInput,
  UpdatePlanejamentoDocumentoInput
} from './planejamentodocumento.schema';

export interface FiltrosPlanejamento {
  id?: string;
  empreendimento_id?: string;
  documento_id?: string;
  executor_principal?: string;
  executor_principal_in?: string[];
  status_ne?: string;
  limit?: number;
}

function montarWhere(filtros: FiltrosPlanejamento) {
  const where: Record<string, unknown> = {};
  if (filtros.id) where.id = filtros.id;
  if (filtros.empreendimento_id) where.empreendimento_id = filtros.empreendimento_id;
  if (filtros.documento_id) where.documento_id = filtros.documento_id;
  if (filtros.executor_principal) where.executor_principal = filtros.executor_principal;
  if (filtros.executor_principal_in) where.executor_principal = { in: filtros.executor_principal_in };
  if (filtros.status_ne) where.status = { not: filtros.status_ne };
  return where;
}

export const planejamentoDocumentoService = {
  async list(filtros: FiltrosPlanejamento = {}) {
    return prisma.planejamentoDocumento.findMany({
      where: montarWhere(filtros),
      orderBy: { created_date: 'desc' },
      take: filtros.limit
    });
  },

  async getById(id: string) {
    return prisma.planejamentoDocumento.findUnique({ where: { id } });
  },

  async create(payload: CreatePlanejamentoDocumentoInput, createdBy: { id: string; email: string }) {
    return prisma.planejamentoDocumento.create({
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

  async update(id: string, payload: UpdatePlanejamentoDocumentoInput) {
    return prisma.planejamentoDocumento.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.planejamentoDocumento.delete({ where: { id } });
  }
};
