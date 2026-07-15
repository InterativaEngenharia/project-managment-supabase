import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { empreendimentoController } from './empreendimento.controller';
import {
  createEmpreendimentoSchema,
  updateEmpreendimentoSchema,
  empreendimentoParamsSchema
} from './empreendimento.schema';

// Sem gate de perfil no preHandler de propósito: update/delete exigem ser
// quem criou OU ter nível coordenador+ - isso só pode ser decidido depois
// de buscar o registro, então a regra fica em empreendimento.controller.ts.
export async function empreendimentoRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/empreendimentos', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return empreendimentoController.list(request, reply);
  });

  app.get('/empreendimentos/:id', {
    schema: { params: empreendimentoParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return empreendimentoController.getById(request, reply);
  });

  app.post('/empreendimentos', {
    schema: { body: createEmpreendimentoSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return empreendimentoController.create(request, reply);
  });

  app.patch('/empreendimentos/:id', {
    schema: { params: empreendimentoParamsSchema, body: updateEmpreendimentoSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return empreendimentoController.update(request, reply);
  });

  app.delete('/empreendimentos/:id', {
    schema: { params: empreendimentoParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return empreendimentoController.delete(request, reply);
  });
}
