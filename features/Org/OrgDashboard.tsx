
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, ArrowRight, Wallet, Ticket, 
  Edit, Save, ChevronLeft, ChevronRight, GripHorizontal, 
  TrendingUp, TrendingDown, Activity, PieChart, ArrowLeft 
} from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';

// --- WIDGET TYPES & DEFAULTS ---
type WidgetId = 'people' | 'collected' | 'forecast' | 'receivables' | 'financial' | 'adherence';

interface Widget {
  id: WidgetId;
  span: number; // 1 to 12
}

const DEFAULT_LAYOUT: Widget[] = [
  { id: 'people', span: 3 },
  { id: 'collected', span: 3 },
  { id: 'forecast', span: 3 },
  { id: 'receivables', span: 3 },
  { id: 'financial', span: 8 },
  { id: 'adherence', span: 4 },
];

export const OrgDashboard = () => {
  const { people, transactions, sales, fixedCostRent } = useAppStore();
  const navigate = useNavigate();

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('org_dash_layout_v2');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  // Dragging State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('org_dash_layout_v2', JSON.stringify(widgets));
  }, [widgets]);

  // --- ACTIONS ---

  const handleResize = (index: number, direction: 'shrink' | 'expand') => {
    const newWidgets = [...widgets];
    const currentSpan = newWidgets[index].span;
    
    if (direction === 'shrink' && currentSpan > 2) {
      newWidgets[index].span -= 1;
    }
    if (direction === 'expand' && currentSpan < 12) {
      newWidgets[index].span += 1;
    }
    setWidgets(newWidgets);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    // Effect for the element being dragged
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newWidgets = [...widgets];
      const draggedItemContent = newWidgets[dragItem.current];
      
      // Remove item
      newWidgets.splice(dragItem.current, 1);
      // Insert at new position
      newWidgets.splice(dragOverItem.current, 0, draggedItemContent);
      
      setWidgets(newWidgets);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // --- DATA CALCULATIONS ---

  // People
  const totalPeople = people.length;
  const paidPeople = people.filter(p => p.paymentStatus === 'PAGO').length;
  const pendingPeople = totalPeople - paidPeople;
  const membersCount = people.filter(p => p.personType === 'Membro').length;
  const visitorsCount = people.filter(p => p.personType === 'Visitante').length;

  // Revenue
  const totalExpectedRevenue = people.reduce((acc, p) => acc + p.totalPrice, 0);
  const totalCollectedRevenue = people.reduce((acc, p) => acc + p.amountPaid, 0);
  const remainingRevenue = totalExpectedRevenue - totalCollectedRevenue;

  // Financial (Detailed)
  const revenueCantina = transactions.filter(t => t.category === 'CANTINA' && t.type === 'ENTRADA').reduce((acc, t) => acc + t.amount, 0);
  const cmvCantina = sales.reduce((acc, s) => acc + s.totalCost, 0);
  const profitCantina = revenueCantina - cmvCantina;
  
  const manualIncomes = transactions.filter(t => t.type === 'ENTRADA' && t.category !== 'CANTINA').reduce((acc, t) => acc + t.amount, 0); // Includes subscriptions if logged as transactions, but here we use totalCollectedRevenue for subs
  const totalIncome = totalCollectedRevenue + revenueCantina + manualIncomes; // Simplified Total Cash In View

  const expenses = fixedCostRent + transactions.filter(t => t.type === 'SAIDA').reduce((acc, t) => acc + t.amount, 0);
  const totalProfit = (totalCollectedRevenue + profitCantina + manualIncomes) - expenses;
  const margin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;

  // Adherence
  const adherenceRate = totalPeople > 0 ? paidPeople / totalPeople : 0;

  // CSS Class Helper
  const getColSpanClass = (span: number) => {
    // Tailwind needs complete classes to scan
    const classes = [
      '', 'md:col-span-1', 'md:col-span-2', 'md:col-span-3', 'md:col-span-4',
      'md:col-span-5', 'md:col-span-6', 'md:col-span-7', 'md:col-span-8',
      'md:col-span-9', 'md:col-span-10', 'md:col-span-11', 'md:col-span-12'
    ];
    return classes[span] || 'md:col-span-3';
  };

  // --- RENDERERS FOR EACH WIDGET TYPE ---

  const renderPeopleCard = () => (
    <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-500/20 relative overflow-hidden h-full group">
      <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm"><Ticket size={24} /></div>
        {!isEditing && <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold flex items-center gap-1">Lista <ArrowRight size={10} /></span>}
      </div>
      <div className="relative z-10">
        <span className="block text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Inscritos</span>
        <span className="text-5xl font-black tracking-tight">{totalPeople}</span>
      </div>
      <div className="mt-4 flex gap-2 text-[10px] font-bold opacity-80">
         <span>{membersCount} Membros</span> • <span>{visitorsCount} Visitantes</span>
      </div>
    </Card>
  );

  const renderCollectedCard = () => (
    <Card className="p-6 h-full border border-emerald-100 hover:border-emerald-300 transition-colors bg-gradient-to-br from-white to-emerald-50/40 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl" />
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-3 text-emerald-500">
          <Wallet size={22} />
          <span className="font-bold uppercase text-xs tracking-widest text-emerald-700">Arrecadada</span>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black">
          {totalExpectedRevenue > 0 ? ((totalCollectedRevenue / totalExpectedRevenue) * 100).toFixed(1) : '0.0'}%
        </span>
      </div>
      <span className="text-3xl font-black text-gray-900 relative z-10">
        R$ {totalCollectedRevenue.toLocaleString('pt-BR', { notation: 'compact' })}
      </span>
      <p className="mt-1 text-xs text-gray-500 font-semibold">Entrada confirmada das inscricoes</p>
      <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalExpectedRevenue > 0 ? (totalCollectedRevenue/totalExpectedRevenue)*100 : 0}%` }} />
      </div>
    </Card>
  );

  const renderForecastCard = () => (
    <Card className="p-6 h-full border border-blue-100 hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-blue-50/50">
      <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-3 text-blue-600">
            <DollarSign size={22} />
            <span className="font-bold uppercase text-xs tracking-widest text-blue-700">Potencial a Receber</span>
         </div>
      </div>
      <span className="text-3xl font-black text-gray-900">R$ {totalExpectedRevenue.toLocaleString('pt-BR', { notation: 'compact' })}</span>
      <p className="text-xs text-gray-500 mt-2 font-semibold">Meta total prevista de inscricoes</p>
      <p className="text-[11px] text-gray-500 mt-1 font-bold">Falta receber: R$ {remainingRevenue.toLocaleString('pt-BR', { notation: 'compact' })}</p>
    </Card>
  );

  const renderReceivablesCard = () => (
    <Card className="p-6 bg-orange-50 border-orange-100 h-full hover:border-orange-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-3 text-orange-500">
            <Activity size={24} />
            <span className="font-bold uppercase text-xs tracking-widest text-orange-600">A Receber</span>
         </div>
      </div>
      <span className="text-3xl font-black text-orange-600">R$ {remainingRevenue.toLocaleString('pt-BR', { notation: 'compact' })}</span>
      <p className="text-xs text-orange-400 mt-2 font-bold">{pendingPeople} pendentes</p>
    </Card>
  );

  const renderFinancialCard = () => (
    <div className="bg-gray-900 rounded-[2.5rem] p-0 text-white shadow-2xl relative overflow-hidden h-full flex flex-col md:flex-row">
       {/* Background Effects */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-blue-600/20 to-purple-600/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
       
       {/* Left Side: Stats */}
       <div className="p-8 flex flex-col justify-between relative z-10 w-full md:w-1/2">
          <div>
             <h3 className="text-2xl font-black flex items-center gap-3 mb-6">
                <PieChart className="text-emerald-400" /> Status Financeiro
             </h3>
             
             <div className="space-y-6">
                <div>
                   <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-1">Lucro Líquido (Real)</span>
                   <span className={`text-5xl font-black tracking-tight ${totalProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                      R$ {totalProfit.toLocaleString('pt-BR', { notation: 'compact' })}
                   </span>
                   <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${margin > 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                         {margin.toFixed(1)}% Margem
                      </span>
                      <span className="text-xs text-gray-500">do faturamento total</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                   <div>
                      <span className="text-[10px] uppercase text-gray-500 font-bold block">Cantina (Líq)</span>
                      <span className="text-xl font-bold text-emerald-400">+ {profitCantina.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                   </div>
                   <div>
                      <span className="text-[10px] uppercase text-gray-500 font-bold block">Despesas</span>
                      <span className="text-xl font-bold text-red-400">- {expenses.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                   </div>
                </div>
             </div>
          </div>
          
          {!isEditing && (
             <div className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-white transition-colors cursor-pointer">
                Ver Relatório Detalhado <ArrowRight size={16} />
             </div>
          )}
       </div>

       {/* Right Side: Visual Chart */}
       <div className="relative w-full md:w-1/2 min-h-[200px] md:min-h-full bg-gray-800/50 backdrop-blur-sm md:rounded-l-[3rem] border-l border-white/5 flex flex-col justify-end overflow-hidden">
          {/* Chart Header */}
          <div className="absolute top-6 left-8 right-8 z-10">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase text-gray-400">Fluxo de Caixa</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">Tempo Real</span>
             </div>
             {/* Cash Flow Bars */}
             <div className="space-y-3">
                <div>
                   <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>Entradas (R$ {totalIncome.toLocaleString('pt-BR', { notation: 'compact' })})</span>
                   </div>
                   <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '100%' }} />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>Saídas (R$ {expenses.toLocaleString('pt-BR', { notation: 'compact' })})</span>
                   </div>
                   <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${totalIncome > 0 ? Math.min((expenses/totalIncome)*100, 100) : 0}%` }} />
                   </div>
                </div>
             </div>
          </div>

          {/* SVG Curve Background */}
          <svg className="absolute bottom-0 left-0 w-full h-[60%] pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
             <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                   <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
                   <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
             </defs>
             <path d="M0,100 L0,70 C20,60 40,80 60,50 C80,20 90,30 100,10 L100,100 Z" fill="url(#chartGradient)" />
             <path d="M0,70 C20,60 40,80 60,50 C80,20 90,30 100,10" fill="none" stroke="#34d399" strokeWidth="2" />
          </svg>
       </div>
    </div>
  );

  const renderAdherenceCard = () => (
    <Card className="h-full p-8 flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/40 border border-indigo-100">
       <h3 className="text-sm font-black text-indigo-700 mb-6 w-full text-left relative z-10 uppercase tracking-wide">Aderencia</h3>
       
       <div className="relative w-full max-w-[160px] aspect-square flex items-center justify-center z-10">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
            <circle 
              cx="50" cy="50" r="40" 
              stroke={adherenceRate === 1 ? "#10b981" : adherenceRate > 0.5 ? "#3b82f6" : "#f59e0b"} 
              strokeWidth="10" 
              fill="transparent" 
              strokeDasharray={251.2} 
              strokeDashoffset={251.2 - (adherenceRate * 251.2)} 
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-gray-900">{Math.round(adherenceRate * 100)}%</span>
          </div>
       </div>
       <p className="text-xs font-bold text-gray-500 mt-3 text-center">
         {paidPeople}/{totalPeople} pagos
       </p>
       <p className="text-[11px] font-semibold text-gray-500 mt-1 text-center">{pendingPeople} pendente(s) para fechamento</p>
    </Card>
  );

  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'people': return renderPeopleCard();
      case 'collected': return renderCollectedCard();
      case 'forecast': return renderForecastCard();
      case 'receivables': return renderReceivablesCard();
      case 'financial': return renderFinancialCard();
      case 'adherence': return renderAdherenceCard();
      default: return null;
    }
  };

  const getPathForWidget = (id: WidgetId) => {
    switch (id) {
      case 'people': return '/org/list';
      case 'collected': return '/org/collected';
      case 'forecast': return '/org/forecast';
      case 'receivables': return '/org/receivables';
      case 'financial': return '/org/analytics';
      case 'adherence': return '/org/adherence';
      default: return '/org/dash';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 p-2 pr-4 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
          >
             <ArrowLeft size={24} />
             <span className="font-black text-lg">Voltar</span>
          </button>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900">Visão Geral</h2>
            <p className="text-gray-500 font-medium mt-1">Acompanhamento em tempo real do evento.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${isEditing ? 'bg-black text-white shadow-lg scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
        >
          {isEditing ? <Save size={18} /> : <Edit size={18} />}
          {isEditing ? 'Salvar Layout' : 'Editar Dashboard'}
        </button>
      </div>

      {/* DRAGGABLE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {widgets.map((widget, index) => (
          <div
            key={widget.id}
            className={`${getColSpanClass(widget.span)} relative transition-all duration-300 ${isEditing ? 'cursor-grab active:cursor-grabbing hover:z-20' : 'cursor-pointer'}`}
            draggable={isEditing}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !isEditing && navigate(getPathForWidget(widget.id))}
          >
            {/* Editing Controls */}
            {isEditing && (
              <div className="absolute -top-3 left-0 right-0 flex justify-between items-center z-50 px-2 animate-in fade-in">
                 <div className="bg-black text-white p-1 rounded-full shadow-lg pointer-events-none">
                    <GripHorizontal size={16} />
                 </div>
                 <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-lg">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleResize(index, 'shrink'); }} 
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30"
                      disabled={widget.span <= 2}
                    >
                       <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-bold w-4 text-center leading-6">{widget.span}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleResize(index, 'expand'); }} 
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30"
                      disabled={widget.span >= 12}
                    >
                       <ChevronRight size={16} />
                    </button>
                 </div>
              </div>
            )}

            {/* Widget Container with Conditional Animation */}
            <div className={`h-full ${isEditing ? 'animate-pulse ring-2 ring-blue-400 rounded-[2.5rem] transform scale-[0.98]' : 'hover:scale-[1.02] transition-transform duration-300'}`}>
               {renderWidgetContent(widget.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
