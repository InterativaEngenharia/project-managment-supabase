import { apiClient } from '@/lib/apiClient';
import { whereParaQueryString } from '@/lib/filterQuery';

/**
 * Entidade ControleOS com a mesma "forma" que createEntity() (entityFactory.js)
 * expõe, mas passando pelo backend. Escrita restrita a coordenador+ no
 * servidor - ver backend/PERMISSOES.md.
 */
export const apiControleOS = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/controle-os${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/controle-os?${extra.toString()}`);
    }
    return apiClient.get(`/api/controle-os${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/controle-os/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/controle-os', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/controle-os/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/controle-os/${id}`);
  }
};
