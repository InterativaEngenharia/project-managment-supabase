import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { pavimentoService } from './pavimento.service';
import { CreatePavimentoInput, UpdatePavimentoInput } from './pavimento.schema';
import { podeEditarRecurso } from '../../shared/perfis';

export const pavimentoController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { empreendimento_id } = request.query as { empreendimento_id?: string };
      return reply.send(await pavimentoService.list(empreendimento_id));
    } catch (error) {
      console.error('Erro ao listar pavimentos:', error);
      return reply.status(500).send({ error: 'Erro ao listar pavimentos' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await pavimentoService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Pavimento não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar pavimento:', error);
      return reply.status(500).send({ error: 'Erro ao buscar pavimento' });
    }
  },

  // Criação aberta a qualquer autenticado - created_by do novo registro é
  // sempre o próprio criador, então a regra "dono ou lider+" já vale de cara.
  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await pavimentoService.create(request.body as CreatePavimentoInput, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar pavimento:', error);
      return reply.status(500).send({ error: 'Erro ao criar pavimento' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await pavimentoService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Pavimento não encontrado' });

      if (!podeEditarRecurso(request.user!, existing, 'lider')) {
        return reply.status(403).send({ error: 'Permissão insuficiente para editar este pavimento' });
      }

      const registro = await pavimentoService.update(id, request.body as UpdatePavimentoInput);
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar pavimento:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar pavimento' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await pavimentoService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Pavimento não encontrado' });

      if (!podeEditarRecurso(request.user!, existing, 'lider')) {
        return reply.status(403).send({ error: 'Permissão insuficiente para excluir este pavimento' });
      }

      await pavimentoService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar pavimento:', error);
      return reply.status(500).send({ error: 'Erro ao deletar pavimento' });
    }
  }
};
