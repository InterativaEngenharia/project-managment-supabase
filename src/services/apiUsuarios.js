import { apiClient } from '@/lib/apiClient';

/**
 * Entidade Usuario com a mesma "forma" que createEntity() (src/api/entityFactory.js)
 * expõe para as outras tabelas - list/filter/get/create/update/delete - mas
 * passando pelo backend em vez de ler/escrever direto no Postgres com a
 * anon key. É por isso que a tabela Usuario foi tirada de ENTITY_NAMES em
 * src/api/base44Client.js: ela não deve mais ser acessível via entityFactory.
 */
export const apiUsuarios = {
  async list(sort) {
    const query = sort ? `?sort=${encodeURIComponent(sort)}` : '';
    return apiClient.get(`/api/usuarios${query}`);
  },

  /**
   * Só suporta filtrar pelo próprio e-mail (único uso real no código hoje -
   * telas buscando o perfil do usuário logado). Qualquer outro filtro
   * exigiria um endpoint novo com sua própria regra de permissão.
   */
  async filter(where = {}, _sort, limit) {
    if (!where.email) {
      throw new Error('[Usuario.filter] só é suportado filtrar por email');
    }

    const usuario = await apiClient.get('/api/usuarios/me').catch((error) => {
      if (error.status === 404) return null;
      throw error;
    });

    if (!usuario || usuario.email !== where.email) return [];
    return limit ? [usuario].slice(0, limit) : [usuario];
  },

  async get(id) {
    return apiClient.get(`/api/usuarios/${id}`);
  },

  async create(payload) {
    return apiClient.post('/api/usuarios', payload);
  },

  async update(id, payload) {
    return apiClient.patch(`/api/usuarios/${id}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/api/usuarios/${id}`);
  }
};
