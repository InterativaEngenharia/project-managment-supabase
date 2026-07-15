import { z } from 'zod';

const tempo = z.number().optional();

// Campos alinhados às colunas reais de public."Documento" (prisma/schema.prisma).
export const createDocumentoSchema = z.object({
  numero: z.string().optional(),
  arquivo: z.string().optional(),
  descritivo: z.string().optional(),
  area: z.string().optional(),
  pavimento_id: z.string().optional(),
  disciplina: z.string().optional(),
  disciplinas: z.any().optional(),
  subdisciplinas: z.any().optional(),
  escala: z.number().optional(),
  fator_dificuldade: z.number().optional(),
  empreendimento_id: z.string().optional(),
  tempo_total: tempo,
  tempo_estudo_preliminar: tempo,
  tempo_ante_projeto: tempo,
  tempo_projeto_basico: tempo,
  tempo_projeto_executivo: tempo,
  tempo_liberado_obra: tempo,
  tempo_concepcao: tempo,
  tempo_planejamento: tempo,
  tempo_pre: tempo,
  etapas_adicionais_pre: z.any().optional(),
  tempo_execucao_total: tempo,
  tempo_execucao_estudo_preliminar: tempo,
  tempo_execucao_ante_projeto: tempo,
  tempo_execucao_projeto_basico: tempo,
  tempo_execucao_projeto_executivo: tempo,
  tempo_execucao_liberado_obra: tempo,
  tempo_execucao_concepcao: tempo,
  tempo_execucao_planejamento: tempo,
  predecessora_id: z.string().optional(),
  inicio_planejado: z.string().optional(),
  termino_planejado: z.string().optional(),
  multiplos_executores: z.boolean().optional(),
  executor_principal: z.string().optional()
});

export const updateDocumentoSchema = createDocumentoSchema.partial();

export const documentoParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateDocumentoInput = z.infer<typeof createDocumentoSchema>;
export type UpdateDocumentoInput = z.infer<typeof updateDocumentoSchema>;
