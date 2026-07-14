import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { requirePerfilExato } from '../../middlewares/authorize.middleware';
import { disciplinasController } from './disciplinas.controller';
import {
  createDisciplinaSchema,
  updateDisciplinaSchema,
  disciplinaParamsSchema
} from './disciplinas.schema';

// Escrita de Disciplina é só admin + lider - confirmado contra a regra de
// RLS original do Base44 (não é "coordenador e acima": gestao/direcao/
// coordenador ficam de fora mesmo tendo nível maior ou igual a lider na
// hierarquia numérica, ver shared/perfis.ts).
const SOMENTE_LIDER = requirePerfilExato(['lider']);

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

  // Criar nova disciplina (requer lider ou admin)
  app.post('/disciplinas', {
    schema: { body: createDisciplinaSchema },
    preHandler: [
      authMiddleware,
      SOMENTE_LIDER
    ]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.create(request, reply);
  });

  // Atualizar disciplina
  app.patch('/disciplinas/:id', {
    schema: { params: disciplinaParamsSchema, body: updateDisciplinaSchema },
    preHandler: [
      authMiddleware,
      SOMENTE_LIDER
    ]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.update(request, reply);
  });

  // Deletar disciplina
  app.delete('/disciplinas/:id', {
    schema: { params: disciplinaParamsSchema },
    preHandler: [
      authMiddleware,
      SOMENTE_LIDER
    ]
  }, async (request: AuthenticatedRequest, reply) => {
    return disciplinasController.delete(request, reply);
  });
}
