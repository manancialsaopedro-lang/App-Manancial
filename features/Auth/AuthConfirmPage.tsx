import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

type ConfirmStatus = 'loading' | 'success' | 'error';

const getParamsFromUrl = () => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

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
  const [status, setStatus] = useState<ConfirmStatus>('loading');
  const [message, setMessage] = useState('Confirmando autenticacao...');

  const icon = useMemo(() => {
    if (status === 'success') return <CheckCircle2 size={28} className="text-emerald-400" />;
    if (status === 'error') return <AlertCircle size={28} className="text-red-400" />;
    return <Loader2 size={28} className="text-cyan-300 animate-spin" />;
  }, [status]);

  useEffect(() => {
    const run = async () => {
      if (!isSupabaseConfigured) {
        setStatus('error');
        setMessage('Supabase nao configurado. Nao foi possivel confirmar o acesso.');
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
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const errorDescription = params.get('error_description') || params.get('error');

      if (errorDescription) {
        setStatus('error');
        setMessage(decodeURIComponent(errorDescription));
        return;
      }

      try {
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setStatus('success');
          setMessage('Conta confirmada com sucesso. Agora voce pode entrar no app.');
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          setStatus('success');
          setMessage('Confirmacao concluida. Agora voce pode entrar no app.');
          return;
        }

        const { data, error } = await client.auth.getSession();
        if (error) throw error;

        if (data.session) {
          setStatus('success');
          setMessage('Acesso confirmado. Voce ja pode entrar no app.');
          return;
        }

        setStatus('error');
        setMessage('Link de confirmacao invalido ou expirado.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Nao foi possivel confirmar seu acesso.');
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
          {icon}
        </div>

        <h1 className="text-2xl font-black">
          {status === 'loading' ? 'Validando acesso' : status === 'success' ? 'Confirmacao realizada' : 'Falha na confirmacao'}
        </h1>

        <p className="mt-3 text-sm text-gray-300">{message}</p>

        <button
          type="button"
          onClick={() => navigate('/login?confirmed=1')}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <span className="inline-flex items-center gap-2">
            <LogIn size={18} />
            Ir para login
          </span>
        </button>
      </div>
    </div>
  );
};
