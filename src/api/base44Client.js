import { supabase } from '@/lib/supabaseClient';
import { createEntity } from './entityFactory';
import { apiUsuarios } from '@/services/apiUsuarios';
import { apiEquipe } from '@/services/apiEquipe';
import { apiPavimento } from '@/services/apiPavimento';
import { apiSobraUsuario } from '@/services/apiSobraUsuario';
import { apiPlanejamentoAtividade } from '@/services/apiPlanejamentoAtividade';
import { apiPlanejamentoDocumento } from '@/services/apiPlanejamentoDocumento';

// -----------------------------------------------------------------------
// 1) ENTIDADES (banco de dados)
// -----------------------------------------------------------------------
// Nomes exatos das 26 tabelas de negócio migradas do Base44 para o Supabase
// (ver base44/entities/*.jsonc). "Analitico" é usada em várias telas do
// código mas não apareceu nos exports de dados/schema originais — tabela
// foi criada manualmente no Supabase.
const ENTITY_NAMES = [
  'AlteracaoEtapa',
  'AtaReuniao',
  'Atividade',
  'AtividadeFuncao',
  'AtividadeGenerica',
  'AtividadesDoProjeto',
  'AtividadesEmpreendimento',
  'ChecklistItem',
  'ChecklistPlanejamento',
  'Comercial',
  'ControleOS',
  'DataCadastro',
  'Disciplina',
  'Documento',
  'Empreendimento',
  'Escopo',
  'Execucao',
  'HistoricoAtividade',
  'ItemPRE',
  'NotificacaoAtividade',
  'OSManual',
  'Analitico', // ⚠️ ver nota acima
];
// "Usuario", "Equipe", "Pavimento", "SobraUsuario", "PlanejamentoAtividade"
// e "PlanejamentoDocumento" foram retiradas de ENTITY_NAMES de propósito -
// já migradas para o backend (ver src/services/api*.js). Usuario em
// particular não pode mais ser lida/escrita direto no Postgres com a anon
// key (isso é o que permitia um usuário comum se autopromover editando o
// próprio registro).

const entities = Object.fromEntries(
  ENTITY_NAMES.map((name) => [name, createEntity(name)])
);
entities.Usuario = apiUsuarios;
entities.Equipe = apiEquipe;
entities.Pavimento = apiPavimento;
entities.SobraUsuario = apiSobraUsuario;
entities.PlanejamentoAtividade = apiPlanejamentoAtividade;
entities.PlanejamentoDocumento = apiPlanejamentoDocumento;

// -----------------------------------------------------------------------
// 2) AUTENTICAÇÃO (substitui base44.auth)
// -----------------------------------------------------------------------
// O Base44 guardava campos como "perfil", "role" e "playlist_atividades"
// direto no objeto do usuário autenticado. No Supabase Auth isso vira
// user_metadata — mantemos os mesmos nomes de campo na saída pra não
// quebrar o código das telas.
function mapSupabaseUser(supabaseUser) {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: meta.full_name || meta.nome || supabaseUser.email,
    nome: meta.nome || meta.full_name || supabaseUser.email,
    cargo: meta.cargo || null,
    perfil: meta.perfil || 'user',
    role: meta.role || 'user',
    playlist_atividades: meta.playlist_atividades || [],
  };
}

