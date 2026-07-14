import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { disciplinasService } from './disciplinas.service';
import { CreateDisciplinaInput, UpdateDisciplinaInput } from './disciplinas.schema';

export const disciplinasController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const disciplinas = await disciplinasService.list();
      return reply.send(disciplinas);
    } catch (error) {
      console.error('Erro ao listar disciplinas:', error);
      return reply.status(500).send({ error: 'Erro ao listar disciplinas' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const disciplina = await disciplinasService.getById(id);
      
      if (!disciplina) {
        return reply.status(404).send({ error: 'Disciplina não encontrada' });
      }
      
      return reply.send(disciplina);
    } catch (error) {
      console.error('Erro ao buscar disciplina:', error);
      return reply.status(500).send({ error: 'Erro ao buscar disciplina' });
    }
  },

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      // request.user é sempre populado pelo authMiddleware antes desta rota rodar.
      const disciplina = await disciplinasService.create(
        request.body as CreateDisciplinaInput,
        { id: request.user!.id, email: request.user!.email }
      );
      return reply.status(201).send(disciplina);
    } catch (error) {
      console.error('Erro ao criar disciplina:', error);
      return reply.status(500).send({ error: 'Erro ao criar disciplina' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const disciplina = await disciplinasService.update(id, request.body as UpdateDisciplinaInput);
      
      if (!disciplina) {
        return reply.status(404).send({ error: 'Disciplina não encontrada' });
      }
      
      return reply.send(disciplina);
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar disciplina' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await disciplinasService.getById(id);

      if (!existing) {
        return reply.status(404).send({ error: 'Disciplina não encontrada' });
      }

      await disciplinasService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar disciplina:', error);
      return reply.status(500).send({ error: 'Erro ao deletar disciplina' });
    }
  }
};
