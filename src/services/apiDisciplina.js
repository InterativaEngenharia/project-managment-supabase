import { apiClient } from '@/lib/apiClient';
import { whereParaQueryString } from '@/lib/filterQuery';

/**
 * Entidade Disciplina com a mesma "forma" que createEntity() (entityFactory.js)
 * expõe, mas passando pelo backend. Escrita restrita a admin+lider no
 * servidor (não é corte de hierarquia limpo) - ver backend/PERMISSOES.md.
 */
export const apiDisciplina = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/disciplinas${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/disciplinas?${extra.toString()}`);
    }
    return apiClient.get(`/api/disciplinas${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/disciplinas/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/disciplinas', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/disciplinas/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/disciplinas/${id}`);
  }
};
