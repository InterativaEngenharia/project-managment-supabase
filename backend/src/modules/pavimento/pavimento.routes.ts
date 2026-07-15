import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { pavimentoController } from './pavimento.controller';
import { createPavimentoSchema, updatePavimentoSchema, pavimentoParamsSchema } from './pavimento.schema';

// Sem gate de perfil no preHandler: update/delete exigem ser dono ou lider+,
// só decidível depois de buscar o registro - ver pavimento.controller.ts.
// Leitura aberta a todos (decisão do usuário - o jsonc original usava uma
// chave "role" incomum que não corresponde a nenhuma coluna real).
export async function pavimentoRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/pavimentos', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return pavimentoController.list(request, reply);
  });

  app.get('/pavimentos/:id', {
    schema: { params: pavimentoParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return pavimentoController.getById(request, reply);
  });

  app.post('/pavimentos', {
    schema: { body: createPavimentoSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return pavimentoController.create(request, reply);
  });

  app.patch('/pavimentos/:id', {
    schema: { params: pavimentoParamsSchema, body: updatePavimentoSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return pavimentoController.update(request, reply);
  });

  app.delete('/pavimentos/:id', {
    schema: { params: pavimentoParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return pavimentoController.delete(request, reply);
  });
}
