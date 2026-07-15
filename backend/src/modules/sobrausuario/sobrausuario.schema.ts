import { z } from 'zod';

export const createSobraUsuarioSchema = z.object({
  usuario: z.string().optional(),
  empreendimento_id: z.string().optional(),
  horas_sobra: z.number().optional()
});

export const updateSobraUsuarioSchema = createSobraUsuarioSchema.partial();

export const sobraUsuarioParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateSobraUsuarioInput = z.infer<typeof createSobraUsuarioSchema>;
export type UpdateSobraUsuarioInput = z.infer<typeof updateSobraUsuarioSchema>;
