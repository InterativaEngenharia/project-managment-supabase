import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { sobraUsuarioService } from './sobrausuario.service';
import { CreateSobraUsuarioInput, UpdateSobraUsuarioInput } from './sobrausuario.schema';

export const sobraUsuarioController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { empreendimento_id } = request.query as { empreendimento_id?: string };
      return reply.send(await sobraUsuarioService.list(empreendimento_id));
    } catch (error) {
      console.error('Erro ao listar sobras:', error);
      return reply.status(500).send({ error: 'Erro ao listar sobras' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await sobraUsuarioService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar sobra:', error);
      return reply.status(500).send({ error: 'Erro ao buscar sobra' });
    }
  },

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await sobraUsuarioService.create(request.body as CreateSobraUsuarioInput, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar sobra:', error);
      return reply.status(500).send({ error: 'Erro ao criar sobra' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await sobraUsuarioService.update(id, request.body as UpdateSobraUsuarioInput);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar sobra:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar sobra' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await sobraUsuarioService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Registro não encontrado' });
      await sobraUsuarioService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar sobra:', error);
      return reply.status(500).send({ error: 'Erro ao deletar sobra' });
    }
  }
};
