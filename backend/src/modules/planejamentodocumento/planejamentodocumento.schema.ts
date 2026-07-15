import { z } from 'zod';

const tempo = z.number().optional();

// Campos alinhados às colunas reais de public."PlanejamentoDocumento"
// (prisma/schema.prisma).
export const createPlanejamentoDocumentoSchema = z.object({
  descritivo: z.string().optional(),
  documento_id: z.string().optional(),
  empreendimento_id: z.string().optional(),
  etapa: z.string().optional(),
  executores: z.array(z.string()).optional(),
  executor_principal: z.string().optional(),
  predecessora_id: z.string().optional(),
  tempo_planejado: tempo,
  inicio_planejado: z.string().optional(),
  termino_planejado: z.string().optional(),
  horario_inicio: z.string().optional(),
  horario_termino: z.string().optional(),
  sobra_planejada: tempo,
  inicio_ajustado: z.string().optional(),
  termino_ajustado: z.string().optional(),
  sobra_ajustada: tempo,
  inicio_real: z.string().optional(),
  termino_real: z.string().optional(),
  sobra_real: tempo,
  tempo_executado: tempo,
  status: z.string().default('nao_iniciado'),
  semana_ano: z.string().optional(),
  prioridade: tempo,
  ordem: tempo,
  ordem_por_dia: z.any().optional(),
  horas_por_dia: z.any().optional(),
  horas_executadas_por_dia: z.any().optional(),
  multiplos_executores: z.boolean().optional()
});

export const updatePlanejamentoDocumentoSchema = createPlanejamentoDocumentoSchema.partial();

export const planejamentoDocumentoParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreatePlanejamentoDocumentoInput = z.infer<typeof createPlanejamentoDocumentoSchema>;
export type UpdatePlanejamentoDocumentoInput = z.infer<typeof updatePlanejamentoDocumentoSchema>;
