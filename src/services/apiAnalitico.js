import { apiClient } from '@/lib/apiClient';

/**
 * Analitico é só leitura no frontend hoje (nenhum .create/.update/.delete
 * no código - tabela populada por fora do app). Só expõe list/filter/get.
 */
export const apiAnalitico = {
  async list() {
    return apiClient.get('/api/analiticos');
  },

  async filter(where = {}) {
    const params = new URLSearchParams();
    if (where.empreendimento_id) params.set('empreendimento_id', where.empreendimento_id);
    if (where.documento_id) params.set('documento_id', where.documento_id);
    const qs = params.toString();
    return apiClient.get(`/api/analiticos${qs ? `?${qs}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/analiticos/${id}`);
  }
};
