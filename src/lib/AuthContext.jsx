import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

function mapSupabaseUser(supabaseUser) {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: meta.full_name || meta.nome || supabaseUser.email,
    nome: meta.nome || meta.full_name || supabaseUser.email,
    cargo: meta.cargo || null,
    perfil: meta.perfil || 'user',
    role: meta.role || 'user',
    playlist_atividades: meta.playlist_atividades || [],
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  // Mantido por compatibilidade com o formato anterior (Base44 separava a
  // checagem de "configurações públicas do app" da checagem de usuário).
  // Aqui não existe mais essa etapa separada, então resolve junto com a auth.
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState(null);
  // true quando o usuário chegou por um link de recuperação/convite de senha
  // (evento PASSWORD_RECOVERY do Supabase) - App.jsx mostra a tela
  // SetPassword em vez do resto do app enquanto isso for true.
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);

  /**
   * Verifica se o e-mail autenticado no Supabase Auth corresponde a um
   * registro ativo na tabela "Usuario" — isso replica o comportamento do
   * Base44, que bloqueava o acesso de usuários autenticados mas não
   * cadastrados no app (tela "Access Restricted").
   */
  const checkUserRegistration = useCallback(async (email) => {
    try {
      const registros = await base44.entities.Usuario.filter({ email });
      return registros && registros.length > 0;
    } catch (error) {
      console.error('Falha ao verificar cadastro do usuário:', error);
      // Em caso de falha na checagem (ex: RLS bloqueando), não barra o
      // acesso — evita travar o app inteiro por um erro de rede pontual.
      return true;
    }
  }, []);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const session = data?.session;
      if (!session) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }

      const mappedUser = mapSupabaseUser(session.user);
      const isRegistered = await checkUserRegistration(mappedUser.email);

      if (!isRegistered) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: 'user_not_registered',
          message: 'Usuário autenticado, mas não cadastrado na tabela Usuario',
        });
      } else {
        setUser(mappedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Falha ao verificar autenticação:', error);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({
        type: 'auth_required',
        message: error.message || 'Falha ao verificar autenticação',
      });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [checkUserRegistration]);

  const checkAppState = useCallback(async () => {
    setIsLoadingPublicSettings(true);
    await checkUserAuth();
    setIsLoadingPublicSettings(false);
  }, [checkUserAuth]);

  useEffect(() => {
    checkAppState();

    // Mantém o estado sincronizado com login/logout feitos em outra aba,
    // expiração de token, etc.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // O Supabase já criou uma sessão a partir do token do link de
        // recuperação (detectSessionInUrl: true no supabaseClient.js). Não
        // chamamos checkUserAuth() aqui de propósito - isso deixaria o
        // usuário entrar no app antes de trocar a senha. App.jsx mostra
        // SetPassword enquanto needsPasswordSetup for true.
        setNeedsPasswordSetup(true);
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
        setAuthChecked(true);
        return;
      }
      checkUserAuth();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      await base44.auth.logout();
    } catch (error) {
      console.error('Falha ao encerrar sessão:', error);
    }
  };

  /**
   * No Base44, isso redirecionava para uma tela de login hospedada
   * externamente. Agora o login é local (ver src/components/Login.jsx),
   * então aqui só limpamos o erro de auth para que a tela de Login seja
   * exibida por App.jsx.
   */
  const navigateToLogin = () => {
    // No-op intencional: App.jsx decide quando mostrar <Login /> com base
    // em isAuthenticated / authError.
  };

  /** Chamado pelo SetPassword depois que a nova senha foi salva com sucesso. */
  const completePasswordSetup = useCallback(async () => {
    setNeedsPasswordSetup(false);
    await checkUserAuth();
  }, [checkUserAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authChecked,
        authError,
        appPublicSettings,
        needsPasswordSetup,
        completePasswordSetup,
        logout,
        navigateToLogin,
        checkAppState,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
