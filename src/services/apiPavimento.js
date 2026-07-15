import { apiClient } from '@/lib/apiClient';

/**
 * Entidade Pavimento com a mesma "forma" que createEntity() (entityFactory.js)
 * expõe, mas passando pelo backend. Só é filtrada por empreendimento_id no
 * código hoje, então é o único filtro suportado aqui.
 */
export const apiPavimento = {
  async list() {
    return apiClient.get('/api/pavimentos');
  },

  async filter(where = {}) {
    if (where.empreendimento_id) {
      return apiClient.get(`/api/pavimentos?empreendimento_id=${encodeURIComponent(where.empreendimento_id)}`);
    }
    if (Object.keys(where).length > 0) {
      throw new Error('[Pavimento.filter] só é suportado filtrar por empreendimento_id');
    }
    return apiClient.get('/api/pavimentos');
  },

  async get(id) {
    return apiClient.get(`/api/pavimentos/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/pavimentos', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/pavimentos/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/pavimentos/${id}`);
  }
};
