import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { comercialService } from './comercial.service';
import { CreateComercialInput, UpdateComercialInput } from './comercial.schema';
import { parseFilterQuery } from '../../shared/queryFilter';

export const comercialController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { where, limit } = parseFilterQuery(request.query as Record<string, string>);
      return reply.send(await comercialService.list(where, limit));
    } catch (error) {
      console.error('Erro ao listar comercial:', error);
      return reply.status(500).send({ error: 'Erro ao listar comercial' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await comercialService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar comercial:', error);
      return reply.status(500).send({ error: 'Erro ao buscar comercial' });
    }
  },

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await comercialService.create(request.body as CreateComercialInput, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar comercial:', error);
      return reply.status(500).send({ error: 'Erro ao criar comercial' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await comercialService.update(id, request.body as UpdateComercialInput);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar comercial:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar comercial' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await comercialService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Registro não encontrado' });
      await comercialService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar comercial:', error);
      return reply.status(500).send({ error: 'Erro ao deletar comercial' });
    }
  }
};
