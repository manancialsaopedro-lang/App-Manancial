import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Chrome, Info, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { isSupabaseConfigured, signInWithEmailPassword, signInWithGoogle, signUpWithEmail } from '../../lib/supabase';
import { InstallPWAButton } from '../../components/InstallPWAButton';

type NoticeType = 'success' | 'error' | 'info';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAppStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [registerNotice, setRegisterNotice] = useState('');
  const [notice, setNotice] = useState<{ type: NoticeType; message: string } | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('confirmed') === '1') {
      setNotice({
        type: 'success',
        message: 'Confirmacao concluida. Agora entre com seu email/senha ou Google.',
      });
    }
  }, [location.search]);

  const clearNotice = () => setNotice(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterNotice('');
    clearNotice();

    if (isRegister) {
      try {
        if (!isSupabaseConfigured) {
          setShowRegisterSuccess(true);
          setRegisterNotice('Cadastro simulado. Configure o Supabase para envio real de e-mail.');
          return;
        }

        const { data, error } = await signUpWithEmail(email, password, name);
        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          setRegisterNotice('Este e-mail ja esta cadastrado. Faca login para continuar.');
          setNotice({ type: 'info', message: 'Conta ja existente para este e-mail.' });
        } else {
          setRegisterNotice('Enviamos um e-mail de confirmacao. Abra o link para ativar sua conta.');
          setNotice({ type: 'success', message: 'Cadastro realizado. Verifique seu e-mail para confirmar.' });
        }

        setShowRegisterSuccess(true);
      } catch (err: any) {
        console.error('Erro ao criar conta:', err);
        setNotice({ type: 'error', message: `Falha ao criar conta: ${err?.message || 'erro desconhecido'}.` });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (!isSupabaseConfigured) {
        setNotice({ type: 'info', message: 'Modo local sem Supabase: login simulado em andamento...' });

        setTimeout(() => {
          signIn(email, name || undefined);
          setIsLoading(false);
          navigate('/');
        }, 700);
        return;
      }

      const { error } = await signInWithEmailPassword(email, password);
      if (error) throw error;

      setNotice({ type: 'success', message: 'Login realizado com sucesso.' });
      navigate('/');
    } catch (err: any) {
      console.error('Erro no login:', err);
      setNotice({ type: 'error', message: `Falha no login: ${err?.message || 'erro desconhecido'}.` });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearNotice();

    if (!isSupabaseConfigured) {
      setNotice({
        type: 'error',
        message: 'Supabase ausente ou invalido. Use login por e-mail em modo local.',
      });
      return;
    }

    try {
      setIsLoading(true);
      setNotice({ type: 'info', message: 'Redirecionando para autenticacao Google...' });

      const { data, error } = await signInWithGoogle();
      if (error) throw error;

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setIsLoading(false);
      setNotice({ type: 'error', message: 'Nao foi possivel iniciar o login Google. Tente novamente.' });
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      setNotice({ type: 'error', message: `Falha no login com Google: ${err?.message || 'erro desconhecido'}.` });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[100px] animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Manancial</h1>
          <p className="text-gray-400 font-medium">Gestao de Acampamento</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          {notice && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
                notice.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                  : notice.type === 'error'
                  ? 'bg-red-500/10 border-red-400/30 text-red-200'
                  : 'bg-cyan-500/10 border-cyan-400/30 text-cyan-200'
              }`}
            >
              {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{notice.message}</span>
            </div>
          )}

          {isRegister && !showRegisterSuccess && <InstallPWAButton />}

          {showRegisterSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-400/30">
                <Shield size={28} className="text-cyan-300" />
              </div>
              <h2 className="text-xl font-black text-white">Cadastro concluido</h2>
              <p className="mt-2 text-sm text-gray-400">
                {registerNotice || 'Sua conta foi criada. Verifique o e-mail para confirmar e depois faca login.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterSuccess(false);
                  setIsRegister(false);
                }}
                className="mt-6 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Ir para login
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                  onClick={() => {
                    setIsRegister(false);
                    clearNotice();
                  }}
                  className={`flex-1 pb-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                    !isRegister ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setIsRegister(true);
                    clearNotice();
                  }}
                  className={`flex-1 pb-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                    isRegister ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Criar conta
                </button>
              </div>

              <div className="space-y-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-70"
                >
                  <Chrome size={20} /> Continuar com Google
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <span className="relative bg-[#151a25] px-4 text-xs text-gray-500 uppercase font-bold">ou com e-mail</span>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {isRegister && (
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 transition-colors animate-in slide-in-from-right-4">
                      <User size={18} className="text-gray-500" />
                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 font-medium"
                        required
                      />
                    </div>
                  )}

                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 transition-colors">
                    <Mail size={18} className="text-gray-500" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 font-medium"
                      required
                    />
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 transition-colors">
                    <Lock size={18} className="text-gray-500" />
                    <input
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isRegister ? 'Criar minha conta' : 'Acessar painel'} <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              clearNotice();
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isRegister ? 'Ja tem uma conta? ' : 'Nao tem conta? '}
            <span className="text-cyan-400 font-bold underline">{isRegister ? 'Faca login' : 'Cadastre-se'}</span>
          </button>

          <p className="text-[10px] text-gray-700 mt-4 flex items-center justify-center gap-1">
            <Info size={10} /> Seguranca garantida por Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
};
