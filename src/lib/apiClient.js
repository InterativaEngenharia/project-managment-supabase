import { supabase } from '@/lib/supabaseClient';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeader()),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error || `Erro ${response.status} ao chamar ${path}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = body?.details;
    throw error;
  }

  return body;
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' })
};
