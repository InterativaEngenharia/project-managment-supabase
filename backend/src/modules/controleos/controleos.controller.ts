import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { controleOSService } from './controleos.service';
import { CreateControleOSInput, UpdateControleOSInput } from './controleos.schema';

export const controleOSController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      return reply.send(await controleOSService.list());
    } catch (error) {
      console.error('Erro ao listar ControleOS:', error);
      return reply.status(500).send({ error: 'Erro ao listar ControleOS' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await controleOSService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar ControleOS:', error);
      return reply.status(500).send({ error: 'Erro ao buscar ControleOS' });
    }
  },

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await controleOSService.create(request.body as CreateControleOSInput, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar ControleOS:', error);
      return reply.status(500).send({ error: 'Erro ao criar ControleOS' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await controleOSService.update(id, request.body as UpdateControleOSInput);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar ControleOS:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar ControleOS' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await controleOSService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Registro não encontrado' });
      await controleOSService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar ControleOS:', error);
      return reply.status(500).send({ error: 'Erro ao deletar ControleOS' });
    }
  }
};
