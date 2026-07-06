// Supabase Edge Function: get-medias-planejamentos
//
// Substitui a Cloud Function original do Base44
// (base44/functions/getMediasPlanejamentos/entry.ts). Mesma lógica,
// adaptada para usar o supabase-js em vez do SDK do Base44.
//
// Deploy:
//   supabase functions deploy get-medias-planejamentos
//
// Chamada pelo front-end via:
//   supabase.functions.invoke('get-medias-planejamentos', { body: { tipo } })
// (já implementado em src/functions/getMediasPlanejamentos.js)

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
// SUPABASE_SERVICE_ROLE_KEY já vem disponível automaticamente no ambiente
// de Edge Functions do Supabase (não precisa ser configurada manualmente).
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY",
)!;

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1) Verifica se o usuário está autenticado (equivalente ao
    //    base44.auth.me() do código original), usando o JWT que o
    //    supabase-js do front-end envia automaticamente no header
    //    Authorization.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth
      .getUser();
    if (userError || !userData?.user) {
      return Response.json({ error: "Unauthorized" }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    // 2) Cliente com service_role para ler as tabelas sem restrição de RLS
    //    (equivalente ao base44.asServiceRole do código original).
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3) Lê "tipo" tanto de query param quanto do body, igual ao original.
    const url = new URL(req.url);
    let tipo = url.searchParams.get("tipo");
    if (!tipo) {
      try {
        const body = await req.json();
        tipo = body?.tipo;
      } catch (_) {
        // sem body, ok
      }
    }
    tipo = tipo || "documentos";

    if (tipo === "documentos") {
      // Média histórica por documento_id + etapa usando PlanejamentoDocumento
      const { data: todos, error } = await adminClient
        .from("PlanejamentoDocumento")
        .select("documento_id, etapa, status, tempo_executado, tempo_planejado")
        .in("status", ["concluido"]);

      if (error) {
        return Response.json({ error: error.message }, {
          status: 500,
          headers: corsHeaders,
        });
      }

      const grupos: Record<
        string,
        { documento_id: string; etapa: string | null; tempos: number[] }
      > = {};

      for (const p of todos ?? []) {
        if (!p.documento_id) continue;
        const tempoUsado = p.tempo_executado && p.tempo_executado > 0
          ? p.tempo_executado
          : p.tempo_planejado;
        if (!tempoUsado || tempoUsado <= 0) continue;

        const chave = `${p.documento_id}||${p.etapa || ""}`;
        if (!grupos[chave]) {
          grupos[chave] = {
            documento_id: p.documento_id,
            etapa: p.etapa || null,
            tempos: [],
          };
        }
        grupos[chave].tempos.push(tempoUsado);
      }

      const resultado = Object.values(grupos).map((g) => ({
        documento_id: g.documento_id,
        etapa: g.etapa,
        media: Math.round(
          (g.tempos.reduce((a, b) => a + b, 0) / g.tempos.length) * 10,
        ) / 10,
        total: g.tempos.length,
      }));

      return Response.json(resultado, { headers: corsHeaders });
    }

    if (tipo === "atividades") {
      // Média histórica por atividade_id usando PlanejamentoAtividade
      const { data: todos, error } = await adminClient
        .from("PlanejamentoAtividade")
        .select("atividade_id, status, tempo_executado, tempo_planejado")
        .eq("status", "concluido");

      if (error) {
        return Response.json({ error: error.message }, {
          status: 500,
          headers: corsHeaders,
        });
      }

      const grupos: Record<string, { atividade_id: string; tempos: number[] }> =
        {};

      for (const p of todos ?? []) {
        const chave = p.atividade_id ? String(p.atividade_id) : null;
        if (!chave) continue;
        const tempoUsado = p.tempo_executado && p.tempo_executado > 0
          ? p.tempo_executado
          : p.tempo_planejado;
        if (!tempoUsado || tempoUsado <= 0) continue;

        if (!grupos[chave]) {
          grupos[chave] = { atividade_id: p.atividade_id, tempos: [] };
        }
        grupos[chave].tempos.push(tempoUsado);
      }

      const resultado = Object.values(grupos).map((g) => ({
        atividade_id: g.atividade_id,
        media: Math.round(
          (g.tempos.reduce((a, b) => a + b, 0) / g.tempos.length) * 10,
        ) / 10,
        total: g.tempos.length,
      }));

      return Response.json(resultado, { headers: corsHeaders });
    }

    return Response.json(
      { error: 'Parâmetro tipo inválido. Use "documentos" ou "atividades".' },
      { status: 400, headers: corsHeaders },
    );
  } catch (error) {
    return Response.json({ error: (error as Error).message }, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
