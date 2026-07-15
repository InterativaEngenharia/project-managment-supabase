import { apiClient } from '@/lib/apiClient';

/**
 * Entidade SobraUsuario com a mesma "forma" que createEntity() (entityFactory.js)
 * expõe, mas passando pelo backend. Só é filtrada por empreendimento_id no
 * código hoje.
 */
export const apiSobraUsuario = {
  async list() {
    return apiClient.get('/api/sobras-usuario');
  },

  async filter(where = {}) {
    if (where.empreendimento_id) {
      return apiClient.get(`/api/sobras-usuario?empreendimento_id=${encodeURIComponent(where.empreendimento_id)}`);
    }
    if (Object.keys(where).length > 0) {
      throw new Error('[SobraUsuario.filter] só é suportado filtrar por empreendimento_id');
    }
    return apiClient.get('/api/sobras-usuario');
  },

  async get(id) {
    return apiClient.get(`/api/sobras-usuario/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/sobras-usuario', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/sobras-usuario/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/sobras-usuario/${id}`);
  }
};
