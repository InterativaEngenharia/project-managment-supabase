import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { authorizeMiddleware } from '../../middlewares/authorize.middleware';
import { disciplinasController } from './disciplinas.controller';
import {
  createDisciplinaSchema,
  updateDisciplinaSchema,
  disciplinaParamsSchema
} from './disciplinas.schema';

export async function disciplinasRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Listar todas as disciplinas (público ou autenticado)
  app.get('/disciplinas', {
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.list(request, reply);
  });

  // Obter disciplina por ID
  app.get('/disciplinas/:id', {
    schema: { params: disciplinaParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.getById(request, reply);
  });

  // Criar nova disciplina (requer permissão de gestão ou admin)
  app.post('/disciplinas', {
    schema: { body: createDisciplinaSchema },
    preHandler: [
      authMiddleware,
      authorizeMiddleware(['gestao', 'coordenador', 'lider', 'direcao'], ['admin'])
    ]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.create(request, reply);
  });

  // Atualizar disciplina
  app.patch('/disciplinas/:id', {
    schema: { params: disciplinaParamsSchema, body: updateDisciplinaSchema },
    preHandler: [
      authMiddleware,
      authorizeMiddleware(['gestao', 'coordenador', 'lider', 'direcao'], ['admin'])
    ]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.update(request, reply);
  });

  // Deletar disciplina
  app.delete('/disciplinas/:id', {
    schema: { params: disciplinaParamsSchema },
    preHandler: [
      authMiddleware,
      authorizeMiddleware(['gestao', 'coordenador', 'lider', 'direcao'], ['admin'])
    ]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.delete(request, reply);
  });
}
