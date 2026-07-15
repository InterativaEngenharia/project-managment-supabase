import { z } from 'zod';

// Campos alinhados às colunas reais de public."Comercial" (prisma/schema.prisma).
export const createComercialSchema = z.object({
  numero: z.string().optional(),
  data_solicitacao: z.string().optional(),
  solicitante: z.string().optional(),
  cliente: z.string().optional(),
  empreendimento: z.string().optional(),
  tipo_empreendimento: z.string().optional(),
  tipo_obra: z.string().optional(),
  utilizacao: z.string().optional(),
  parceiros: z.any().optional(),
  disciplinas: z.any().optional(),
  codisciplinas: z.any().optional(),
  pavimentos: z.any().optional(),
  escopo: z.string().optional(),
  area: z.number().optional(),
  estado: z.string().optional(),
  valor_bim: z.number().optional(),
  valor_cad: z.number().optional(),
  data_aprovacao: z.string().optional(),
  status: z.string().default('solicitado'),
  email: z.string().optional(),
  telefone: z.string().optional(),
  observacao: z.string().optional()
});

export const updateComercialSchema = createComercialSchema.partial();

export const comercialParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateComercialInput = z.infer<typeof createComercialSchema>;
export type UpdateComercialInput = z.infer<typeof updateComercialSchema>;
