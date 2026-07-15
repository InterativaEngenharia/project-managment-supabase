import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { equipeService } from './equipe.service';
import { CreateEquipeInput, UpdateEquipeInput } from './equipe.schema';

export const equipeController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      return reply.send(await equipeService.list());
    } catch (error) {
      console.error('Erro ao listar equipes:', error);
      return reply.status(500).send({ error: 'Erro ao listar equipes' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await equipeService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Equipe não encontrada' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      return reply.status(500).send({ error: 'Erro ao buscar equipe' });
    }
  },

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await equipeService.create(request.body as CreateEquipeInput, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      return reply.status(500).send({ error: 'Erro ao criar equipe' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await equipeService.update(id, request.body as UpdateEquipeInput);
      if (!registro) return reply.status(404).send({ error: 'Equipe não encontrada' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar equipe' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await equipeService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Equipe não encontrada' });
      await equipeService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      return reply.status(500).send({ error: 'Erro ao deletar equipe' });
    }
  }
};
