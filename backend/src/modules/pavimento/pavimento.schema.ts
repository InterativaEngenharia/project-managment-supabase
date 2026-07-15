import { z } from 'zod';

export const createPavimentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  area: z.number().optional(),
  escala: z.string().optional(),
  empreendimento_id: z.string().optional()
});

export const updatePavimentoSchema = createPavimentoSchema.partial();

export const pavimentoParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreatePavimentoInput = z.infer<typeof createPavimentoSchema>;
export type UpdatePavimentoInput = z.infer<typeof updatePavimentoSchema>;
