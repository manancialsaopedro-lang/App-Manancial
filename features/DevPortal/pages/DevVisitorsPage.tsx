import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  QrCode,
  Share2,
  ExternalLink,
  Sparkles,
  Heart,
  Church,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  Droplet
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface VisitorItem {
  id: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  created_at: string;
  is_first_time?: boolean;
  member_type?: string;
  needs_prayer?: boolean;
  wants_visit?: boolean;
  visit_count?: number;
  notes?: string;
}

const MOCK_VISITORS: VisitorItem[] = [
  {
    id: 'mock-1',
    full_name: 'Gabriel Siqueira Rocha',
    whatsapp: '11988776655',
    phone: '11988776655',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_first_time: true,
    member_type: 'Membro',
    needs_prayer: true,
    wants_visit: false,
    visit_count: 1,
    notes: 'Momento: QUERO_SER_MEMBRO | Opção Membresia: DEPOIS | Histórico de Fé: PROTESTANTE | Denominação: Batista | Pedido de Oração: Por recolocação profissional',
  },
  {
    id: 'mock-2',
    full_name: 'Mariana Duarte Costa',
    whatsapp: '11977665544',
    phone: '11977665544',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    is_first_time: true,
    member_type: 'Visitante',
    needs_prayer: false,
    wants_visit: false,
    visit_count: 1,
    notes: 'Momento: APENAS_VISITANTE | Histórico de Fé: CATOLICA',
  },
  {
    id: 'mock-3',
    full_name: 'Lucas Henrique de Oliveira',
    whatsapp: '11966554433',
    phone: '11966554433',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_first_time: false,
    member_type: 'Membro',
    needs_prayer: false,
    wants_visit: true,
    visit_count: 2,
    notes: 'Momento: QUERO_SER_MEMBRO | Opção Membresia: AGORA | Nascimento: 12/03/1998 | Batizado nas águas: SIM | Denominação: Assembleia de Deus',
  },
];

export const DevVisitorsPage: React.FC = () => {
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<'TODOS' | 'PRIMEIRA_VEZ' | 'QUER_MEMBRAR' | 'ORACAO'>('TODOS');
  const [copiedLink, setCopiedLink] = useState(false);

  const visitorPublicUrl = `${window.location.origin}${window.location.pathname}#/visitante`;

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase()
        .from('church_members')
        .select('*')
        .or('source.eq.QR_WIZARD,member_type.eq.Visitante')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setVisitors(data);
      } else {
        // Fallback local caso ainda não haja dados reais cadastrados no Supabase
        const local = JSON.parse(localStorage.getItem('manancial_pending_visitors') || '[]');
        if (local.length > 0) {
          setVisitors([...local, ...MOCK_VISITORS]);
        } else {
          setVisitors(MOCK_VISITORS);
        }
      }
    } catch {
      setVisitors(MOCK_VISITORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(visitorPublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Gerador de mensagem personalizada do WhatsApp
  const openWhatsAppContact = (visitor: VisitorItem) => {
    const rawNumber = visitor.whatsapp || visitor.phone || '';
    const cleanPhone = rawNumber.replace(/\D/g, '');
    const firstName = visitor.full_name.split(' ')[0];

    const isMemberInterest = visitor.member_type === 'Membro' || visitor.notes?.includes('QUERO_SER_MEMBRO');

    let text = `Olá, ${firstName}! A paz do Senhor! Aqui é da equipe de acolhimento da Igreja Manancial.\n\nFoi uma grande alegria ter você conosco em nosso culto!`;

    if (isMemberInterest) {
      text += `\n\nVimos que você demonstrou interesse em caminhar conosco como membro desta família. Segue o link para você acompanhar nossa igreja e concluir seu cadastro com calma quando quiser:\n${visitorPublicUrl}\n\nEstamos à sua total disposição para orar e conversar. Que Deus abençoe imensamente a sua semana!`;
    } else {
      text += `\n\nEsperamos que tenha se sentido acolhido e em casa. Sempre que desejar, as portas da Manancial estão abertas para você e sua família!\n\nQue Deus abençoe seus passos nesta semana!`;
    }

    const encoded = encodeURIComponent(text);
    const link = `https://wa.me/55${cleanPhone}?text=${encoded}`;
    window.open(link, '_blank');
  };

  const filteredVisitors = visitors.filter(item => {
    const matchesSearch = item.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.whatsapp && item.whatsapp.includes(search));

    if (!matchesSearch) return false;

    if (filterType === 'PRIMEIRA_VEZ') return item.is_first_time;
    if (filterType === 'QUER_MEMBRAR') return item.member_type === 'Membro' || item.notes?.includes('QUERO_SER_MEMBRO');
    if (filterType === 'ORACAO') return item.needs_prayer || item.notes?.includes('Oração');

    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header com Ações Rápidas */}
      <div className="bg-gradient-to-r from-[#0a2f38] via-[#0d3b46] to-[#0a3f4a] p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-semibold mb-2">
            <Droplet className="w-3.5 h-3.5 text-cyan-300" />
            Recepção de Visitantes & Conexão
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Visitantes da Manancial</h1>
          <p className="text-xs text-cyan-100/80 mt-1 max-w-xl">
            Acompanhe em tempo real quem participou do culto, envie mensagens de boas-vindas pelo WhatsApp com 1 clique e acompanhe quem deseja se tornar membro.
          </p>
        </div>

        {/* Link / QR Code do Wizard */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-colors active:scale-95"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-300" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link /visitante'}</span>
          </button>

          <a
            href={visitorPublicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Wizard</span>
          </a>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'PRIMEIRA_VEZ', label: '1ª Vez' },
            { id: 'QUER_MEMBRAR', label: 'Quer Membrar' },
            { id: 'ORACAO', label: 'Pediu Oração' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-[#0a3f4a] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Visitantes */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando visitantes...</div>
      ) : filteredVisitors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Nenhum visitante encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Compartilhe o link do wizard durante os cultos para que os visitantes preencham em tempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisitors.map((item) => {
            const isMemberInterest = item.member_type === 'Membro' || item.notes?.includes('QUERO_SER_MEMBRO');
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.full_name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {item.whatsapp ? `+55 ${item.whatsapp}` : 'Sem número'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {item.is_first_time && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          1ª Visita
                        </span>
                      )}
                      {isMemberInterest && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 flex items-center gap-1">
                          <Church className="w-2.5 h-2.5" />
                          Quer Membrar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notas e Detalhes */}
                  {item.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <p className="line-clamp-3 leading-relaxed">{item.notes}</p>
                    </div>
                  )}

                  {/* Pedido de Oração */}
                  {item.needs_prayer && (
                    <div className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg">
                      <Heart className="w-3 h-3 text-purple-600" />
                      <span>Solicitou oração pastoral</span>
                    </div>
                  )}
                </div>

                {/* Botão de Disparo do WhatsApp */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>

                  <button
                    onClick={() => openWhatsAppContact(item)}
                    disabled={!item.whatsapp && !item.phone}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors active:scale-95 disabled:opacity-40"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chamar no WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
