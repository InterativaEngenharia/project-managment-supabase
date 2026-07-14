import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../config';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    perfil: string;
    role: string;
    nome?: string;
    cargo?: string;
  };
}

/**
 * Middleware de autenticação
 * Valida o JWT do Supabase Auth e popula req.user
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

    // Buscar perfil do usuário na tabela Usuario
    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from('Usuario')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (usuarioError || !usuario) {
      return reply.status(403).send({ error: 'Usuário não cadastrado no sistema' });
    }

    // Popular req.user com dados do usuário
    request.user = {
      id: data.user.id,
      email: userEmail,
      perfil: usuario.perfil || 'user',
      role: usuario.role || 'user',
      nome: usuario.nome || data.user.user_metadata?.nome,
      cargo: usuario.cargo
    };

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return reply.status(500).send({ error: 'Erro interno de autenticação' });
  }
}
