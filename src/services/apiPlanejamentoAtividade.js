import { apiClient } from '@/lib/apiClient';

/**
 * Traduz o formato de filtro do entityFactory ({ campo: valor } ou
 * { campo: { $in: [...] } } / { $ne: valor }) pros query params que o
 * backend entende. Só cobre os padrões realmente usados no código hoje
 * (ver grep de PlanejamentoAtividade.filter/PlanejamentoDocumento.filter).
 */
function whereParaQueryString(where = {}) {
  const params = new URLSearchParams();
  for (const [campo, valor] of Object.entries(where)) {
    if (valor && typeof valor === 'object' && '$in' in valor) {
      params.set(`${campo}_in`, valor.$in.join(','));
    } else if (valor && typeof valor === 'object' && '$ne' in valor) {
      params.set(`${campo}_ne`, valor.$ne);
    } else if (valor !== undefined && valor !== null) {
      params.set(campo, valor);
    }
  }
  return params.toString();
}

/**
 * Entidade PlanejamentoAtividade com a mesma "forma" que createEntity()
 * (entityFactory.js) expõe, mas passando pelo backend. A leitura aqui é
 * restrita por executor/coordenador+ no servidor (diferente da maioria das
 * outras entidades) - ver backend/PERMISSOES.md.
 */
export const apiPlanejamentoAtividade = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/planejamento-atividades${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/planejamento-atividades?${extra.toString()}`);
    }
    return apiClient.get(`/api/planejamento-atividades${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/planejamento-atividades/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/planejamento-atividades', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/planejamento-atividades/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/planejamento-atividades/${id}`);
  }
};
