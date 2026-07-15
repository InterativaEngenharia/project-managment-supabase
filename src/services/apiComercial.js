import { apiClient } from '@/lib/apiClient';
import { whereParaQueryString } from '@/lib/filterQuery';

/**
 * Entidade Comercial com a mesma "forma" que createEntity() (entityFactory.js)
 * expõe, mas passando pelo backend. Escrita restrita a lider+ no servidor -
 * ver backend/PERMISSOES.md.
 */
export const apiComercial = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/comercial${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/comercial?${extra.toString()}`);
    }
    return apiClient.get(`/api/comercial${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/comercial/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/comercial', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/comercial/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/comercial/${id}`);
  }
};
