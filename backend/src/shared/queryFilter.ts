/**
 * Traduz query params no formato `campo_op=valor` (op = in/ne/gte/lte) pra
 * um where do Prisma. Espelha whereParaQueryString do lado do frontend
 * (src/lib/filterQuery.js) - juntos, permitem repassar os filtros que o
 * entityFactory original aceitava ({ campo: valor }, { campo: { $in } },
 * { campo: { $gte, $lte } } etc) sem o frontend precisar saber que agora
 * passa por HTTP em vez de ir direto no Postgres.
 */
export function parseFilterQuery(query: Record<string, string>): {
  where: Record<string, unknown>;
  limit?: number;
} {
  const where: Record<string, Record<string, unknown> | string> = {};
  let limit: number | undefined;

  for (const [chave, valor] of Object.entries(query)) {
    if (chave === 'limit') {
      limit = Number(valor);
      continue;
    }

    const match = chave.match(/^(.+)_(in|ne|gte|lte)$/);
    if (!match) {
      where[chave] = valor;
      continue;
    }

    const [, campo, op] = match;
    const atual = (where[campo] && typeof where[campo] === 'object' ? where[campo] : {}) as Record<string, unknown>;
    if (op === 'in') atual.in = valor.split(',');
    else if (op === 'ne') atual.not = valor;
    else if (op === 'gte') atual.gte = valor;
    else if (op === 'lte') atual.lte = valor;
    where[campo] = atual;
  }

  return { where, limit };
}
