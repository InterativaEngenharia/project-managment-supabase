import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { sobraUsuarioController } from './sobrausuario.controller';
import {
  createSobraUsuarioSchema,
  updateSobraUsuarioSchema,
  sobraUsuarioParamsSchema
} from './sobrausuario.schema';

// Sem restrição de perfil de propósito: decisão do usuário foi manter
// aberto a qualquer autenticado, igual já funciona hoje na aba de Sobras
// (o jsonc original dizia "admin apenas", mas isso quebraria a feature
// real - ver backend/PERMISSOES.md).
export async function sobraUsuarioRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/sobras-usuario', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return sobraUsuarioController.list(request, reply);
  });

  app.get('/sobras-usuario/:id', {
    schema: { params: sobraUsuarioParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return sobraUsuarioController.getById(request, reply);
  });

  app.post('/sobras-usuario', {
    schema: { body: createSobraUsuarioSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return sobraUsuarioController.create(request, reply);
  });

  app.patch('/sobras-usuario/:id', {
    schema: { params: sobraUsuarioParamsSchema, body: updateSobraUsuarioSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return sobraUsuarioController.update(request, reply);
  });

  app.delete('/sobras-usuario/:id', {
    schema: { params: sobraUsuarioParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return sobraUsuarioController.delete(request, reply);
  });
}
