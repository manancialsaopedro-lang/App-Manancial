import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  UserPlus,
  Church,
  Inbox,
  MessageSquare,
  CheckSquare,
  Sparkles,
  FileText,
  Layers,
  GraduationCap,
  Calendar,
  Tent,
  Trophy,
  Wallet,
  Globe,
  Copy,
  Phone,
  ArrowRight,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { useChurchStore } from '../../store/churchStore';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToast?: (msg: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onToast,
}) => {
  const navigate = useNavigate();
  const { members, generateWhatsAppUrl } = useChurchStore();
  const [search, setSearch] = useState('');

  // Global keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const runAction = (fn: () => void) => {
    onOpenChange(false);
    setSearch('');
    fn();
  };

  const handleCopyVisitorUrl = () => {
    const visitorUrl = `${window.location.origin}${window.location.pathname}#/visitante`;
    navigator.clipboard.writeText(visitorUrl);
    onToast?.('Link público de visitantes copiado para a área de transferência!');
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-cyan-950/65 backdrop-blur-sm animate-in fade-in" />
        <DialogPrimitive.Content
          aria-label="Spotlight de Busca Rápida"
          className="fixed left-[50%] top-[12%] sm:top-[16%] z-[95] w-[calc(100%-1.5rem)] max-w-2xl translate-x-[-50%] rounded-2xl border border-cyan-900/30 bg-white shadow-2xl shadow-cyan-950/30 overflow-hidden animate-in zoom-in-95 fade-in focus:outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            Busca Rápida e Comandos do Painel Manancial
          </DialogPrimitive.Title>

          <Command
            className="w-full flex flex-col"
            loop
            filter={(value, search) => {
              if (value.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            }}
          >
            {/* Barra de Busca Topo */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200/90 bg-slate-50/70">
              <div className="w-8 h-8 rounded-lg bg-[#082f38] text-cyan-300 flex items-center justify-center mr-3 shrink-0 shadow-sm">
                <Search size={16} />
              </div>
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Digite o nome de um membro, página ou ação rápida..."
                className="flex-1 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 mr-1"
                  title="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-2 py-1 rounded-md bg-slate-200/80 text-[10px] font-black text-slate-600 uppercase tracking-wider hover:bg-slate-300/80 transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Lista de Resultados */}
            <Command.List className="max-h-[65dvh] sm:max-h-[420px] overflow-y-auto p-2 custom-scrollbar divide-y divide-slate-100">
              <Command.Empty className="py-10 text-center">
                <p className="text-xs font-bold text-slate-600">
                  Nenhum resultado encontrado para &ldquo;{search}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tente buscar pelo nome de um membro, cargo, ministério ou módulo do painel.
                </p>
              </Command.Empty>

              {/* GRUPO 1: AÇÕES RÁPIDAS PASTORAIS */}
              <Command.Group
                heading="Ações Rápidas Pastorais"
                className="py-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-cyan-800"
              >
                <Command.Item
                  value="Cadastrar Novo Membro adicionar pessoa secretaria"
                  onSelect={() => runAction(() => navigate('/membros?action=new'))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none outline-none data-[selected=true]:bg-[#082f38] data-[selected=true]:text-white group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-50 text-[#082f38] group-data-[selected=true]:bg-cyan-500/20 group-data-[selected=true]:text-cyan-300 flex items-center justify-center">
                      <UserPlus size={15} />
                    </div>
                    <div>
                      <span className="font-bold block">Cadastrar Novo Membro</span>
                      <span className="text-[10px] text-slate-400 group-data-[selected=true]:text-cyan-200/80">
                        Abrir ficha de cadastro completo na secretaria
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 group-data-[selected=true]:bg-cyan-900 group-data-[selected=true]:text-cyan-200">
                    Ação
                  </span>
                </Command.Item>

                <Command.Item
                  value="Lançar Frequência Chamada de Culto Presença"
                  onSelect={() => runAction(() => navigate('/presenca'))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none outline-none data-[selected=true]:bg-[#082f38] data-[selected=true]:text-white group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 group-data-[selected=true]:bg-emerald-500/20 group-data-[selected=true]:text-emerald-300 flex items-center justify-center">
                      <CheckSquare size={15} />
                    </div>
                    <div>
                      <span className="font-bold block">Lançar Frequência / Chamada do Culto</span>
                      <span className="text-[10px] text-slate-400 group-data-[selected=true]:text-cyan-200/80">
                        Registrar presença de membros e identificar ausências
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="opacity-50 group-data-[selected=true]:opacity-100" />
                </Command.Item>

                <Command.Item
                  value="Copiar Link QR Code de Visitantes recepção boas-vindas"
                  onSelect={() => runAction(handleCopyVisitorUrl)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none outline-none data-[selected=true]:bg-[#082f38] data-[selected=true]:text-white group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 group-data-[selected=true]:bg-amber-500/20 group-data-[selected=true]:text-amber-300 flex items-center justify-center">
                      <Copy size={15} />
                    </div>
                    <div>
                      <span className="font-bold block">Copiar Link Público de Visitantes</span>
                      <span className="text-[10px] text-slate-400 group-data-[selected=true]:text-cyan-200/80">
                        Copia a URL do formulário de recepção para compartilhar
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 group-data-[selected=true]:bg-cyan-900 group-data-[selected=true]:text-cyan-200">
                    Copiar
                  </span>
                </Command.Item>
              </Command.Group>

              {/* GRUPO 2: DIRETÓRIO DE MEMBROS E LIDERANÇA */}
              <Command.Group
                heading={`Membros & Liderança (${members.length})`}
                className="py-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-cyan-800"
              >
                {members.map((member) => (
                  <Command.Item
                    key={member.id}
                    value={`Membro ${member.fullName} ${member.role} ${member.ministry} ${member.phoneWhatsApp}`}
                    onSelect={() =>
                      runAction(() => navigate(`/membros?memberId=${encodeURIComponent(member.id)}`))
                    }
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none outline-none data-[selected=true]:bg-[#082f38] data-[selected=true]:text-white group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-cyan-900/10 text-[#082f38] group-data-[selected=true]:bg-cyan-400 group-data-[selected=true]:text-cyan-950 font-black text-[11px] flex items-center justify-center shrink-0">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="font-bold block truncate">{member.fullName}</span>
                        <span className="text-[10px] text-slate-400 group-data-[selected=true]:text-cyan-200/80 flex items-center gap-1.5">
                          <span>{member.role}</span>
                          {member.ministry && member.ministry !== 'Nenhum' && (
                            <>
                              <span>•</span>
                              <span>Min. {member.ministry}</span>
                            </>
                          )}
                          {member.phoneWhatsApp && (
                            <>
                              <span>•</span>
                              <span>{member.phoneWhatsApp}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {member.phoneWhatsApp && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            runAction(() => {
                              const url = generateWhatsAppUrl(
                                member.phoneWhatsApp,
                                `A paz do Senhor, ${member.fullName.split(' ')[0]}! Tudo bem com você?`
                              );
                              window.open(url, '_blank');
                            });
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white group-data-[selected=true]:bg-emerald-500/20 group-data-[selected=true]:text-emerald-300 transition-colors"
                          title="Chamar no WhatsApp"
                        >
                          <Phone size={12} />
                        </button>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 group-data-[selected=true]:bg-cyan-900 group-data-[selected=true]:text-cyan-200">
                        Ver Ficha
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* GRUPO 3: NAVEGAÇÃO DO PAINEL DE GESTÃO */}
              <Command.Group
                heading="Páginas do Painel de Gestão"
                className="py-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-cyan-800"
              >
                {[
                  { label: 'Dados da Igreja & Horários de Culto', path: '/igreja', icon: Church, keywords: 'configurações endereço pastor' },
                  { label: 'Solicitações & Pedidos de Oração', path: '/solicitacoes', icon: Inbox, keywords: 'intercessão gabinete pastoral' },
                  { label: 'Diretório Geral de Membros', path: '/membros', icon: Users, keywords: 'lista secretaria batismo' },
                  { label: 'Visitantes & Boas-Vindas (QR Code)', path: '/visitantes', icon: Sparkles, keywords: 'acolhimento recepção novos' },
                  { label: 'Frequência & Histórico de Cultos', path: '/presenca', icon: CheckSquare, keywords: 'chamada faltas assiduidade' },
                  { label: 'Relatórios & Indicadores Pastorais', path: '/relatorios', icon: FileText, keywords: 'estatísticas impressão pdf' },
                  { label: 'Células & Pequenos Grupos', path: '/celulas', icon: Layers, keywords: 'líderes anfitrião reunião' },
                  { label: 'Cursos & Trilha de Discipulado', path: '/cursos', icon: GraduationCap, keywords: 'batismo escola bíblica' },
                  { label: 'Agenda & Eventos da Igreja', path: '/eventos', icon: Calendar, keywords: 'conferência congresso' },
                  { label: 'Mensagens & Templates de WhatsApp', path: '/notificacoes', icon: MessageSquare, keywords: 'disparo pastoral avisos' },
                  { label: 'Acampamento — Pagamentos & Inscritos', path: '/acampamento/pagamentos', icon: Tent, keywords: 'inscrições parcelas retiro' },
                  { label: 'Gincana — Dashboard & Placar', path: '/gincana/dash', icon: Trophy, keywords: 'tribos provas pontuação' },
                  { label: 'Central do Caixa & Cantina PDV', path: '/org/cashier-hub', icon: Wallet, keywords: 'financeiro vendas estoque' },
                  { label: 'Landing Page Pública da Igreja', path: '/landing', icon: Globe, keywords: 'site externo' },
                ].map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <Command.Item
                      key={nav.path}
                      value={`Ir para ${nav.label} ${nav.keywords}`}
                      onSelect={() => runAction(() => navigate(nav.path))}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none outline-none data-[selected=true]:bg-[#082f38] data-[selected=true]:text-white group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={15}
                          className="text-cyan-700 group-data-[selected=true]:text-cyan-300"
                        />
                        <span>{nav.label}</span>
                      </div>
                      <ArrowRight
                        size={13}
                        className="text-slate-400 group-data-[selected=true]:text-cyan-300"
                      />
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>

            {/* Rodapé com Dicas de Atalho */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shadow-2xs">
                    ↑↓
                  </kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shadow-2xs flex items-center">
                    <CornerDownLeft size={10} />
                  </kbd>
                  Selecionar
                </span>
              </div>
              <span className="text-cyan-800 font-black">Manancial Spotlight</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
