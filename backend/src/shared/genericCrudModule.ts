import { randomUUID } from 'crypto';
import { FastifyInstance, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z, ZodTypeAny } from 'zod';
import { prisma } from '../config';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { parseFilterQuery } from './queryFilter';

/**
 * Fábrica de rotas para entidades "simples": sem regra de RLS customizada
 * no Base44 original, sem trava de perfil na tela que as usa hoje - leitura
 * e escrita abertas a qualquer autenticado (ver backend/PERMISSOES.md).
 * Não use isso pra nenhuma entidade com regra de permissão própria
 * (Usuario, Empreendimento, Comercial, PlanejamentoAtividade, etc.) -
 * essas continuam com módulo escrito à mão.
 */
export function registerGenericCrudRoutes(fastify: FastifyInstance, config: {
  path: string;
  prismaModel: string;
  createSchema: ZodTypeAny;
  orderBy?: Record<string, 'asc' | 'desc'>;
}) {
  const { path, prismaModel, createSchema, orderBy } = config;
  const model = (prisma as unknown as Record<string, any>)[prismaModel];
  const updateSchema = (createSchema as z.ZodObject<any>).partial();
  const paramsSchema = z.object({ id: z.string().min(1) });
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  const notFound = (reply: FastifyReply) => reply.status(404).send({ error: 'Registro não encontrado' });
  const erro = (reply: FastifyReply, acao: string, e: unknown) => {
    console.error(`Erro ao ${acao} ${path}:`, e);
    return reply.status(500).send({ error: `Erro ao ${acao} ${path}` });
  };

  app.get(`/${path}`, { preHandler: [authMiddleware] }, async (request, reply) => {
    try {
      const { where, limit } = parseFilterQuery(request.query as Record<string, string>);
      return reply.send(await model.findMany({ where, orderBy, take: limit }));
    } catch (e) {
      return erro(reply, 'listar', e);
    }
  });

  app.get(`/${path}/:id`, {
    schema: { params: paramsSchema },
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const registro = await model.findUnique({ where: { id } });
      if (!registro) return notFound(reply);
      return reply.send(registro);
    } catch (e) {
      return erro(reply, 'buscar', e);
    }
  });

  app.post(`/${path}`, {
    schema: { body: createSchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const registro = await model.create({
        data: {
          id: randomUUID(),
          ...(request.body as object),
          created_date: new Date(),
          updated_date: new Date(),
          created_by_id: request.user!.id,
          created_by: request.user!.email
        }
      });
      return reply.status(201).send(registro);
    } catch (e) {
      return erro(reply, 'criar', e);
    }
  });

  app.patch(`/${path}/:id`, {
    schema: { params: paramsSchema, body: updateSchema },
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const exists = await model.findUnique({ where: { id } });
      if (!exists) return notFound(reply);
      const registro = await model.update({
        where: { id },
        data: { ...(request.body as object), updated_date: new Date() }
      });
      return reply.send(registro);
    } catch (e) {
      return erro(reply, 'atualizar', e);
    }
  });

  app.delete(`/${path}/:id`, {
    schema: { params: paramsSchema },
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const exists = await model.findUnique({ where: { id } });
      if (!exists) return notFound(reply);
      await model.delete({ where: { id } });
      return reply.status(204).send();
    } catch (e) {
      return erro(reply, 'deletar', e);
    }
  });
}
