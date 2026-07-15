import { z } from 'zod';

// Schemas das entidades sem regra de RLS customizada no Base44 original e
// sem trava de perfil na tela que as usa hoje (ver backend/PERMISSOES.md) -
// registradas via registerGenericCrudRoutes em shared/genericCrudModule.ts.
// Campos alinhados às colunas reais de cada tabela (prisma/schema.prisma).

export const alteracaoEtapaSchema = z.object({
  atividade_id: z.string().optional(),
  id_atividade: z.string().optional(),
  nome_atividade: z.string().optional(),
  disciplina: z.string().optional(),
  subdisciplina: z.string().optional(),
  etapa_anterior: z.string().optional(),
  etapa_nova: z.string().optional(),
  empreendimento_id: z.string().optional(),
  empreendimento_nome: z.string().optional(),
  data_alteracao: z.string().optional(),
  usuario_email: z.string().optional(),
  usuario_nome: z.string().optional()
});

export const ataReuniaoSchema = z.object({
  assunto: z.string().optional(),
  local: z.string().optional(),
  data: z.string().optional(),
  horario: z.string().optional(),
  participantes: z.any().optional(),
  folha: z.string().optional(),
  rev: z.string().optional(),
  controle: z.string().optional(),
  emissao: z.string().optional(),
  providencias: z.any().optional(),
  status: z.string().default('rascunho')
});

export const atividadeSchema = z.object({
  id_atividade: z.string().optional(),
  etapa: z.string().optional(),
  disciplina: z.string().optional(),
  subdisciplina: z.string().optional(),
  atividade: z.string().optional(),
  predecessora: z.string().optional(),
  tempo: z.number().optional(),
  funcao: z.string().optional(),
  empreendimento_id: z.string().optional(),
  documento_id: z.string().optional(),
  documento_ids: z.any().optional(),
  status_planejamento: z.string().default('nao_planejada'),
  set: z.string().optional(),
  tipo_contagem: z.string().optional()
});

export const atividadeFuncaoSchema = z.object({
  funcao: z.string().optional(),
  atividade: z.string().optional(),
  frequencia: z.string().optional(),
  tempo_estimado: z.number().optional(),
  dias_semana: z.any().optional(),
  dia_mes: z.number().int().optional()
});

export const atividadeGenericaSchema = z.object({
  nome: z.string().optional(),
  perfis: z.any().optional()
});

export const atividadesEmpreendimentoSchema = z.object({
  id_atividade: z.string().optional(),
  etapa: z.string().optional(),
  disciplina: z.string().optional(),
  subdisciplina: z.string().optional(),
  atividade: z.string().optional(),
  predecessora: z.string().optional(),
  tempo: z.number().optional(),
  funcao: z.string().optional(),
  empreendimento_id: z.string().optional(),
  documento_id: z.string().optional(),
  documento_ids: z.any().optional(),
  pavimento_id: z.string().optional(),
  status_planejamento: z.string().default('nao_planejada'),
  status_execucao: z.string().default('nao_iniciada'),
  planejamento_id: z.string().optional(),
  executor: z.string().optional(),
  data_conclusao: z.string().optional(),
  data_exclusao: z.string().optional(),
  motivo_exclusao: z.string().optional()
});

export const checklistItemSchema = z.object({
  checklist_id: z.string().optional(),
  secao: z.string().optional(),
  numero_item: z.string().optional(),
  descricao: z.string().optional(),
  ordem: z.number().optional(),
  status_por_periodo: z.any().optional(),
  observacoes: z.string().optional(),
  responsavel: z.string().optional(),
  pre_item_id: z.string().optional()
});

export const checklistPlanejamentoSchema = z.object({
  tipo: z.string().optional(),
  empreendimento_id: z.string().optional(),
  tecnico_responsavel: z.string().optional(),
  numero_os: z.string().optional(),
  cliente: z.string().optional(),
  data_entrega: z.string().optional(),
  legenda: z.any().optional(),
  periodos: z.any().optional(),
  status: z.string().default('em_andamento')
});

export const dataCadastroSchema = z.object({
  empreendimento_id: z.string().optional(),
  ordem: z.number().optional(),
  documento_id: z.string().optional(),
  datas: z.any().optional()
});

export const execucaoSchema = z.object({
  planejamento_id: z.string().optional(),
  descritivo: z.string().optional(),
  empreendimento_id: z.string().optional(),
  usuario: z.string().optional(),
  usuario_ajudado: z.string().optional(),
  observacao: z.string().optional(),
  status: z.string().default('Em andamento'),
  inicio: z.string().optional(),
  termino: z.string().optional(),
  tempo_total: z.number().optional(),
  pausado_automaticamente: z.boolean().optional(),
  analitico_id: z.string().optional()
});

export const itemPreSchema = z.object({
  empreendimento_id: z.string().optional(),
  item: z.string().optional(),
  data: z.string().optional(),
  de: z.string().optional(),
  descritiva: z.string().optional(),
  localizacao: z.string().optional(),
  assunto: z.string().optional(),
  comentario: z.string().optional(),
  disciplina: z.string().optional(),
  status: z.string().default('Em andamento'),
  resposta: z.string().optional(),
  imagens: z.any().optional(),
  tempo_atendimento: z.number().optional(),
  documentos_vinculados: z.any().optional(),
  etapa_adicional: z.string().optional(),
  planejamento_executor: z.string().optional(),
  planejamento_executor_nome: z.string().optional()
});

export const notificacaoAtividadeSchema = z.object({
  usuario_email: z.string().optional(),
  atividade_funcao_id: z.string().optional(),
  atividade_nome: z.string().optional(),
  tempo_estimado: z.number().optional(),
  status: z.string().default('pendente'),
  data_notificacao: z.string().optional(),
  data_agendada: z.string().optional(),
  planejamento_id: z.string().optional()
});

export const osManualSchema = z.object({
  usuario_email: z.string().optional(),
  data: z.string().optional(),
  os: z.string().optional(),
  empreendimento_nome: z.string().optional(),
  cor: z.string().optional()
});
