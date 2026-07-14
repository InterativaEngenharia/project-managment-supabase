import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from './auth.middleware';
import { temNivelMinimo, isAdminPerfil, PERFIS_HIERARQUIA } from '../shared/perfis';

/**
 * Exige um nível mínimo na hierarquia de perfis (ver shared/perfis.ts).
 * "admin" sempre passa, independente do nível pedido.
 */
export function requirePerfilMinimo(minimo: keyof typeof PERFIS_HIERARQUIA) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Não autenticado' });
    }

    if (!temNivelMinimo(request.user.perfil, minimo)) {
      return reply.status(403).send({
        error: 'Permissão insuficiente',
        nivelMinimo: minimo,
        perfilAtual: request.user.perfil
      });
    }
  };
}

/**
 * Exige que o perfil do usuário esteja numa lista exata (para regras que não
 * seguem a hierarquia numérica - ex: só lider/direcao acessam Usuarios, e
 * gestao fica de fora mesmo tendo nível mais alto que lider).
 * "admin" sempre passa.
 */
export function requirePerfilExato(perfisPermitidos: string[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Não autenticado' });
    }

    if (isAdminPerfil(request.user.perfil)) return;

    if (!request.user.perfil || !perfisPermitidos.includes(request.user.perfil)) {
      return reply.status(403).send({
        error: 'Permissão insuficiente',
        perfisPermitidos,
        perfilAtual: request.user.perfil
      });
    }
  };
}
