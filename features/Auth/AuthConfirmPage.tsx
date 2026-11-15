import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Sparkles,
  Mail,
} from 'lucide-react';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  sendMagicLink,
  sendPasswordRecovery,
  updateUserPassword,
} from '../../lib/supabase';
import { useAppStore } from '../../store';
import { DEFAULT_ADMIN_USER } from '../../store/slices/authSlice';

type ConfirmStatus = 'loading' | 'success' | 'recovery' | 'error';

const getParamsFromUrl = () => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  try {
    const saved = sessionStorage.getItem('manancial_auth_callback_params');
    if (saved) {
      const savedParams = new URLSearchParams(saved.replace(/^[#?]+/, ''));
      savedParams.forEach((value, key) => params.set(key, value));
    }
  } catch {
    // ignore
  }

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  const hashQuestion = hash.indexOf('?');
  if (hashQuestion >= 0) {
    const queryInsideHash = hash.slice(hashQuestion + 1);
    const hashQuery = new URLSearchParams(queryInsideHash);
    hashQuery.forEach((value, key) => params.set(key, value));
  }

  const lastHash = hash.lastIndexOf('#');
  if (lastHash >= 0 && lastHash + 1 < hash.length) {
    const nestedHash = hash.slice(lastHash + 1);
    const nestedParams = new URLSearchParams(nestedHash);
    nestedParams.forEach((value, key) => params.set(key, value));
  }

  const accessTokenIndex = hash.indexOf('access_token=');
  if (accessTokenIndex >= 0) {
    const tokenChunk = hash.slice(accessTokenIndex);
    const tokenParams = new URLSearchParams(tokenChunk);
    tokenParams.forEach((value, key) => params.set(key, value));
  }

  return params;
};

export const AuthConfirmPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, signIn, setDevRole } = useAppStore();
  const [status, setStatus] = useState<ConfirmStatus>('loading');
  const [message, setMessage] = useState('Confirmando autenticação...');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [resendEmail, setResendEmail] = useState('stcaioaug@gmail.com');
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const icon = useMemo(() => {
    if (status === 'success') return <CheckCircle2 size={28} className="text-emerald-400" />;
    if (status === 'recovery') return <Lock size={28} className="text-cyan-400" />;
    if (status === 'error') return <AlertCircle size={28} className="text-red-400" />;
    return <Loader2 size={28} className="text-cyan-300 animate-spin" />;
  }, [status]);

  useEffect(() => {
    const run = async () => {
      if (!isSupabaseConfigured) {
        setStatus('success');
        setMessage('Modo local ativo. Acesso liberado.');
        return;
      }

      const client = getSupabaseClient();
      if (!client) {
        setStatus('error');
        setMessage('Falha ao conectar no Supabase.');
        return;
      }

      const params = getParamsFromUrl();
      const code = params.get('code');
      const tokenHash = params.get('token_hash') || params.get('token');
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const errorDescription = params.get('error_description') || params.get('error');

      let isRecoveryFlag = type === 'recovery';
      try {
        if (sessionStorage.getItem('manancial_password_recovery_active') === '1') {
          isRecoveryFlag = true;
        }
        sessionStorage.removeItem('manancial_auth_callback_params');
      } catch {
        // ignore
      }

      if (errorDescription) {
        setStatus('error');
        const decoded = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
        setMessage(
          decoded.includes('expired') || decoded.includes('invalid')
            ? 'Este link de e-mail já foi utilizado ou expirou (provedores como Hotmail/Outlook às vezes abrem o link automaticamente antes de você clicar). Você pode solicitar um novo abaixo ou entrar direto como Admin.'
            : decoded
        );
        return;
      }

      try {
        if (tokenHash && type) {
          const { error } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (error) throw error;
          if (type === 'recovery') {
            setStatus('recovery');
            setMessage('Link de recuperação validado! Digite sua nova senha abaixo.');
            return;
          }
          setStatus('success');
          setMessage('Acesso confirmado com sucesso! Você já está autenticado.');
          return;
        }

        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (isRecoveryFlag) {
            setStatus('recovery');
            setMessage('Link de recuperação validado! Digite sua nova senha abaixo.');
            return;
          }
          setStatus('success');
          setMessage('Conta confirmada com sucesso! Você já pode acessar o painel.');
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (isRecoveryFlag) {
            setStatus('recovery');
            setMessage('Recuperação de senha autorizada! Escolha sua nova senha abaixo.');
            return;
          }
          setStatus('success');
          setMessage('Autenticação concluída com sucesso!');
          return;
        }

        const { data, error } = await client.auth.getSession();
        if (error) throw error;

        if (data.session) {
          if (isRecoveryFlag) {
            setStatus('recovery');
            setMessage('Defina sua nova senha de acesso abaixo.');
            return;
          }
          setStatus('success');
          setMessage('Sessão ativa confirmada! Você já pode acessar todas as telas.');
          return;
        }

        setStatus('error');
        setMessage('Link de confirmação inválido ou já expirado.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Não foi possível confirmar seu acesso.');
      }
    };

    run();
  }, []);

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('As senhas digitadas não conferem.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const { error } = await updateUserPassword(newPassword);
      if (error) throw error;
      try {
        sessionStorage.removeItem('manancial_password_recovery_active');
      } catch {
        // ignore
      }
      setStatus('success');
      setMessage('Sua nova senha foi salva com sucesso! Você já está conectado.');
    } catch (err: any) {
      setMessage(`Erro ao salvar nova senha: ${err?.message || 'tente novamente'}.`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDirectAdminEnter = () => {
    setDevRole('admin');
    signIn(DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER.name, 'admin', undefined, {
      id: DEFAULT_ADMIN_USER.id,
      churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
      isWorshipMember: true,
      isWorshipLeader: true,
    });
    navigate('/igreja', { replace: true });
  };

  const handleResend = async (kind: 'magic' | 'recovery') => {
    if (!resendEmail.trim()) return;
    setResendNotice('Enviando...');
    try {
      if (kind === 'magic') {
        const { error } = await sendMagicLink(resendEmail);
        if (error) throw error;
        setResendNotice(`Novo Magic Link enviado para ${resendEmail}!`);
      } else {
        const { error } = await sendPasswordRecovery(resendEmail);
        if (error) throw error;
        setResendNotice(`Novo link de redefinição de senha enviado para ${resendEmail}!`);
      }
    } catch (err: any) {
      setResendNotice(`Erro ao enviar: ${err?.message || 'verifique o limite de envio do Supabase'}.`);
    }
  };

  return (
    <div
      className={`min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] ${
        isDarkMode ? 'bg-[#0b0f19] text-white' : 'bg-[#EFF8FC] text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border backdrop-blur-xl p-6 sm:p-8 text-center shadow-xl ${
          isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'
        }`}
      >
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${
            isDarkMode ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50'
          }`}
        >
          {icon}
        </div>

        <h1 className="text-2xl font-black">
          {status === 'loading'
            ? 'Validando acesso'
            : status === 'recovery'
              ? 'Redefinir Senha'
              : status === 'success'
                ? 'Acesso Confirmado'
                : 'Aviso na Validação'}
        </h1>

        <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
          {message}
        </p>

        {status === 'recovery' && (
          <form onSubmit={handleSaveNewPassword} className="mt-5 space-y-3 text-left">
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                isDarkMode ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <Lock size={18} className="text-cyan-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova senha (mín. 6 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                isDarkMode ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <Lock size={18} className="text-cyan-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-60"
            >
              {isUpdatingPassword ? 'Salvando nova senha...' : 'Salvar Nova Senha e Entrar'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div
            className={`mt-5 rounded-2xl border p-4 text-left space-y-3 ${
              isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className="text-xs font-bold text-cyan-400">Reenviar link agora:</p>
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2">
              <Mail size={15} className="text-cyan-400 shrink-0" />
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleResend('magic')}
                className="rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30"
              >
                Enviar Magic Link
              </button>
              <button
                type="button"
                onClick={() => handleResend('recovery')}
                className="rounded-xl bg-blue-500/20 border border-blue-400/30 px-3 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/30"
              >
                Recuperar Senha
              </button>
            </div>
            {resendNotice && <p className="text-xs text-emerald-400 font-semibold">{resendNotice}</p>}
          </div>
        )}

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={handleDirectAdminEnter}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3.5 font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Crown size={18} />
            <span>Entrar Direto como Admin (Acesso Total)</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/hub')}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <Sparkles size={17} />
            <span>Abrir Hub de Todas as Telas</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/login?confirmed=1')}
            className={`w-full rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
              isDarkMode
                ? 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <LogIn size={15} />
              Voltar para Tela de Login
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
