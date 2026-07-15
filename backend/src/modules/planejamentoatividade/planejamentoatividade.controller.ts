import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { planejamentoAtividadeService } from './planejamentoatividade.service';
import {
  CreatePlanejamentoAtividadeInput,
  UpdatePlanejamentoAtividadeInput
} from './planejamentoatividade.schema';
import { podeAcessarPlanejamento } from '../../shared/perfis';

export const planejamentoAtividadeController = {
  // Leitura não é aberta a todos aqui (diferente da maioria dos outros
  // módulos) - a regra original só deixa ver o que o usuário é
  // executor_principal/está em executores[], ou tem nível coordenador+.
  // Como o backend usa service_role (ignora RLS), replicamos o filtro aqui
  // em vez de devolver a tabela inteira.
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const query = request.query as Record<string, string>;
      const todos = await planejamentoAtividadeService.list({
        id: query.id,
        empreendimento_id: query.empreendimento_id,
        documento_id: query.documento_id,
        atividade_id: query.atividade_id,
        etapa: query.etapa,
        executor_principal: query.executor_principal,
        executor_principal_in: query.executor_principal_in?.split(','),
        status_ne: query.status_ne,
        limit: query.limit ? Number(query.limit) : undefined
      });
      const visiveis = todos.filter((registro) =>
        podeAcessarPlanejamento(request.user!, registro, { considerarExecutores: true })
      );
      return reply.send(visiveis);
    } catch (error) {
      console.error('Erro ao listar planejamento de atividades:', error);
      return reply.status(500).send({ error: 'Erro ao listar planejamento de atividades' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const registro = await planejamentoAtividadeService.getById(id);
      if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });

      if (!podeAcessarPlanejamento(request.user!, registro, { considerarExecutores: true })) {
        return reply.status(403).send({ error: 'Permissão insuficiente para ver este registro' });
      }

      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao buscar planejamento de atividade:', error);
      return reply.status(500).send({ error: 'Erro ao buscar planejamento de atividade' });
    }
  },

  // Criação é aberta a qualquer autenticado - created_by do novo registro é
  // sempre o próprio criador, uma das condições que já libera acesso.
  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const registro = await planejamentoAtividadeService.create(
        request.body as CreatePlanejamentoAtividadeInput,
        { id: request.user!.id, email: request.user!.email }
      );
      return reply.status(201).send(registro);
    } catch (error) {
      console.error('Erro ao criar planejamento de atividade:', error);
      return reply.status(500).send({ error: 'Erro ao criar planejamento de atividade' });
    }
  },

  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await planejamentoAtividadeService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Registro não encontrado' });

      if (!podeAcessarPlanejamento(request.user!, existing, { considerarExecutores: true })) {
        return reply.status(403).send({ error: 'Permissão insuficiente para editar este registro' });
      }

      const registro = await planejamentoAtividadeService.update(
        id,
        request.body as UpdatePlanejamentoAtividadeInput
      );
      return reply.send(registro);
    } catch (error) {
      console.error('Erro ao atualizar planejamento de atividade:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar planejamento de atividade' });
    }
  },

  // Exclusão não considera o array executores - só quem criou, é o
  // executor_principal ou coordenador+ (mesma regra da policy
  // planejamentoatividade_delete já existente no Supabase).
  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await planejamentoAtividadeService.getById(id);
      if (!existing) return reply.status(404).send({ error: 'Registro não encontrado' });

      if (!podeAcessarPlanejamento(request.user!, existing, { considerarExecutores: false })) {
        return reply.status(403).send({ error: 'Permissão insuficiente para excluir este registro' });
      }

      await planejamentoAtividadeService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar planejamento de atividade:', error);
      return reply.status(500).send({ error: 'Erro ao deletar planejamento de atividade' });
    }
  }
};
