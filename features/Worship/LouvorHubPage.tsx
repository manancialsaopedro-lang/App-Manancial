import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music,
  ArrowLeft,
  Calendar,
  Sparkles,
  Users,
  Mic2,
  FileCode,
  FolderArchive,
  ChevronRight,
  Clock,
  Radio,
  BookOpen
} from 'lucide-react';

export const LouvorHubPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#070a13]/80 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Voltar ao Hub"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                <Music size={20} />
              </div>
              <div>
                <h1 className="font-black text-base sm:text-lg text-white">
                  Ministério de Louvor Manancial
                </h1>
                <p className="text-xs text-slate-400">Escalas, repertório e cifras do time de louvor</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/igreja')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>Ir para Gestão</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Banner de Aguardando ZIP */}
        <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/40 via-purple-950/20 to-[#0c1220] p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold mb-4">
              <FolderArchive size={14} />
              Seção Preparada para Receber o Código
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Módulo do App de Louvor Pronto para Integração
            </h2>

            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Você mencionou que já possui o app de louvor pronto e vai enviar o arquivo <strong className="text-white">ZIP</strong> aqui na conversa. 
              Assim que você anexar o arquivo, vou extrair e incorporar todos os componentes, cifras e telas diretamente nesta seção, conectando-o ao ecossistema!
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200">
                <FileCode size={15} className="text-pink-400" />
                <span>Rotas e layout já mapeados em <code className="text-pink-300">/louvor</code></span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200">
                <Calendar size={15} className="text-cyan-400" />
                <span>Integrado ao calendário único de cultos</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none hidden md:block">
            <Music size={280} className="text-pink-400" />
          </div>
        </div>

        {/* Sneak Peek / O que teremos nesta seção */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-pink-400" />
            Recursos Integrados do Módulo de Louvor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-3">
                  <Mic2 size={20} />
                </div>
                <h4 className="font-bold text-white text-sm">Escalas de Músicos & Vocais</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Distribuição de quem toca em cada culto (Bateria, Teclado, Baixo, Violão, Vozes e Técnica de Som).
                </p>
              </div>
              <span className="mt-4 text-[11px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg w-fit">
                Conectado com Membros
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <BookOpen size={20} />
                </div>
                <h4 className="font-bold text-white text-sm">Repertório & Cifras</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Músicas selecionadas para o culto, tom, links do YouTube, BPM, ordem e cifras formatadas.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg w-fit">
                Sincronia por Culto
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                  <Clock size={20} />
                </div>
                <h4 className="font-bold text-white text-sm">Ensaios & Cronograma</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Horários de passagem de som, ensaios semanais e alinhamento com a equipe de mídia e som.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg w-fit">
                Tabela de Eventos Única
              </span>
            </div>
          </div>
        </div>

        {/* Banner de Ajuda */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            💡 <strong className="text-slate-200">Pronto para quando quiser:</strong> Pode arrastar o seu arquivo <code className="text-pink-300 font-mono">.zip</code> diretamente na janela de bate-papo!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all shrink-0"
          >
            Voltar ao Hub do Ecossistema
          </button>
        </div>
      </main>
    </div>
  );
};
