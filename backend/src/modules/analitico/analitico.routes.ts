import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config';

const querySchema = z.object({
  empreendimento_id: z.string().optional(),
  documento_id: z.string().optional()
});

// Analitico é só leitura no frontend hoje (nenhum .create/.update/.delete
// no código) - tabela criada manualmente no Supabase, populada por fora do
// app. Só expõe GET.
export async function analiticoRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/analiticos', {
    schema: { querystring: querySchema },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    const { empreendimento_id, documento_id } = request.query as z.infer<typeof querySchema>;
    const where: Record<string, string> = {};
    if (empreendimento_id) where.empreendimento_id = empreendimento_id;
    if (documento_id) where.documento_id = documento_id;

    const registros = await prisma.analitico.findMany({ where });
    return reply.send(registros);
  });

  app.get('/analiticos/:id', {
    schema: { params: z.object({ id: z.string().min(1) }) },
    preHandler: [authMiddleware]
  }, async (request: AuthenticatedRequest, reply) => {
    const { id } = request.params as { id: string };
    const registro = await prisma.analitico.findUnique({ where: { id } });
    if (!registro) return reply.status(404).send({ error: 'Registro não encontrado' });
    return reply.send(registro);
  });
}
