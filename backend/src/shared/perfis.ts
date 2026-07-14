// Espelha PERFIS_HIERARQUIA de src/components/contexts/ActivityTimerContext.jsx
// no frontend. Mantenha os dois em sincronia manualmente até existir um
// pacote compartilhado entre front e back.
export const PERFIS_HIERARQUIA: Record<string, number> = {
  direcao: 6,
  gestao: 5,
  lider: 4,
  coordenador: 3,
  apoio: 2,
  consultor: 1,
  user: 1
};

// "admin" não entra na hierarquia numérica - é um bypass total à parte,
// do mesmo jeito que o frontend trata `perfil === 'admin'` separado de
// PERFIS_HIERARQUIA (ver isAdmin em ActivityTimerContext.jsx).
export function isAdminPerfil(perfil: string | null | undefined): boolean {
  return perfil === 'admin';
}

export function nivelDoPerfil(perfil: string | null | undefined): number {
  if (!perfil) return 1;
  return PERFIS_HIERARQUIA[perfil] ?? 1;
}

export function temNivelMinimo(perfil: string | null | undefined, minimo: string): boolean {
  if (isAdminPerfil(perfil)) return true;
  return nivelDoPerfil(perfil) >= (PERFIS_HIERARQUIA[minimo] ?? 1);
}

// Perfis que um "lider" pode atribuir a outros usuários ao criar/editar
// (espelha getAvailableProfiles em src/components/usuarios/UsuarioForm.jsx).
// Só admin/direção podem atribuir lider, direcao ou admin.
const PERFIS_ATRIBUIVEIS_POR_LIDER = ['user', 'coordenador', 'apoio', 'gestao'];

export function podeAtribuirPerfil(perfilDeQuemEdita: string | null | undefined, perfilAlvo: string): boolean {
  if (isAdminPerfil(perfilDeQuemEdita) || perfilDeQuemEdita === 'direcao') return true;
  if (perfilDeQuemEdita === 'lider') return PERFIS_ATRIBUIVEIS_POR_LIDER.includes(perfilAlvo);
  return false;
}
