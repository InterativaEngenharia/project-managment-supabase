import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { requirePerfilMinimo } from '../../middlewares/authorize.middleware';
import { comercialController } from './comercial.controller';
import { createComercialSchema, updateComercialSchema, comercialParamsSchema } from './comercial.schema';

// Escrita = lider e acima (lider/gestao/direcao/admin) - PERMISSOES.md,
// confirmado contra o Comercial.jsonc original (a policy que estava viva no
// banco tinha esquecido "lider").
const SOMENTE_LIDER_OU_ACIMA = requirePerfilMinimo('lider');

export async function comercialRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/comercial', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return comercialController.list(request, reply);
  });

  app.get('/comercial/:id', {
    schema: { params: comercialParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return comercialController.getById(request, reply);
  });

  app.post('/comercial', {
    schema: { body: createComercialSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return comercialController.create(request, reply);
  });

  app.patch('/comercial/:id', {
    schema: { params: comercialParamsSchema, body: updateComercialSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return comercialController.update(request, reply);
  });

  app.delete('/comercial/:id', {
    schema: { params: comercialParamsSchema },
    preHandler: [authMiddleware, SOMENTE_LIDER_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return comercialController.delete(request, reply);
  });
}
