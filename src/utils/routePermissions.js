/**
 * Funções utilitárias para verificação de permissões de rota
 * Baseado nas mesmas regras do sidebar do Layout
 */

export const canAccessRoute = (pageName, hasPermission, perfilAtual, isAdmin) => {
  // Rotas públicas para todos
  const publicRoutes = ['Dashboard', 'Empreendimentos', 'Empreendimento', 'Home', 'AnaliseConcepcaoPlanejamento', 'Analitico', 'ChecklistPlanejamento', 'ComercialDetalhes', 'MediaSubdisciplinas', 'Orcamentos', 'PRE', 'Planejamento', 'Propostas'];
  if (publicRoutes.includes(pageName)) return true;

  // Admin tem acesso a tudo
  if (isAdmin) return true;

  // Verificações específicas por rota (mesma lógica do sidebar)
  switch (pageName) {
    case 'Comercial':
      return hasPermission('gestao');
    case 'SeletorPlanejamento':
    case 'ControleOSGlobal':
      return hasPermission('coordenador');
    case 'Relatorios':
      return hasPermission('coordenador') || perfilAtual === 'consultor';
    case 'AtaPlanejamento':
      return hasPermission('coordenador') || perfilAtual === 'consultor' || perfilAtual === 'apoio';
    case 'AtividadesRapidas':
      return perfilAtual !== 'consultor';
    case 'Usuarios':
      return perfilAtual === 'lider' || perfilAtual === 'direcao';
    case 'Configuracoes':
      return perfilAtual === 'lider' || perfilAtual === 'direcao';
    default:
      return true; // Permite acesso por padrão para rotas não listadas
  }
};
