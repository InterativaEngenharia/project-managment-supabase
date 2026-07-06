import { supabase } from '@/lib/supabaseClient';

/**
 * Aplica ordenação no estilo Base44: uma string de nome de campo, com "-" na
 * frente para ordem decrescente (ex: "-created_date"). Aceita também um
 * array de strings nesse mesmo formato.
 */
function applySort(query, sort) {
  if (!sort) return query;
  const sorts = Array.isArray(sort) ? sort : [sort];
  for (const s of sorts) {
    if (!s || typeof s !== 'string') continue;
    const descending = s.startsWith('-');
    const column = descending ? s.slice(1) : s;
    query = query.order(column, { ascending: !descending });
  }
  return query;
}

/**
 * Aplica um objeto de filtro simples { campo: valor } no estilo do
 * base44.entities.X.filter({...}) original.
 */
function applyWhere(query, where) {
  if (!where) return query;
  for (const [key, value] of Object.entries(where)) {
    if (value === null || value === undefined) {
      query = query.is(key, null);
    } else if (Array.isArray(value)) {
      query = query.in(key, value);
    } else {
      query = query.eq(key, value);
    }
  }
  return query;
}

/**
 * Cria um objeto de entidade para a tabela informada, com a mesma "forma"
 * (list/filter/get/create/update/delete/bulkCreate/subscribe) que o SDK do
 * Base44 expunha — assim as telas que já usam Entity.list(), Entity.filter(),
 * etc. continuam funcionando sem precisar ser reescritas.
 *
 * @param {string} tableName - nome exato da tabela no Postgres (case-sensitive,
 *   igual ao que foi usado no CREATE TABLE — ex: "PlanejamentoAtividade").
 */
export function createEntity(tableName) {
  return {
    /** Entity.list(sort?, limit?) */
    async list(sort, limit) {
      let query = supabase.from(tableName).select('*');
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw new Error(`[${tableName}.list] ${error.message}`);
      return data ?? [];
    },

    /** Entity.filter(where?, sort?, limit?) */
    async filter(where = {}, sort, limit) {
      let query = supabase.from(tableName).select('*');
      query = applyWhere(query, where);
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw new Error(`[${tableName}.filter] ${error.message}`);
      return data ?? [];
    },

    /** Entity.get(id) */
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw new Error(`[${tableName}.get] ${error.message}`);
      return data ?? null;
    },

    /** Entity.create(payload) */
    async create(payload) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(`[${tableName}.create] ${error.message}`);
      return data;
    },

    /** Entity.update(id, payload) */
    async update(id, payload) {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(`[${tableName}.update] ${error.message}`);
      return data;
    },

    /** Entity.bulkCreate(items[]) */
    async bulkCreate(items) {
      if (!items || items.length === 0) return [];
      const { data, error } = await supabase
        .from(tableName)
        .insert(items)
        .select();
      if (error) throw new Error(`[${tableName}.bulkCreate] ${error.message}`);
      return data ?? [];
    },

    /** Entity.delete(id) */
    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw new Error(`[${tableName}.delete] ${error.message}`);
      return true;
    },

    /**
     * Entity.subscribe(callback) - equivalente ao realtime do Base44.
     * Retorna uma função de "unsubscribe". Requer que a replicação
     * Realtime esteja habilitada para essa tabela no painel do Supabase
     * (Database → Replication).
     */
    subscribe(callback) {
      const channelName = `realtime:${tableName}:${Math.random().toString(36).slice(2)}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => callback(payload)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}
