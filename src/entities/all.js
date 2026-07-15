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

export const AlteracaoEtapa = base44.entities.AlteracaoEtapa;
export const AtaReuniao = base44.entities.AtaReuniao;
export const Atividade = base44.entities.Atividade;
export const AtividadeFuncao = base44.entities.AtividadeFuncao;
export const AtividadeGenerica = base44.entities.AtividadeGenerica;
export const AtividadesDoProjeto = base44.entities.AtividadesDoProjeto;
export const AtividadesEmpreendimento = base44.entities.AtividadesEmpreendimento;
export const ChecklistItem = base44.entities.ChecklistItem;
export const ChecklistPlanejamento = base44.entities.ChecklistPlanejamento;
export const Comercial = base44.entities.Comercial;
export const ControleOS = base44.entities.ControleOS;
export const DataCadastro = base44.entities.DataCadastro;
export const Disciplina = base44.entities.Disciplina;
export const Documento = base44.entities.Documento;
export const Empreendimento = base44.entities.Empreendimento;
// Equipe/Pavimento/SobraUsuario passam pelo backend - ver src/services/.
export const Equipe = apiEquipe;
export const Escopo = base44.entities.Escopo;
export const Execucao = base44.entities.Execucao;
export const HistoricoAtividade = base44.entities.HistoricoAtividade;
export const ItemPRE = base44.entities.ItemPRE;
export const NotificacaoAtividade = base44.entities.NotificacaoAtividade;
export const OSManual = base44.entities.OSManual;
export const Pavimento = apiPavimento;
export const PlanejamentoAtividade = apiPlanejamentoAtividade;
export const PlanejamentoDocumento = apiPlanejamentoDocumento;
export const SobraUsuario = apiSobraUsuario;
// Usuario passa pelo backend (não mais leitura/escrita direta no Postgres
// com a anon key) - ver src/services/apiUsuarios.js.
export const Usuario = apiUsuarios;

// ⚠️ "Analitico" é usada em várias telas (Dashboard, SeletorPlanejamento,
// Analitico.jsx, PlanejamentoForm) mas não apareceu no schema/dados
// exportados do Base44 originalmente. Tabela foi criada manualmente no Supabase.
export const Analitico = base44.entities.Analitico;

// auth sdk (era "export const User = base44.auth" no entities.js original):
export const User = base44.auth;
