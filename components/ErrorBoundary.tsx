import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;

  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Ops! Algo deu errado.</h1>
            <p className="text-gray-500 mb-6 text-sm">
              Ocorreu um erro inesperado na aplicação. Não se preocupe, seus dados estão salvos.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl text-left mb-6 overflow-hidden">
               <code className="text-xs text-red-500 font-mono break-all">
                 {this.state.error?.message || 'Erro desconhecido'}
               </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              <RefreshCw size={18} /> Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
