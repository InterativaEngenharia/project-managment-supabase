import { z } from 'zod';

// Campos alinhados às colunas reais de public."ControleOS" (prisma/schema.prisma).
export const createControleOSSchema = z.object({
  empreendimento_id: z.string().optional(),
  os: z.string().optional(),
  gestao: z.string().optional(),
  formalizacao: z.string().optional(),
  cronograma: z.string().default('NA'),
  markup: z.string().default('NA'),
  abertura_os_servidor: z.string().default('NA'),
  atividades_planejamento: z.string().default('NA'),
  kickoff_cliente: z.string().default('NA'),
  art_ee_ais: z.string().default('NA'),
  art_hid_in: z.string().default('NA'),
  art_hvac: z.string().default('NA'),
  art_bomb: z.string().default('NA'),
  conc_telefonia: z.string().default('NA'),
  conc_gas: z.string().default('NA'),
  conc_eletrica: z.string().default('NA'),
  conc_hidraulica: z.string().default('NA'),
  conc_agua_pluvial: z.string().default('NA'),
  conc_incendio: z.string().default('NA'),
  atividades_vinculadas: z.any().optional(),
  planejamento: z.any().optional(),
  markup_status: z.string().default('NA'),
  monitoramento: z.any().optional(),
  avanco: z.any().optional(),
  observacoes: z.string().optional()
});

export const updateControleOSSchema = createControleOSSchema.partial();

export const controleOSParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateControleOSInput = z.infer<typeof createControleOSSchema>;
export type UpdateControleOSInput = z.infer<typeof updateControleOSSchema>;
