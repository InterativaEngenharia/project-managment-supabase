import { apiClient } from '@/lib/apiClient';

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
 * Entidade PlanejamentoDocumento com a mesma "forma" que createEntity()
 * (entityFactory.js) expõe, mas passando pelo backend. Leitura é aberta a
 * todos aqui (diferente de PlanejamentoAtividade) - ver backend/PERMISSOES.md.
 */
export const apiPlanejamentoDocumento = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/planejamento-documentos${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/planejamento-documentos?${extra.toString()}`);
    }
    return apiClient.get(`/api/planejamento-documentos${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/planejamento-documentos/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/planejamento-documentos', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/planejamento-documentos/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/planejamento-documentos/${id}`);
  }
};
