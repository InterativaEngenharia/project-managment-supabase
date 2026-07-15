/**
 * Traduz o formato de filtro do entityFactory ({ campo: valor },
 * { campo: { $in: [...] } }, { campo: { $ne/$gte/$lte: valor } }, inclusive
 * combinando $gte e $lte no mesmo campo) pros query params que o backend
 * entende (parseFilterQuery em backend/src/shared/queryFilter.ts). Só
 * cobre os operadores realmente usados no código hoje.
 */
export function whereParaQueryString(where = {}) {
  const params = new URLSearchParams();
  for (const [campo, valor] of Object.entries(where)) {
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      if ('$in' in valor) params.set(`${campo}_in`, valor.$in.join(','));
      if ('$ne' in valor) params.set(`${campo}_ne`, valor.$ne);
      if ('$gte' in valor) params.set(`${campo}_gte`, valor.$gte);
      if ('$lte' in valor) params.set(`${campo}_lte`, valor.$lte);
    } else if (valor !== undefined && valor !== null) {
      params.set(campo, valor);
    }
  }
  return params.toString();
}
