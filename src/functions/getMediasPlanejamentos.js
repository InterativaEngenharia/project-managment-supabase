import { supabase } from '@/lib/supabaseClient';

/**
 * Substitui a antiga Cloud Function do Base44 (base44/functions/getMediasPlanejamentos).
 * Calcula médias históricas de tempo (por documento+etapa, ou por atividade).
 *
 * Chama uma Supabase Edge Function chamada "get-medias-planejamentos" — você
 * precisa criar e publicar essa function (ver base44/functions/getMediasPlanejamentos/entry.ts
 * para a lógica original, que pode ser adaptada quase 1:1 para Deno no Supabase).
 *
 * @param {{ tipo: 'documentos' | 'atividades' }} params
 * @returns {Promise<{ data: Array }>}
 */
export async function getMediasPlanejamentos({ tipo } = {}) {
  const { data, error } = await supabase.functions.invoke('get-medias-planejamentos', {
    body: { tipo },
  });

  if (error) {
    throw new Error(
      `[getMediasPlanejamentos] ${error.message}. Verifique se a Edge Function ` +
      `"get-medias-planejamentos" foi criada e publicada no seu projeto Supabase.`
    );
  }

  return { data };
}
