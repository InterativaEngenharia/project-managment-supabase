import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';
import { whereParaQueryString } from '@/lib/filterQuery';

/**
 * Fábrica do lado do frontend pras entidades "simples" (sem regra de
 * permissão própria, CRUD aberto - ver backend/PERMISSOES.md e
 * backend/src/shared/genericCrudModule.ts). Mesma "forma" que
 * createEntity() (entityFactory.js) expõe, mas passando pelo backend.
 *
 * @param {string} path - caminho da rota no backend, ex: "atividades"
 * @param {string} [tableName] - nome real da tabela no Postgres, só
 *   necessário se algum componente usar `.subscribe()` (Realtime) nessa
 *   entidade - ver src/api/entityFactory.js. Realtime continua indo direto
 *   no Supabase (é só leitura/observação, não escreve nada) mesmo depois
 *   da migração pro backend.
 */
export function createGenericApiEntity(path, tableName) {
  return {
    async list(sort, limit) {
      const qs = limit ? `?limit=${limit}` : '';
      return apiClient.get(`/api/${path}${qs}`);
    },

    async filter(where = {}, sort, limit) {
      const params = whereParaQueryString(where);
      if (limit) {
        const extra = new URLSearchParams(params);
        extra.set('limit', limit);
        return apiClient.get(`/api/${path}?${extra.toString()}`);
      }
      return apiClient.get(`/api/${path}${params ? `?${params}` : ''}`);
    },

    async get(id) {
      return apiClient.get(`/api/${path}/${id}`);
    },

    async create(payload) {
      return apiClient.post(`/api/${path}`, payload);
    },

    async update(id, payload) {
      return apiClient.patch(`/api/${path}/${id}`, payload);
    },

    async delete(id) {
      return apiClient.delete(`/api/${path}/${id}`);
    },

    subscribe(callback) {
      if (!tableName) {
        throw new Error(`[${path}] .subscribe() chamado sem tableName - passe o nome real da tabela em createGenericApiEntity()`);
      }
      const channelName = `realtime:${tableName}:${Math.random().toString(36).slice(2)}`;
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => callback(payload))
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  };
}
