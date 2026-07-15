import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { planejamentoDocumentoController } from './planejamentodocumento.controller';
import {
  createPlanejamentoDocumentoSchema,
  updatePlanejamentoDocumentoSchema,
  planejamentoDocumentoParamsSchema
} from './planejamentodocumento.schema';

export async function planejamentoDocumentoRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/planejamento-documentos', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoDocumentoController.list(request, reply);
  });

  app.get('/planejamento-documentos/:id', {
    schema: { params: planejamentoDocumentoParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoDocumentoController.getById(request, reply);
  });

  app.post('/planejamento-documentos', {
    schema: { body: createPlanejamentoDocumentoSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoDocumentoController.create(request, reply);
  });

  app.patch('/planejamento-documentos/:id', {
    schema: { params: planejamentoDocumentoParamsSchema, body: updatePlanejamentoDocumentoSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoDocumentoController.update(request, reply);
  });

  app.delete('/planejamento-documentos/:id', {
    schema: { params: planejamentoDocumentoParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoDocumentoController.delete(request, reply);
  });
}
