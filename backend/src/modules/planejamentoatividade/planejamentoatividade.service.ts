import { randomUUID } from 'crypto';
import { prisma } from '../../config';
import {
  CreatePlanejamentoAtividadeInput,
  UpdatePlanejamentoAtividadeInput
} from './planejamentoatividade.schema';

export interface FiltrosPlanejamento {
  id?: string;
  empreendimento_id?: string;
  documento_id?: string;
  atividade_id?: string;
  etapa?: string;
  executor_principal?: string;
  executor_principal_in?: string[];
  status_ne?: string;
  // Traz tudo em que o e-mail aparece, como executor principal OU dentro do
  // array `executores` (JSON) - existe pra evitar que o frontend precise
  // buscar a tabela inteira (list() sem filtro) só pra filtrar isso na mão,
  // como o calendário fazia antes (19k+ linhas por carregamento).
  envolve_usuario?: string;
  limit?: number;
}

function montarWhere(filtros: FiltrosPlanejamento) {
  const where: Record<string, unknown> = {};
  if (filtros.id) where.id = filtros.id;
  if (filtros.empreendimento_id) where.empreendimento_id = filtros.empreendimento_id;
  if (filtros.documento_id) where.documento_id = filtros.documento_id;
  if (filtros.atividade_id) where.atividade_id = filtros.atividade_id;
  if (filtros.etapa) where.etapa = filtros.etapa;
  if (filtros.executor_principal) where.executor_principal = filtros.executor_principal;
  if (filtros.executor_principal_in) where.executor_principal = { in: filtros.executor_principal_in };
  if (filtros.status_ne) where.status = { not: filtros.status_ne };
  if (filtros.envolve_usuario) {
    where.OR = [
      { executor_principal: filtros.envolve_usuario },
      { executores: { array_contains: filtros.envolve_usuario } }
    ];
  }
  return where;
}

export const planejamentoAtividadeService = {
  async list(filtros: FiltrosPlanejamento = {}) {
    return prisma.planejamentoAtividade.findMany({
      where: montarWhere(filtros),
      orderBy: { created_date: 'desc' },
      take: filtros.limit
    });
  },

  async getById(id: string) {
    return prisma.planejamentoAtividade.findUnique({ where: { id } });
  },

  async create(payload: CreatePlanejamentoAtividadeInput, createdBy: { id: string; email: string }) {
    return prisma.planejamentoAtividade.create({
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

  async update(id: string, payload: UpdatePlanejamentoAtividadeInput) {
    return prisma.planejamentoAtividade.update({
      where: { id },
      data: { ...payload, updated_date: new Date() }
    });
  },

  async delete(id: string) {
    await prisma.planejamentoAtividade.delete({ where: { id } });
  }
};
