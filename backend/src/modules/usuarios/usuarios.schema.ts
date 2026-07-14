import { z } from 'zod';

// Perfis observados no código do frontend (routePermissions.js,
// ActivityTimerContext.jsx, UsuarioForm.jsx). "admin" é um bypass à parte,
// fora da hierarquia numérica (ver shared/perfis.ts).
export const perfilEnum = z.enum([
  'user',
  'apoio',
  'consultor',
  'coordenador',
  'gestao',
  'lider',
  'direcao',
  'admin'
]);

// Aceita string, null (EquipesManager.jsx manda null pra "remover da equipe")
// ou "" (AlocacaoEquipeTab.jsx manda "" no mesmo caso) - ambos viram null.
const equipeIdField = z
  .string()
  .nullable()
  .optional()
  .transform((v) => (v === '' || v === null ? null : v));

export const createUsuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  email_notificacao: z.string().email().optional().or(z.literal('')),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  equipe_id: equipeIdField,
  telefone: z.string().optional(),
  data_admissao: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
  perfil: perfilEnum.default('user'),
  usuarios_permitidos_visualizar: z.array(z.string()).optional()
});

// Update aceita qualquer subconjunto dos campos acima - a rota de PATCH
// decide, com base em quais campos vieram no corpo, se isso é uma simples
// troca de equipe (permitida a qualquer autenticado) ou uma edição completa
// (restrita a lider/direcao/admin, ver usuarios.controller.ts).
export const updateUsuarioSchema = createUsuarioSchema.partial();

export const usuarioParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
