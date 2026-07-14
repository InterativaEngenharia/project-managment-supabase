import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware de autorização baseado em perfil/role
 * Baseado nas regras de routePermissions.js do frontend
 */
export function authorizeMiddleware(requiredProfiles?: string[], requiredRoles?: string[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Não autenticado' });
    }

    const { perfil, role } = request.user;

    // Admin tem acesso a tudo
    if (role === 'admin') {
      return; // Permite acesso
    }

    // Verificar perfil
    if (requiredProfiles && requiredProfiles.length > 0) {
      if (!requiredProfiles.includes(perfil)) {
        return reply.status(403).send({ 
          error: 'Permissão insuficiente',
          required: requiredProfiles,
          current: perfil
        });
      }
    }

    // Verificar role
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(role)) {
        return reply.status(403).send({ 
          error: 'Role insuficiente',
          required: requiredRoles,
          current: role
        });
      }
    }

    return; // Permite acesso
  };
}

/**
 * Helper para verificar permissões específicas (similar ao hasPermission do frontend)
 */
export function hasPermission(user: any, permission: string): boolean {
  if (user.role === 'admin') return true;

  const perfil = user.perfil;

  // Mapeamento de permissões por perfil (baseado no hasPermission do frontend)
  const permissionsByProfile: Record<string, string[]> = {
    'gestao': ['gestao'],
    'coordenador': ['coordenador', 'gestao'],
    'lider': ['lider', 'coordenador', 'gestao'],
    'direcao': ['direcao', 'lider', 'coordenador', 'gestao'],
    'apoio': ['apoio'],
    'consultor': ['consultor'],
    'user': ['user']
  };

  const userPermissions = permissionsByProfile[perfil] || ['user'];
  return userPermissions.includes(permission);
}
