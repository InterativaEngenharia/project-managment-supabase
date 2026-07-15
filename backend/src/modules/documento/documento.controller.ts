import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { documentoService } from './documento.service';
import { CreateDocumentoInput, UpdateDocumentoInput } from './documento.schema';

export const documentoController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      return reply.send(await documentoService.list());
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      return reply.status(500).send({ error: 'Erro ao listar documentos' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await documentoService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Documento não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      return reply.status(500).send({ error: 'Erro ao buscar documento' });
    }
  },

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await documentoService.create(request.body as CreateDocumentoInput, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      return reply.status(500).send({ error: 'Erro ao criar documento' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await documentoService.update(id, request.body as UpdateDocumentoInput);
      if (!registro) return reply.status(404).send({ error: 'Documento não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar documento' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await documentoService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Documento não encontrado' });
      await documentoService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      return reply.status(500).send({ error: 'Erro ao deletar documento' });
    }
  }
};
