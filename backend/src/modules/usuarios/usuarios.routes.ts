import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { requirePerfilExato } from '../../middlewares/authorize.middleware';
import { usuariosController } from './usuarios.controller';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  usuarioParamsSchema
} from './usuarios.schema';

// Só lider/direcao (e admin, via bypass em requirePerfilExato) gerenciam
// usuários - mesma regra da página Usuarios.jsx no frontend
// (src/utils/routePermissions.js: perfilAtual === 'lider' || 'direcao').
const SOMENTE_LIDER_DIRECAO = requirePerfilExato(['lider', 'direcao']);

export async function usuariosRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Lido por qualquer autenticado - a tabela de usuários já é visível hoje
  // para todo mundo (seleção de responsáveis, equipes etc).
  app.get('/usuarios', {
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return usuariosController.list(request, reply);
  });

  app.get('/usuarios/me', {
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return usuariosController.me(request, reply);
  });

  app.get('/usuarios/:id', {
    schema: { params: usuarioParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return usuariosController.getById(request, reply);
  });

  app.post('/usuarios', {
    schema: { body: createUsuarioSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_DIRECAO]
  }, async (request: AuthenticatedRequest, reply) => {
    return usuariosController.create(request, reply);
  });

  // Sem gate de perfil no preHandler de propósito: uma troca isolada de
  // equipe_id é permitida a qualquer autenticado, qualquer outro campo exige
  // lider/direcao/admin - ver a regra completa em usuarios.controller.ts.
  app.patch('/usuarios/:id', {
    schema: { params: usuarioParamsSchema, body: updateUsuarioSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return usuariosController.update(request, reply);
  });

  app.delete('/usuarios/:id', {
    schema: { params: usuarioParamsSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_DIRECAO]
  }, async (request: AuthenticatedRequest, reply) => {
    return usuariosController.delete(request, reply);
  });
}
