import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  Clock, 
  Trophy, 
  Users, 
  ArrowRight,
  Sparkles,
  DollarSign,
  Calendar,
  Flame,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import { TEAM_UI, CAMP_TOTAL_PRICE } from '../../constants';
import { Person, TeamId } from '../../types';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

export const MemberHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDarkMode, people, teamScores, schedule, sales } = useAppStore();
  const { simulatedPerson, isOverridden } = useCurrentRole();
  const [myPerson, setMyPerson] = useState<Person | null>(null);
  const [loadingPerson, setLoadingPerson] = useState(false);

  const canShowPersonalData = Boolean(user || isOverridden);

  useEffect(() => {
    let active = true;
    if (!user || isOverridden || simulatedPerson || !isSupabaseConfigured) {
      setMyPerson(null);
      return;
    }
    const client = getSupabaseClient();
    if (!client) return;

    const loadMyCampPerson = async () => {
      setLoadingPerson(true);
      try {
        const { data, error } = await client.rpc('get_my_camp_person');
        if (!active || error || !data) return;
        const row = data as Record<string, any>;
        setMyPerson({
          id: String(row.id),
          name: String(row.name || user.name || 'Acampante'),
          amountPaid: Number(row.amount_paid ?? row.amountPaid ?? 0),
          totalPrice: Number(row.total_price ?? row.totalPrice ?? CAMP_TOTAL_PRICE),
          ageGroup: (row.age_group ?? row.ageGroup ?? 'Jovem') as Person['ageGroup'],
          personType: (row.person_type ?? row.personType ?? 'Membro') as Person['personType'],
          teamId: (row.team_id ?? row.teamId ?? 'none') as TeamId,
          paymentStatus: (row.payment_status ?? row.paymentStatus ?? 'PENDENTE') as Person['paymentStatus'],
          lastPaymentDate: row.last_payment_date ?? row.lastPaymentDate ?? undefined,
          paymentMethod: row.payment_method ?? row.paymentMethod ?? undefined,
        });
      } catch (err) {
        console.warn('Não foi possível consultar dados pessoais do acampamento:', err);
      } finally {
        if (active) setLoadingPerson(false);
      }
    };

    void loadMyCampPerson();

    return () => {
      active = false;
    };
  }, [user, isOverridden, simulatedPerson]);

  const member: Person = simulatedPerson || myPerson || {
    id: 'guest',
    name: user?.name || 'Acampante',
    amountPaid: 0,
    totalPrice: CAMP_TOTAL_PRICE,
    ageGroup: 'Jovem',
    personType: 'Membro',
    teamId: 'none',
    paymentStatus: 'PENDENTE',
  };

  const hasLinkedCampRecord = Boolean(simulatedPerson || myPerson);

  const isPaid = member.paymentStatus === 'PAGO' || member.amountPaid >= member.totalPrice;
  const remainingPayment = Math.max(0, member.totalPrice - member.amountPaid);

  // Team Info
  const teamConfig = member.teamId && member.teamId !== 'none' && member.teamId !== 'org' 
    ? TEAM_UI[member.teamId] 
    : null;

  const teamScore = member.teamId && member.teamId !== 'none' 
    ? (teamScores[member.teamId] || 0) 
    : 0;

  // Teammates (somente se houver sessão autenticada ou simulação ativa)
  const teammates = useMemo(() => {
    if (!canShowPersonalData || !member.teamId || member.teamId === 'none') return [];
    return people.filter(p => p.teamId === member.teamId && p.id !== member.id);
  }, [canShowPersonalData, people, member.teamId, member.id]);

  // Ranking calculation
  const rankedTeams = useMemo(() => {
    const teams: { id: TeamId; name: string; score: number }[] = [
      { id: 'alianca', name: 'Aliança', score: teamScores.alianca || 0 },
      { id: 'segredo', name: 'Segredo', score: teamScores.segredo || 0 },
      { id: 'caminho', name: 'Caminho', score: teamScores.caminho || 0 },
    ];
    return teams.sort((a, b) => b.score - a.score);
  }, [teamScores]);

  const memberTeamPosition = useMemo(() => {
    if (!canShowPersonalData || !member.teamId || member.teamId === 'none') return null;
    const index = rankedTeams.findIndex(t => t.id === member.teamId);
    return index !== -1 ? index + 1 : null;
  }, [canShowPersonalData, rankedTeams, member.teamId]);

  // Canteen purchases for this member (nunca vaza vendas de terceiros para visitante anônimo)
  const memberSales = useMemo(() => {
    if (!canShowPersonalData || !hasLinkedCampRecord) return [];
    return sales.filter(s => s.personId === member.id || s.personName?.toLowerCase() === member.name?.toLowerCase());
  }, [canShowPersonalData, hasLinkedCampRecord, sales, member.id, member.name]);

  const canteenSummary = useMemo(() => {
    const totalSpent = memberSales.reduce((acc, s) => acc + s.total, 0);
    const pendingTab = memberSales
      .filter(s => s.status === 'PENDING' || s.paymentMethod === 'Pendência' || s.paymentMethod === 'Pendencia')
      .reduce((acc, s) => acc + s.total, 0);
    return { totalSpent, pendingTab };
  }, [memberSales]);

  // Schedule summary
  const upcomingSchedule = useMemo(() => {
    return schedule.slice(0, 4);
  }, [schedule]);

  const surfaceMuted = isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200/80';
  const textStrong = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-slate-600';

  if (!canShowPersonalData) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-300">
        <div className={`p-6 md:p-8 rounded-[2rem] border shadow-xl relative overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-[#121a2c] via-[#101626] to-[#0d121f] border-white/10 text-white'
            : 'bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/50 border-gray-100 text-gray-900'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Sparkles size={12} />
                Portal do Acampante
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Acampamento Manancial 2027
              </h1>
              <p className={`text-xs md:text-sm font-medium max-w-xl ${textSub}`}>
                Entre com sua conta da igreja para consultar sua inscrição, parcelas, equipe na gincana e extrato na cantina com segurança.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login', { state: { from: { pathname: '/membro/home' } } })}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              <LogIn size={16} />
              <span>Entrar na Minha Conta</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => navigate('/acampamento/informacoes')}
            className={`p-5 rounded-3xl border text-left transition-all hover:-translate-y-0.5 ${
              isDarkMode ? 'bg-[#121826] border-white/10 text-white hover:border-amber-500/40' : 'bg-white border-gray-100 text-gray-900 hover:border-amber-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-black uppercase tracking-wider text-amber-500 mb-1">Guia Oficial</div>
            <div className="font-black text-base">Informações do Retiro</div>
            <p className={`text-xs mt-1 ${textSub}`}>Datas, valores, o que levar e dúvidas.</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/gincana/placar')}
            className={`p-5 rounded-3xl border text-left transition-all hover:-translate-y-0.5 ${
              isDarkMode ? 'bg-[#121826] border-white/10 text-white hover:border-orange-500/40' : 'bg-white border-gray-100 text-gray-900 hover:border-orange-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-black uppercase tracking-wider text-orange-500 mb-1">Ao Vivo</div>
            <div className="font-black text-base">Placar da Gincana</div>
            <p className={`text-xs mt-1 ${textSub}`}>Acompanhe a pontuação das equipes.</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/gincana/time')}
            className={`p-5 rounded-3xl border text-left transition-all hover:-translate-y-0.5 ${
              isDarkMode ? 'bg-[#121826] border-white/10 text-white hover:border-cyan-500/40' : 'bg-white border-gray-100 text-gray-900 hover:border-cyan-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-black uppercase tracking-wider text-cyan-500 mb-1">Agenda</div>
            <div className="font-black text-base">Cronograma Oficial</div>
            <p className={`text-xs mt-1 ${textSub}`}>Horários de cultos, refeições e provas.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-300">
      
      {/* Top Welcome Banner */}
      <div className={`p-6 md:p-8 rounded-[2rem] border shadow-xl relative overflow-hidden transition-all ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#121a2c] via-[#101626] to-[#0d121f] border-white/10 text-white' 
          : 'bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/50 border-gray-100 text-gray-900'
      }`}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-cyan-500/15 text-cyan-500 border border-cyan-500/20">
              <Sparkles size={12} />
              Portal do Acampante
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{member.name}</span>!
            </h1>
            <p className={`text-xs md:text-sm font-medium ${textSub}`}>
              Bem-vindo ao seu espaço no <span className={`font-bold ${textStrong}`}>Acampamento Manancial 25:14</span>.
            </p>
          </div>

          {/* Quick Member Badge */}
          <div className={`flex items-center gap-3 backdrop-blur-md px-4 py-3 rounded-2xl border shrink-0 ${
            isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/80 border-slate-200 shadow-sm'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
              teamConfig ? teamConfig.color : 'bg-gray-600'
            }`}>
              {teamConfig ? teamConfig.name.substring(0, 1) : '?'}
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${textSub}`}>Equipe Oficial</div>
              <div className={`text-sm font-black ${textStrong}`}>
                {teamConfig ? teamConfig.name : 'A Definir'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Inscrição + Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD 1: Minha Inscrição */}
        <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all flex flex-col justify-between ${
          isDarkMode ? 'bg-[#121826] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" />
                Minha Inscrição
              </span>
              {loadingPerson ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-500">
                  Carregando...
                </span>
              ) : hasLinkedCampRecord ? (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isPaid 
                    ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {isPaid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {isPaid ? '100% Quitado' : 'Pagamento Pendente'}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-500 dark:text-slate-300 border border-slate-500/20">
                  Vínculo Pendente
                </span>
              )}
            </div>

            {loadingPerson ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">Consultando sua inscrição no Acampamento...</div>
            ) : !hasLinkedCampRecord ? (
              <div className="space-y-3 py-2">
                <p className={`text-xs leading-relaxed ${textSub}`}>
                  Sua conta ainda não possui ficha vinculada na lista oficial do Acampamento 2027. Se você já se inscreveu, fale com a organização pelo WhatsApp para vincular seu nome.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/acampamento/informacoes')}
                  className="text-xs font-black text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  Ver Guia e Contato do Retiro <ArrowRight size={13} />
                </button>
              </div>
            ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black">
                    R$ {member.amountPaid.toFixed(2)}
                  </div>
                  <div className={`text-[11px] font-medium ${textSub}`}>
                    de R$ {member.totalPrice.toFixed(2)} total do retiro
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${surfaceMuted} ${textSub}`}>
                    {member.ageGroup} • {member.personType}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200/40 dark:bg-gray-200/20 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isPaid ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, (member.amountPaid / member.totalPrice) * 100)}%` }}
                />
              </div>

              {!isPaid && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <DollarSign size={13} />
                    Restante a acertar: R$ {remainingPayment.toFixed(2)}
                  </div>
                  <p className="opacity-80">
                    Você pode quitar na Central do Caixa com cartão, Pix ou dinheiro durante o check-in.
                  </p>
                </div>
              )}
            </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>Última atualização: {member.lastPaymentDate ? new Date(member.lastPaymentDate).toLocaleDateString('pt-BR') : 'No cadastro'}</span>
            <span className="font-bold text-cyan-400">Tudo certo!</span>
          </div>
        </div>

        {/* CARD 2: Minha Equipe */}
        <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all flex flex-col justify-between ${
          isDarkMode ? 'bg-[#121826] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Shield size={14} className="text-orange-500" />
                Minha Equipe na Gincana
              </span>
              {memberTeamPosition && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                  <Trophy size={11} />
                  {memberTeamPosition}º Lugar
                </span>
              )}
            </div>

            {teamConfig ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${teamConfig.color} flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-black/20`}>
                    <Flame size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{teamConfig.name}</h3>
                    <p className={`text-xs font-medium ${textSub}`}>
                      Pontuação atual: <span className={`font-bold text-sm ${textStrong}`}>{teamScore} pts</span>
                    </p>
                  </div>
                </div>

                {/* Teammates Preview */}
                <div className={`p-3 rounded-2xl border ${surfaceMuted}`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between ${textSub}`}>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> Colegas de Equipe
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-black">{teammates.length + 1} integrantes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {teammates.slice(0, 6).map((t) => (
                      <span key={t.id} className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                        isDarkMode ? 'bg-black/20 text-gray-300' : 'bg-white border border-slate-200 text-slate-700'
                      }`}>
                        {t.name.split(' ')[0]}
                      </span>
                    ))}
                    {teammates.length > 6 && (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold">
                        +{teammates.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-500/20 text-gray-400 flex items-center justify-center mx-auto">
                  <Shield size={24} />
                </div>
                <h4 className="font-bold text-sm">Equipe a definir</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  As equipes serão sorteadas e anunciadas no culto de abertura na sexta-feira à noite!
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
            <button 
              onClick={() => navigate('/gincana/placar')}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              Ver Placar Geral ao Vivo <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Cantina & Cronograma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD 3: Cantina & Extrato */}
        <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all flex flex-col justify-between ${
          isDarkMode ? 'bg-[#121826] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-emerald-500" />
                Meu Consumo na Cantina
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {memberSales.length} compras
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-3 rounded-2xl border ${surfaceMuted}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${textSub}`}>Total Consumido</div>
                <div className={`text-xl font-black mt-0.5 ${textStrong}`}>
                  R$ {canteenSummary.totalSpent.toFixed(2)}
                </div>
              </div>

              <div className={`p-3 rounded-2xl border ${
                canteenSummary.pendingTab > 0 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-300' 
                  : `${surfaceMuted} text-emerald-600 dark:text-emerald-400`
              }`}>
                <div className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Fiado em Aberto</div>
                <div className="text-xl font-black mt-0.5">
                  {canteenSummary.pendingTab > 0 
                    ? `R$ ${canteenSummary.pendingTab.toFixed(2)}` 
                    : 'R$ 0,00'}
                </div>
              </div>
            </div>

            {/* Recent purchases list */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Últimas Compras
              </div>
              {memberSales.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {memberSales.slice(0, 4).map((sale) => (
                    <div key={sale.id} className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                      isDarkMode ? 'bg-black/20' : 'bg-slate-50 border border-slate-200/70'
                    }`}>
                      <div className="space-y-0.5">
                        <div className={`font-bold ${textStrong}`}>
                          {sale.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ') || 'Produtos variados'}
                        </div>
                        <div className={`text-[10px] ${textSub}`}>
                          {new Date(sale.date).toLocaleDateString('pt-BR')} • {sale.paymentMethod}
                        </div>
                      </div>
                      <div className="font-black text-right shrink-0 ml-2">
                        R$ {sale.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-xl border text-center text-xs ${surfaceMuted} ${textSub}`}>
                  Nenhuma compra registrada ainda. Visite nossa cantina nos intervalos!
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Pagamentos são acertados no Caixa Central</span>
            <span className="font-bold text-emerald-400">Cantina Aberta</span>
          </div>
        </div>

        {/* CARD 4: Cronograma / Próximas Atividades */}
        <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all flex flex-col justify-between ${
          isDarkMode ? 'bg-[#121826] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Clock size={14} className="text-cyan-400" />
                Cronograma Oficial
              </span>
              <button 
                onClick={() => navigate('/gincana/time')}
                className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                Ver Completo <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {upcomingSchedule.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    idx === 0 
                      ? 'bg-cyan-500/10 border-cyan-500/30' 
                      : surfaceMuted
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">{item.startTime}</span>
                      <span className={`text-xs font-bold ${textStrong}`}>{item.title}</span>
                    </div>
                    {item.description && (
                      <p className={`text-[10px] line-clamp-1 ${textSub}`}>{item.description}</p>
                    )}
                  </div>
                  <span className={`text-[10px] uppercase font-bold shrink-0 ml-2 ${textSub}`}>
                    {item.day.split('-')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>Fique atento aos toques de chamada!</span>
            <span className="font-bold text-cyan-400">Horários oficiais</span>
          </div>
        </div>

      </div>

      {/* PLACAR GERAL: Barra de Ranking das Equipes */}
      <div className={`p-6 rounded-3xl border shadow-lg ${
        isDarkMode ? 'bg-[#121826] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h3 className="font-black text-sm uppercase tracking-wider">Disputa da Gincana Manancial</h3>
          </div>
          <button 
            onClick={() => navigate('/gincana/placar')}
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            Placar Detalhado
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rankedTeams.map((team, idx) => {
            const ui = TEAM_UI[team.id];
            const isMyTeam = member.teamId === team.id;
            return (
              <div 
                key={team.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isMyTeam 
                    ? 'ring-2 ring-cyan-400 bg-cyan-500/10 border-cyan-500/30' 
                    : surfaceMuted
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {idx + 1}º Lugar {isMyTeam && '• SEU TIME'}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${ui.color}`} />
                </div>
                <div className="text-lg font-black">{ui.name}</div>
                <div className="text-xs font-bold text-gray-400 mt-1">
                  {team.score} pontos
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
