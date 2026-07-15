import { z } from 'zod';

// Campos alinhados às colunas reais de public."Empreendimento" (prisma/schema.prisma).
export const createEmpreendimentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cliente: z.string().optional(),
  foto_url: z.string().optional(),
  endereco: z.string().optional(),
  os: z.string().optional(),
  num_proposta: z.string().optional(),
  status: z.string().default('em_planejamento'),
  etapas: z.any().optional(),
  tipo_empreendimento_checklist: z.string().optional(),
  disciplinas_checklist: z.any().optional()
});

export const updateEmpreendimentoSchema = createEmpreendimentoSchema.partial();

export const empreendimentoParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateEmpreendimentoInput = z.infer<typeof createEmpreendimentoSchema>;
export type UpdateEmpreendimentoInput = z.infer<typeof updateEmpreendimentoSchema>;
