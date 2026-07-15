import { apiClient } from '@/lib/apiClient';

/**
 * Entidade Equipe com a mesma "forma" que createEntity() (entityFactory.js)
 * expõe, mas passando pelo backend em vez de acessar o Postgres direto.
 */
export const apiEquipe = {
  async list() {
    return apiClient.get('/api/equipes');
  },

  async filter(where = {}) {
    if (Object.keys(where).length > 0) {
      throw new Error('[Equipe.filter] filtro não suportado - só list() é usado para Equipe hoje');
    }
    return apiClient.get('/api/equipes');
  },

  async get(id) {
    return apiClient.get(`/api/equipes/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/equipes', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/equipes/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/equipes/${id}`);
  }
};
