import { z } from 'zod';

export const createEquipeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cor: z.string().optional(),
  descricao: z.string().optional()
});

export const updateEquipeSchema = createEquipeSchema.partial();

export const equipeParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateEquipeInput = z.infer<typeof createEquipeSchema>;
export type UpdateEquipeInput = z.infer<typeof updateEquipeSchema>;