export const auth = {
  /** auth.me() - lança erro (status 401) se não houver sessão ativa */
  async me() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      const err = new Error('Usuário não autenticado');
      err.status = 401;
      throw err;
    }
    return mapSupabaseUser(data.user);
  },

  /**
   * auth.updateMyUserData(payload) - mescla campos no user_metadata.
   * "perfil" e "role" nunca são aceitos aqui: é o user_metadata do Supabase
   * Auth, que o próprio usuário controla via supabase.auth.updateUser() -
   * deixar gravar esses campos aqui era uma escalada de privilégio trivial
   * (o usuário se autopromovendo a admin pelo console do navegador). Quem
   * decide perfil/role é a tabela Usuario, através do backend.
   */
  async updateMyUserData(payload) {
    const { perfil, role, ...payloadSeguro } = payload;
    const { data: current } = await supabase.auth.getUser();
    const currentMeta = current?.user?.user_metadata || {};
    const { data, error } = await supabase.auth.updateUser({
      data: { ...currentMeta, ...payloadSeguro },
    });
    if (error) throw new Error(`[auth.updateMyUserData] ${error.message}`);
    return mapSupabaseUser(data.user);
  },

  /** auth.logout(redirectUrl?) - o argumento é ignorado (sem redirect externo agora) */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`[auth.logout] ${error.message}`);
  },

  /**
   * auth.redirectToLogin() - no Base44 isso levava pra uma tela hospedada
   * externamente. Agora o login é uma tela própria do app (ver
   * src/components/Login.jsx + AuthContext), então isso é um no-op mantido
   * só por compatibilidade com código existente que ainda chama esse método.
   */
  redirectToLogin() {
    // Intencionalmente vazio.
  },

  /** Acesso direto ao cliente do Supabase, para casos avançados (ex: login) */
  _supabase: supabase,
};

// -----------------------------------------------------------------------
// 3) INTEGRAÇÕES (substitui base44.integrations.Core)
// -----------------------------------------------------------------------
const UPLOAD_BUCKET = 'uploads';

export const Core = {
  /**
   * Core.UploadFile({ file }) → { file_url }
   * Envia o arquivo para o Storage do Supabase (bucket "uploads").
   * Crie esse bucket no painel do Supabase (Storage → New bucket, marcado
   * como público) antes de usar.
   */
  async UploadFile({ file }) {
    if (!file) throw new Error('UploadFile: nenhum arquivo foi informado');
    const path = `${Date.now()}_${file.name}`.replace(/\s+/g, '_');
    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, file, { upsert: false });
    if (error) throw new Error(`[UploadFile] ${error.message}`);
    const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
    return { file_url: data.publicUrl };
  },

  /**
   * Core.SendEmail({ to, subject, body }) - chama uma Supabase Edge
   * Function chamada "send-email". Você precisa criar e fazer o deploy
   * dessa function (equivalente à antiga testEmailNotificacao do Base44,
   * usando um provedor como Resend) antes que isso funcione.
   */
  async SendEmail(payload) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });
    if (error) {
      throw new Error(
        `[SendEmail] ${error.message}. Verifique se a Edge Function "send-email" ` +
        `foi criada e publicada no seu projeto Supabase.`
      );
    }
    return data;
  },

  /** Removido - não implementado, sem uso conhecido no código. Reavaliar se surgir necessidade futura. */
  // async SendSMS() { ... }
  // async GenerateImage() { ... }
  // async InvokeLLM() { ... }

  /**
   * Ainda não migrado — usado hoje em PRETab.jsx e PRE.jsx para extrair
   * dados de planilhas via IA. Precisa de uma Edge Function própria
   * (ex: chamando a API da Anthropic ou OpenAI) antes de funcionar de novo.
   */
  async ExtractDataFromUploadedFile() {
    throw new Error(
      'ExtractDataFromUploadedFile ainda não foi implementado nesta migração. ' +
      'Essa função dependia de IA no Base44 — crie uma Edge Function própria ' +
      'para reativar a importação de planilhas via IA no PRE.'
    );
  },
};

// -----------------------------------------------------------------------
// 4) LOGS (substitui base44.appLogs — usado pelo NavigationTracker)
// -----------------------------------------------------------------------
export const appLogs = {
  /** No-op: o Base44 tinha analytics próprio. Plugue o seu aqui se precisar. */
  async logUserInApp() {
    return null;
  },
};

// -----------------------------------------------------------------------
// Objeto final, com a MESMA forma que o SDK do Base44 tinha, para que
// nenhuma das telas que já fazem `import { base44 } from '@/api/base44Client'`
// precise ser alterada.
// -----------------------------------------------------------------------
export const base44 = {
  entities,
  auth,
  integrations: { Core },
  appLogs,
};

export const getApiOrigin = () =>
  import.meta.env.VITE_SUPABASE_URL || window.location.origin;
