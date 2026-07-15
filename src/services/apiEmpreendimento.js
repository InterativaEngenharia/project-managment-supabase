import { apiClient } from '@/lib/apiClient';
import { whereParaQueryString } from '@/lib/filterQuery';

/**
 * Entidade Empreendimento com a mesma "forma" que createEntity()
 * (entityFactory.js) expõe, mas passando pelo backend. Update/delete exigem
 * ser quem criou OU ter nível coordenador+ - decidido no servidor depois de
 * buscar o registro (não dá pra burlar trocando o :id) - ver
 * backend/PERMISSOES.md.
 */
export const apiEmpreendimento = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/empreendimentos${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/empreendimentos?${extra.toString()}`);
    }
    return apiClient.get(`/api/empreendimentos${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/empreendimentos/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/empreendimentos', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/empreendimentos/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/empreendimentos/${id}`);
  }
};
