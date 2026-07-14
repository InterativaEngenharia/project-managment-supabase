import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Tela exibida quando o usuário chega pelo link de convite (invite) ou de
 * redefinição de senha (recovery) do Supabase Auth.
 *
 * O Supabase client já cria uma sessão válida automaticamente ao detectar o
 * token na URL (detectSessionInUrl), então aqui só precisamos capturar a
 * nova senha do usuário e chamar supabase.auth.updateUser({ password }).
 *
 * Depois de definir a senha, chama onDone() para que o AuthContext refaça a
 * checagem normal de autenticação e o usuário siga para o app.
 */
export default function SetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    onDone();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-slate-100 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-center">
          Defina sua senha
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Crie uma senha para concluir seu acesso ao sistema.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirmPassword">
              Confirme a senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
