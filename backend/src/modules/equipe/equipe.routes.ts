import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { requirePerfilExato } from '../../middlewares/authorize.middleware';
import { equipeController } from './equipe.controller';
import { createEquipeSchema, updateEquipeSchema, equipeParamsSchema } from './equipe.schema';

// Escrita = lider + direcao (admin via bypass) - PERMISSOES.md / Equipe.jsonc.
// Não é um corte de hierarquia limpo: gestao (nível 5, entre lider e
// direcao) fica de fora de propósito, igual ao caso de Usuarios/Disciplina.
const SOMENTE_LIDER_OU_DIRECAO = requirePerfilExato(['lider', 'direcao']);

export async function equipeRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/equipes', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return equipeController.list(request, reply);
  });

  app.get('/equipes/:id', {
    schema: { params: equipeParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return equipeController.getById(request, reply);
  });

  app.post('/equipes', {
    schema: { body: createEquipeSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_OU_DIRECAO]
  }, async (request: AuthenticatedRequest, reply) => {
    return equipeController.create(request, reply);
  });

  app.patch('/equipes/:id', {
    schema: { params: equipeParamsSchema, body: updateEquipeSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_OU_DIRECAO]
  }, async (request: AuthenticatedRequest, reply) => {
    return equipeController.update(request, reply);
  });

  app.delete('/equipes/:id', {
    schema: { params: equipeParamsSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_OU_DIRECAO]
  }, async (request: AuthenticatedRequest, reply) => {
    return equipeController.delete(request, reply);
  });
}
