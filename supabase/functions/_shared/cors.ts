// Cabeçalhos CORS compartilhados pelas Edge Functions.
// Ajuste "Access-Control-Allow-Origin" para o domínio do seu app em produção,
// se quiser restringir (ex: "https://seuapp.com").
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
