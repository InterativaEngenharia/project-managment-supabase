import { createClient } from '@supabase/supabase-js';
import { Prisma, PrismaClient } from '@prisma/client';

// Supabase Admin Client (service_role)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Campos @db.Decimal (tempo_total, tempo_executado, tempo_planejado, etc.)
// vêm do Prisma como instâncias de Prisma.Decimal, que serializam em JSON
// como STRING (de propósito, pra não perder precisão) - não como number. Isso
// já quebrou várias telas no frontend que chamam `.toFixed()` direto no valor
// esperando um number (ex: ExecucoesPorUsuario.jsx, AtividadesRapidas.jsx).
// Em vez de corrigir cada um dos ~90 lugares que usam esses campos, converte
// tudo pra number aqui, uma vez só, pra qualquer query em qualquer model.
function converterDecimals(valor: unknown): unknown {
  if (valor === null || valor === undefined) return valor;
  if (valor instanceof Prisma.Decimal) return valor.toNumber();
  if (Array.isArray(valor)) return valor.map(converterDecimals);
  if (typeof valor === 'object' && valor.constructor === Object) {
    for (const chave of Object.keys(valor as Record<string, unknown>)) {
      (valor as Record<string, unknown>)[chave] = converterDecimals((valor as Record<string, unknown>)[chave]);
    }
    return valor;
  }
  return valor;
}

// Prisma Client
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}).$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const resultado = await query(args);
        return converterDecimals(resultado);
      }
    }
  }
});

// Configurações do servidor
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  isProduction: process.env.NODE_ENV === 'production',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
};
