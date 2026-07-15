import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';
import { whereParaQueryString } from '@/lib/filterQuery';

/**
 * Entidade PlanejamentoAtividade com a mesma "forma" que createEntity()
 * (entityFactory.js) expõe, mas passando pelo backend. A leitura aqui é
 * restrita por executor/coordenador+ no servidor (diferente da maioria das
 * outras entidades) - ver backend/PERMISSOES.md.
 */
export const apiPlanejamentoAtividade = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/api/planejamento-atividades${qs}`);
  },

  async filter(where = {}, sort, limit) {
    const params = whereParaQueryString(where);
    if (limit) {
      const extra = new URLSearchParams(params);
      extra.set('limit', limit);
      return apiClient.get(`/api/planejamento-atividades?${extra.toString()}`);
    }
    return apiClient.get(`/api/planejamento-atividades${params ? `?${params}` : ''}`);
  },

  async get(id) {
    return apiClient.get(`/api/planejamento-atividades/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/planejamento-atividades', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/planejamento-atividades/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/planejamento-atividades/${id}`);
  },

  // Realtime continua indo direto no Supabase (só observação, não escreve
  // nada) - ver mesma implementação em src/api/entityFactory.js.
  subscribe(callback) {
    const channelName = `realtime:PlanejamentoAtividade:${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'PlanejamentoAtividade' }, (payload) => callback(payload))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
