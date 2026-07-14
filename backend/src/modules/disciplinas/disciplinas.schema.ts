import { z } from 'zod';

// Campos alinhados às colunas reais da tabela Disciplina (ver prisma/schema.prisma).
// `descricao`/`ativo` foram removidos daqui porque não existem na tabela - o
// schema anterior não correspondia ao banco real.
export const createDisciplinaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cor: z.string().optional(),
  icone: z.string().optional(),
  codisciplinas: z.any().optional(),
  // Coluna real é text, não numérica (confirmado via prisma db pull).
  ordem: z.string().optional()
});

export const updateDisciplinaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  cor: z.string().optional(),
  icone: z.string().optional(),
  codisciplinas: z.any().optional(),
  // Coluna real é text, não numérica (confirmado via prisma db pull).
  ordem: z.string().optional()
});

export const disciplinaParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateDisciplinaInput = z.infer<typeof createDisciplinaSchema>;
export type UpdateDisciplinaInput = z.infer<typeof updateDisciplinaSchema>;
