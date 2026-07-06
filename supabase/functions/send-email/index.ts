// Supabase Edge Function: send-email
//
// Substitui a Cloud Function original do Base44
// (base44/functions/testEmailNotificacao/entry.ts), mas generalizada para
// aceitar qualquer { to, subject, body }, já que é isso que o app envia
// hoje (veja src/api/base44Client.js -> Core.SendEmail e
// src/components/utils/NotificationGenerator.jsx).
//
// Configuração necessária antes do deploy:
//   1) Crie uma conta em https://resend.com e gere uma API key.
//   2) Configure o secret no projeto Supabase:
//        supabase secrets set RESEND_API_KEY=re_xxx
//   3) (Opcional, recomendado) Verifique um domínio próprio no Resend e
//      troque o "from" abaixo de onboarding@resend.dev para
//      algo@seudominio.com — o domínio de teste do Resend só envia para o
//      e-mail cadastrado na sua conta Resend.
//
// Deploy:
//   supabase functions deploy send-email
//
// Chamada pelo front-end via:
//   supabase.functions.invoke('send-email', { body: { to, subject, body } })
// (já implementado em src/api/base44Client.js -> Core.SendEmail)

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1) Exige um usuário autenticado (qualquer usuário logado, já que
    //    hoje esta function é chamada automaticamente pelo
    //    NotificationGenerator para o próprio usuário — não apenas admin).
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

    if (!RESEND_API_KEY) {
      return Response.json(
        {
          error:
            "RESEND_API_KEY não configurada. Rode: supabase secrets set RESEND_API_KEY=sua_chave",
        },
        { status: 500, headers: corsHeaders },
      );
    }

    const { to, subject, body, html } = await req.json();

    if (!to || !subject || (!body && !html)) {
      return Response.json(
        { error: "Campos obrigatórios: to, subject e (body ou html)." },
        { status: 400, headers: corsHeaders },
      );
    }

    // Se vier "body" como texto simples (é o que o app manda hoje, com
    // quebras de linha "\n"), converte para HTML básico preservando as
    // quebras de linha. Se vier "html" explicitamente, usa direto.
    const htmlBody = html ??
      `<div style="font-family: sans-serif; white-space: pre-line;">${
        escapeHtml(body)
      }</div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Gestão de Projetos <onboarding@resend.dev>",
        to: [to],
        subject,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data }, {
        status: 500,
        headers: corsHeaders,
      });
    }

    return Response.json({ success: true, enviado_para: to }, {
      headers: corsHeaders,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, {
      status: 500,
      headers: corsHeaders,
    });
  }
});

function escapeHtml(str: string): string {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
