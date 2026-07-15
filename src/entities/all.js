// Este arquivo substitui o módulo virtual "@/entities/all" que antes era
// gerado automaticamente pelo plugin @base44/vite-plugin (legacySDKImports).
// Como esse plugin foi removido (o app não depende mais do Base44), este
// arquivo físico passa a resolver os imports do tipo:
//   import { Empreendimento, Usuario } from "@/entities/all";
// usados em várias telas do app — sem precisar tocar nesse código.

import { base44 } from '@/api/base44Client';
import { apiUsuarios } from '@/services/apiUsuarios';
import { apiEquipe } from '@/services/apiEquipe';
import { apiPavimento } from '@/services/apiPavimento';
import { apiSobraUsuario } from '@/services/apiSobraUsuario';
import { apiPlanejamentoAtividade } from '@/services/apiPlanejamentoAtividade';
import { apiPlanejamentoDocumento } from '@/services/apiPlanejamentoDocumento';
import { createGenericApiEntity } from '@/services/genericApiEntity';
import { apiAnalitico } from '@/services/apiAnalitico';
import { apiComercial } from '@/services/apiComercial';
import { apiControleOS } from '@/services/apiControleOS';
import { apiDisciplina } from '@/services/apiDisciplina';
import { apiDocumento } from '@/services/apiDocumento';
import { apiEmpreendimento } from '@/services/apiEmpreendimento';

// Entidades sem regra de permissão própria - CRUD aberto, só passam pelo
// backend em vez de acesso direto (ver backend/PERMISSOES.md).
export const AlteracaoEtapa = createGenericApiEntity('alteracoes-etapa');
export const AtaReuniao = createGenericApiEntity('atas-reuniao');
export const Atividade = createGenericApiEntity('atividades', 'Atividade');
export const AtividadeFuncao = createGenericApiEntity('atividades-funcao');
export const AtividadeGenerica = createGenericApiEntity('atividades-genericas');
export const AtividadesEmpreendimento = createGenericApiEntity('atividades-empreendimento');
export const ChecklistItem = createGenericApiEntity('checklist-itens');
export const ChecklistPlanejamento = createGenericApiEntity('checklist-planejamentos');
export const DataCadastro = createGenericApiEntity('datas-cadastro');
export const Execucao = createGenericApiEntity('execucoes');
export const ItemPRE = createGenericApiEntity('itens-pre');
export const NotificacaoAtividade = createGenericApiEntity('notificacoes-atividade');
export const OSManual = createGenericApiEntity('os-manuais');

// ⚠️ Essas 3 tabelas não existem no Supabase hoje (confirmado via
// `prisma db pull` - não aparecem no schema introspectado). As telas que as
// chamam (historicoUtils.jsx, AnaliticoGlobalTab.jsx, HistoricoGeralTab.jsx)
// já falham hoje mesmo antes desta migração - não há nada real pra migrar
// aqui ainda, mantido como estava.
export const AtividadesDoProjeto = base44.entities.AtividadesDoProjeto;
export const Escopo = base44.entities.Escopo;
export const HistoricoAtividade = base44.entities.HistoricoAtividade;

// Comercial/ControleOS/Disciplina/Documento/Empreendimento passam pelo
// backend - os módulos já existiam desde a Fase 2, mas o frontend nunca
// tinha sido trocado de fato pra usá-los (continuava lendo/escrevendo
// direto no Postgres com a anon key, só protegido pelas policies de RLS).
export const Comercial = apiComercial;
export const ControleOS = apiControleOS;
export const Disciplina = apiDisciplina;
export const Documento = apiDocumento;
export const Empreendimento = apiEmpreendimento;
// Equipe/Pavimento/SobraUsuario passam pelo backend - ver src/services/.
export const Equipe = apiEquipe;
export const Pavimento = apiPavimento;
export const PlanejamentoAtividade = apiPlanejamentoAtividade;
export const PlanejamentoDocumento = apiPlanejamentoDocumento;
export const SobraUsuario = apiSobraUsuario;
// Usuario passa pelo backend (não mais leitura/escrita direta no Postgres
// com a anon key) - ver src/services/apiUsuarios.js.
export const Usuario = apiUsuarios;

// Analitico é só leitura no frontend hoje - ver src/services/apiAnalitico.js.
export const Analitico = apiAnalitico;

// auth sdk (era "export const User = base44.auth" no entities.js original):
export const User = base44.auth;
