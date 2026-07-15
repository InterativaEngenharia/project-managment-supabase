import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { requirePerfilMinimo } from '../../middlewares/authorize.middleware';
import { documentoController } from './documento.controller';
import { createDocumentoSchema, updateDocumentoSchema, documentoParamsSchema } from './documento.schema';

// Sem regra customizada no Base44 original - decisão do usuário: mesmo
// limiar do Empreendimento (coordenador e acima).
const SOMENTE_COORDENADOR_OU_ACIMA = requirePerfilMinimo('coordenador');

export async function documentoRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/documentos', { preHandler: [authMiddleware] }, async (request: AuthenticatedRequest, reply) => {
    return documentoController.list(request, reply);
  });

  app.get('/documentos/:id', {
    schema: { params: documentoParamsSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    return documentoController.getById(request, reply);
  });

  app.post('/documentos', {
    schema: { body: createDocumentoSchema },
    preHandler: [authMiddleware, SOMENTE_COORDENADOR_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return documentoController.create(request, reply);
  });

  app.patch('/documentos/:id', {
    schema: { params: documentoParamsSchema, body: updateDocumentoSchema },
    preHandler: [authMiddleware, SOMENTE_COORDENADOR_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return documentoController.update(request, reply);
  });

  app.delete('/documentos/:id', {
    schema: { params: documentoParamsSchema },
    preHandler: [authMiddleware, SOMENTE_COORDENADOR_OU_ACIMA]
  }, async (request: AuthenticatedRequest, reply) => {
    return documentoController.delete(request, reply);
  });
}
