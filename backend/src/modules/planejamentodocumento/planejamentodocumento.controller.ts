import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { planejamentoDocumentoService } from './planejamentodocumento.service';
import {
  CreatePlanejamentoDocumentoInput,
  UpdatePlanejamentoDocumentoInput
} from './planejamentodocumento.schema';
import { podeAcessarPlanejamento } from '../../shared/perfis';

export const planejamentoDocumentoController = {
  // Leitura é aberta a todos aqui (diferente de PlanejamentoAtividade) -
  // PlanejamentoDocumento.jsonc original tinha "read": {}.
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const query = request.query as Record<string, string>;
      const registros = await planejamentoDocumentoService.list({
        id: query.id,
        empreendimento_id: query.empreendimento_id,
        documento_id: query.documento_id,
        executor_principal: query.executor_principal,
        executor_principal_in: query.executor_principal_in?.split(','),
        status_ne: query.status_ne,
        envolve_usuario: query.envolve_usuario,
        limit: query.limit ? Number(query.limit) : undefined
      });
      return reply.send(registros);
    } catch (error) {
      console.error('Erro ao listar planejamento de documentos:', error);
      return reply.status(500).send({ error: 'Erro ao listar planejamento de documentos' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await planejamentoDocumentoService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar planejamento de documento:', error);
      return reply.status(500).send({ error: 'Erro ao buscar planejamento de documento' });
    }
  },

  // Criação aberta a qualquer autenticado - created_by do novo registro é
  // sempre o próprio criador, uma das condições que já libera acesso.
  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await planejamentoDocumentoService.create(
        request.body as CreatePlanejamentoDocumentoInput,
        { id: request.user!.id, email: request.user!.email }
      );
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar planejamento de documento:', error);
      return reply.status(500).send({ error: 'Erro ao criar planejamento de documento' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await planejamentoDocumentoService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Registro não encontrado' });

      if (!podeAcessarPlanejamento(request.user!, existing, { considerarExecutores: true })) {
        return reply.status(403).send({ error: 'Permissão insuficiente para editar este registro' });
      }

      const registro = await planejamentoDocumentoService.update(
        id,
        request.body as UpdatePlanejamentoDocumentoInput
      );
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar planejamento de documento:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar planejamento de documento' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await planejamentoDocumentoService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Registro não encontrado' });

      if (!podeAcessarPlanejamento(request.user!, existing, { considerarExecutores: false })) {
        return reply.status(403).send({ error: 'Permissão insuficiente para excluir este registro' });
      }

      await planejamentoDocumentoService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar planejamento de documento:', error);
      return reply.status(500).send({ error: 'Erro ao deletar planejamento de documento' });
    }
  }
};
