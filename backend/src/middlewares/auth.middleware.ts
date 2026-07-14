import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin, prisma } from '../config';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    usuarioId: string;
    email: string;
    perfil: string;
    nome?: string | null;
    cargo?: string | null;
  };
}

/**
 * Middleware de autenticação
 * Valida o JWT do Supabase Auth e popula req.user com os dados da tabela
 * Usuario (nunca do user_metadata do Supabase Auth, que o próprio usuário
 * pode reescrever via supabase.auth.updateUser()).
 */
export async function authMiddleware(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Validar token com Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user || !data.user.email) {
      return reply.status(401).send({ error: 'Token inválido' });
    }

    const userEmail = data.user.email;

    // Buscar perfil do usuário na tabela Usuario - única fonte de verdade
    // para autorização (a tabela não tem coluna "role", só "perfil").
    const usuario = await prisma.usuario.findFirst({ where: { email: userEmail } });

    if (!usuario) {
      return reply.status(403).send({ error: 'Usuário não cadastrado no sistema' });
    }

    request.user = {
      id: data.user.id,
      usuarioId: usuario.id,
      email: userEmail,
      perfil: usuario.perfil || 'user',
      nome: usuario.nome,
      cargo: usuario.cargo
    };

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return reply.status(500).send({ error: 'Erro interno de autenticação' });
  }
}
