import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const { checkUserAuth, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message
      );
      setIsSubmitting(false);
      return;
    }

    await checkUserAuth();
    setIsSubmitting(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSendingReset(true);
    setResetMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    });

    setIsSendingReset(false);

    // Mesma mensagem em caso de erro ou sucesso - evita confirmar pra quem
    // está tentando descobrir se um e-mail está cadastrado no sistema.
    if (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
    }
    setResetMessage(
      'Se esse e-mail estiver cadastrado, você vai receber um link de redefinição de senha em instantes.'
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-slate-100 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-center">Entrar</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Acesse com o e-mail e senha do seu convite.
        </p>

        {authError?.type === 'user_not_registered' && (
          <div className="mb-4 p-3 rounded-md bg-orange-50 border border-orange-200 text-sm text-orange-700">
            Login efetuado, mas esse e-mail não está cadastrado na tabela de usuários do app.
            Fale com o administrador.
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="voce@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {!showForgotPassword ? (
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(true);
              setResetEmail(email);
              setResetMessage(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-700 underline text-center mt-6 w-full"
          >
            Esqueceu a senha?
          </button>
        ) : (
          <div className="mt-6 pt-6 border-t border-slate-100">
            {resetMessage ? (
              <p className="text-sm text-slate-600 text-center">{resetMessage}</p>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 text-center">
                  Informe seu e-mail para receber um link de redefinição de senha.
                </p>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="voce@empresa.com"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-1 py-2 px-4 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendingReset ? 'Enviando...' : 'Enviar link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
