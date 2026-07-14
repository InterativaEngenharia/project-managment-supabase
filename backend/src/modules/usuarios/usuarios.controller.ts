import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { usuariosService } from './usuarios.service';
import { CreateUsuarioInput, UpdateUsuarioInput } from './usuarios.schema';
import { podeAtribuirPerfil } from '../../shared/perfis';

export const usuariosController = {
  async list(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { sort } = request.query as { sort?: string };
      const usuarios = await usuariosService.list(sort);
      return reply.send(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return reply.status(500).send({ error: 'Erro ao listar usuários' });
    }
  },

  async getById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const usuario = await usuariosService.getById(id);

      if (!usuario) {
        return reply.status(404).send({ error: 'Usuário não encontrado' });
      }

      return reply.send(usuario);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return reply.status(500).send({ error: 'Erro ao buscar usuário' });
    }
  },

  // GET /usuarios/me - sempre resolve pelo e-mail do token, nunca por um id
  // vindo do cliente.
  async me(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const usuario = await usuariosService.getByEmail(request.user!.email);

      if (!usuario) {
        return reply.status(404).send({ error: 'Usuário não encontrado' });
      }

      return reply.send(usuario);
    } catch (error) {
      console.error('Erro ao buscar usuário autenticado:', error);
      return reply.status(500).send({ error: 'Erro ao buscar usuário autenticado' });
    }
  },

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const body = request.body as CreateUsuarioInput;

      if (!podeAtribuirPerfil(request.user!.perfil, body.perfil)) {
        return reply.status(403).send({
          error: `Seu perfil não pode atribuir o perfil "${body.perfil}"`
        });
      }

      const usuario = await usuariosService.create(body, {
        id: request.user!.id,
        email: request.user!.email
      });
      return reply.status(201).send(usuario);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return reply.status(500).send({ error: 'Erro ao criar usuário' });
    }
  },

  // PATCH /usuarios/:id - esta rota é acessível a qualquer autenticado
  // (ver usuarios.routes.ts), porque uma troca de equipe (equipe_id) é uma
  // ação de baixo risco hoje aberta a todo mundo (ex: AlocacaoEquipeTab).
  // Qualquer outro campo no corpo exige lider/direcao/admin - e mudar
  // "perfil" ainda passa pela regra de quem pode atribuir qual perfil.
  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as UpdateUsuarioInput;
      const campos = Object.keys(body);
      const somenteTrocaDeEquipe = campos.length > 0 && campos.every((c) => c === 'equipe_id');

      if (!somenteTrocaDeEquipe) {
        const perfilDeQuemEdita = request.user!.perfil;
        const podeEditarCompleto = perfilDeQuemEdita === 'admin' || perfilDeQuemEdita === 'lider' || perfilDeQuemEdita === 'direcao';

        if (!podeEditarCompleto) {
          return reply.status(403).send({ error: 'Permissão insuficiente para editar este usuário' });
        }

        if (body.perfil && !podeAtribuirPerfil(perfilDeQuemEdita, body.perfil)) {
          return reply.status(403).send({
            error: `Seu perfil não pode atribuir o perfil "${body.perfil}"`
          });
        }
      }

      const usuario = await usuariosService.update(id, body);

      if (!usuario) {
        return reply.status(404).send({ error: 'Usuário não encontrado' });
      }

      return reply.send(usuario);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar usuário' });
    }
  },

  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const existing = await usuariosService.getById(id);

      if (!existing) {
        return reply.status(404).send({ error: 'Usuário não encontrado' });
      }

      await usuariosService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return reply.status(500).send({ error: 'Erro ao deletar usuário' });
    }
  }
};
