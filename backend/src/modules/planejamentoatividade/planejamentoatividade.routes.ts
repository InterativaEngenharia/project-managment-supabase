import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { planejamentoAtividadeController } from './planejamentoatividade.controller';
import {
  createPlanejamentoAtividadeSchema,
  updatePlanejamentoAtividadeSchema,
  planejamentoAtividadeParamsSchema
} from './planejamentoatividade.schema';

// Sem gate de perfil no preHandler: a regra (executor_principal/executores/
// criador ou coordenador+) só pode ser decidida por registro - ver
// planejamentoatividade.controller.ts.
export async function planejamentoAtividadeRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/planejamento-atividades', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoAtividadeController.list(request, reply);
  });

  app.get('/planejamento-atividades/:id', {
    schema: { params: planejamentoAtividadeParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoAtividadeController.getById(request, reply);
  });

  app.post('/planejamento-atividades', {
    schema: { body: createPlanejamentoAtividadeSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoAtividadeController.create(request, reply);
  });

  app.patch('/planejamento-atividades/:id', {
    schema: { params: planejamentoAtividadeParamsSchema, body: updatePlanejamentoAtividadeSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoAtividadeController.update(request, reply);
  });

  app.delete('/planejamento-atividades/:id', {
    schema: { params: planejamentoAtividadeParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return planejamentoAtividadeController.delete(request, reply);
  });
}
