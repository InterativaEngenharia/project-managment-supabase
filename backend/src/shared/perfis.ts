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

/**
 * Regra do Empreendimento no Base44 original: quem criou o registro pode
 * editar/excluir mesmo sem ter o nível mínimo de perfil (ex: um colaborador
 * comum edita o empreendimento que ele mesmo criou). Genérico o bastante
 * pra reaproveitar em qualquer entidade com essa mesma regra de dono.
 */
export function podeEditarRecurso(
  user: { perfil: string; email: string },
  registroExistente: { created_by?: string | null },
  nivelMinimo: keyof typeof PERFIS_HIERARQUIA
): boolean {
  if (temNivelMinimo(user.perfil, nivelMinimo)) return true;
  return registroExistente.created_by === user.email;
}

function emailIgual(a: string | null | undefined, b: string | null | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

/**
 * Regra do PlanejamentoAtividade/PlanejamentoDocumento no Base44 original:
 * coordenador+ sempre pode; quem criou o registro ou é o executor_principal
 * também pode; e (só pra leitura/atualização, não pra exclusão) qualquer
 * um listado no array `executores` também pode. Espelha exatamente as
 * policies `planejamentoatividade_select/update/delete` já existentes no
 * Supabase (ver backend/PERMISSOES.md).
 */
export function podeAcessarPlanejamento(
  user: { perfil: string; email: string },
  registro: { executor_principal?: string | null; created_by?: string | null; executores?: unknown },
  opcoes: { considerarExecutores?: boolean } = {}
): boolean {
  if (temNivelMinimo(user.perfil, 'coordenador')) return true;
  if (emailIgual(registro.executor_principal, user.email)) return true;
  if (emailIgual(registro.created_by, user.email)) return true;

  if (opcoes.considerarExecutores && Array.isArray(registro.executores)) {
    return registro.executores.some((e) => typeof e === 'string' && emailIgual(e, user.email));
  }

  return false;
}
