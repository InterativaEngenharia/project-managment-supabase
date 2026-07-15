import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { empreendimentoService } from './empreendimento.service';
import { CreateEmpreendimentoInput, UpdateEmpreendimentoInput } from './empreendimento.schema';
import { podeEditarRecurso } from '../../shared/perfis';

export const empreendimentoController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      return reply.send(await empreendimentoService.list());
    } catch (error) {
      console.error('Erro ao listar empreendimentos:', error);
      return reply.status(500).send({ error: 'Erro ao listar empreendimentos' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await empreendimentoService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Empreendimento não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar empreendimento:', error);
      return reply.status(500).send({ error: 'Erro ao buscar empreendimento' });
    }
  },

  // Criação é aberta a qualquer autenticado - o created_by do novo registro
  // é sempre o próprio criador, então a regra "dono ou coordenador+" já
  // está trivialmente satisfeita nesse momento.
  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await empreendimentoService.create(request.body as CreateEmpreendimentoInput, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar empreendimento:', error);
      return reply.status(500).send({ error: 'Erro ao criar empreendimento' });
    }
  },

  // Editar/excluir exige ser quem criou OU ter nível coordenador+ (ver
  // podeEditarRecurso em shared/perfis.ts) - regra do Empreendimento.jsonc
  // original do Base44.
  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await empreendimentoService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Empreendimento não encontrado' });

      if (!podeEditarRecurso(request.user!, existing, 'coordenador')) {
        return reply.status(403).send({ error: 'Permissão insuficiente para editar este empreendimento' });
      }

      const registro = await empreendimentoService.update(id, request.body as UpdateEmpreendimentoInput);
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar empreendimento:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar empreendimento' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await empreendimentoService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Empreendimento não encontrado' });

      if (!podeEditarRecurso(request.user!, existing, 'coordenador')) {
        return reply.status(403).send({ error: 'Permissão insuficiente para excluir este empreendimento' });
      }

      await empreendimentoService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar empreendimento:', error);
      return reply.status(500).send({ error: 'Erro ao deletar empreendimento' });
    }
  }
};
