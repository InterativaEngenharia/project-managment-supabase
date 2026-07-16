import React from 'react';

// Sem isso, qualquer erro de render em qualquer lugar da árvore derruba o
// app inteiro pra uma tela branca (comportamento padrão do React sem error
// boundary) - o próprio console já avisava isso. Usado em App.jsx
// envolvendo as rotas, então um componente quebrado isola o dano em vez de
// levar a aplicação toda junto.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Erro capturado:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-lg text-center space-y-3">
            <h1 className="text-xl font-semibold text-slate-900">Algo deu errado</h1>
            <p className="text-slate-600 text-sm">{this.state.error?.message || 'Erro desconhecido'}</p>
            <button
              className="mt-2 px-4 py-2 rounded bg-slate-900 text-white text-sm"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
