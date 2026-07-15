import { apiClient } from '@/lib/apiClient';
import { whereParaQueryString } from '@/lib/filterQuery';

/**
 * Entidade Documento com a mesma "forma" que createEntity() (entityFactory.js)
 * expõe, mas passando pelo backend. Escrita restrita a coordenador+ no
 * servidor - ver backend/PERMISSOES.md.
 */
export const apiDocumento = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/documentos${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/documentos?${extra.toString()}`);
    }
    return apiClient.get(`/api/documentos${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/documentos/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/documentos', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/documentos/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/documentos/${id}`);
  }
};
