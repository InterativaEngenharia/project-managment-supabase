import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { requirePerfilMinimo } from '../../middlewares/authorize.middleware';
import { controleOSController } from './controleos.controller';
import { createControleOSSchema, updateControleOSSchema, controleOSParamsSchema } from './controleos.schema';

// Sem regra customizada no Base44 original - decisão do usuário: mesmo
// limiar do Empreendimento (coordenador e acima).
const SOMENTE_COORDENADOR_OU_ACIMA = requirePerfilMinimo('coordenador');

export async function controleOSRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/controle-os', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return controleOSController.list(request, reply);
  });

  app.get('/controle-os/:id', {
    schema: { params: controleOSParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return controleOSController.getById(request, reply);
  });

  app.post('/controle-os', {
    schema: { body: createControleOSSchema },
    preHandler: [authMiddleware, SOMENTE_COORDENADOR_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return controleOSController.create(request, reply);
  });

  app.patch('/controle-os/:id', {
    schema: { params: controleOSParamsSchema, body: updateControleOSSchema },
    preHandler: [authMiddleware, SOMENTE_COORDENADOR_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return controleOSController.update(request, reply);
  });

  app.delete('/controle-os/:id', {
    schema: { params: controleOSParamsSchema },
    preHandler: [authMiddleware, SOMENTE_COORDENADOR_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return controleOSController.delete(request, reply);
  });
}
