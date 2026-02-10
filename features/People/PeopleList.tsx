
import React, { useState } from 'react';
import { Search, UserPlus, Trash2, X, CheckCircle, AlertCircle, Filter, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store';
import { TEAM_UI, INSTALLMENT_VALUE, CAMP_TOTAL_PRICE } from '../../constants';
import { AgeGroup, TeamId, PersonType, PaymentStatus, Person } from '../../types';
import { AgeBadge } from '../../components/Shared';

export const PeopleList = ({ mode }: { mode: 'org' | 'gincana' }) => {
  const { people, updatePerson, deletePerson, addPerson } = useAppStore();
  const [search, setSearch] = useState("");
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'Todos' | PersonType>('Todos');
  const [filterAge, setFilterAge] = useState<'Todos' | AgeGroup>('Todos');
  const [filterStatus, setFilterStatus] = useState<'Todos' | PaymentStatus>('Todos');
  const [filterInstallments, setFilterInstallments] = useState<'Todos' | 'Quitadas' | 'Abertas'>('Todos');

  const cycleAge = (id: string, current: AgeGroup) => {
    const list: AgeGroup[] = ['Adulto', 'Jovem', 'Criança', 'Indefinido'];
    updatePerson(id, { ageGroup: list[(list.indexOf(current) + 1) % list.length] });
  };

  const toggleType = (id: string, current: PersonType) => {
    updatePerson(id, { personType: current === 'Membro' ? 'Visitante' : 'Membro' });
  };

  const togglePaymentStatus = (id: string, current: PaymentStatus) => {
    updatePerson(id, { paymentStatus: current === 'PAGO' ? 'PENDENTE' : 'PAGO' });
  };

  const handleInstallmentClick = (p: Person, clickedIndex: number) => {
    const targetAmount = (clickedIndex + 1) * INSTALLMENT_VALUE;
    // Se clicar na parcela que já é o valor total atual, zera o pagamento (permite desmarcar a primeira parcela)
    // Se não, define o valor para aquela parcela (acumulativo)
    const newAmount = p.amountPaid === targetAmount ? 0 : targetAmount;
    updatePerson(p.id, { amountPaid: newAmount });
  };

  const filtered = people.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'Todos' || p.personType === filterType;
    const matchesAge = filterAge === 'Todos' || p.ageGroup === filterAge;
    const matchesStatus = filterStatus === 'Todos' || p.paymentStatus === filterStatus;
    
    let matchesInstallments = true;
    if (filterInstallments === 'Quitadas') {
      matchesInstallments = p.amountPaid >= CAMP_TOTAL_PRICE;
    } else if (filterInstallments === 'Abertas') {
      matchesInstallments = p.amountPaid < CAMP_TOTAL_PRICE;
    }

    return matchesSearch && matchesType && matchesAge && matchesStatus && matchesInstallments;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl w-full font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
              placeholder="Buscar por nome..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          {mode === 'org' && (
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${showFilters ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
            >
              <Filter size={18} /> <span className="hidden md:inline">Filtros</span>
            </button>
          )}
        </div>
        <button onClick={() => addPerson()} className={`px-8 py-3 rounded-2xl font-black flex items-center gap-2 text-white shadow-lg transition-all hover:scale-105 ${mode === 'org' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}>
          <UserPlus size={18} /> Novo
        </button>
      </div>

      {/* Barra de Filtros */}
      {showFilters && mode === 'org' && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Tipo Pessoa</label>
              <div className="relative">
                <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors">
                  <option value="Todos">Todos os Tipos</option>
                  <option value="Membro">Membro</option>
                  <option value="Visitante">Visitante</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Faixa Etária</label>
              <div className="relative">
                <select value={filterAge} onChange={e => setFilterAge(e.target.value as any)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors">
                  <option value="Todos">Todas as Idades</option>
                  <option value="Adulto">Adulto</option>
                  <option value="Jovem">Jovem</option>
                  <option value="Criança">Criança</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Status Pagamento</label>
              <div className="relative">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors">
                  <option value="Todos">Todos os Status</option>
                  <option value="PAGO">Pago</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Parcelas</label>
              <div className="relative">
                <select value={filterInstallments} onChange={e => setFilterInstallments(e.target.value as any)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors">
                  <option value="Todos">Todas</option>
                  <option value="Quitadas">Totalmente Quitadas</option>
                  <option value="Abertas">Em Aberto</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Nome</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Tipo</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Idade</th>
              
              {/* Coluna Condicional: Pagamento ou Equipe */}
              {mode === 'org' ? (
                <>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Status Pagamento</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Parcelas (Ref.)</th>
                </>
              ) : (
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Equipe</th>
              )}
              
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="group hover:bg-gray-50/50">
                {/* Nome */}
                <td className="px-8 py-4">
                  <input 
                    className="bg-transparent font-bold w-full outline-none focus:ring-2 focus:ring-blue-50 rounded p-1" 
                    value={p.name} 
                    onChange={e => updatePerson(p.id, { name: e.target.value })} 
                  />
                </td>

                {/* Tipo de Pessoa */}
                <td className="px-8 py-4 text-center">
                  <button 
                    onClick={() => toggleType(p.id, p.personType)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 ${p.personType === 'Membro' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}
                  >
                    {p.personType}
                  </button>
                </td>

                {/* Idade */}
                <td className="px-8 py-4 text-center"><AgeBadge group={p.ageGroup} onClick={() => cycleAge(p.id, p.ageGroup)} /></td>

                {/* Condicional: Pagamento vs Equipe */}
                {mode === 'org' ? (
                  <>
                    <td className="px-8 py-4 text-center">
                      <button 
                         onClick={() => togglePaymentStatus(p.id, p.paymentStatus)}
                         className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 ${p.paymentStatus === 'PAGO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500'}`}
                      >
                         {p.paymentStatus === 'PAGO' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                         {p.paymentStatus}
                      </button>
                    </td>
                    <td className="px-8 py-4 text-center opacity-50 hover:opacity-100 transition-opacity">
                      <div className="flex justify-center gap-1">
                        {[...Array(6)].map((_, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleInstallmentClick(p, i)} 
                            className={`w-6 h-6 rounded-full border transition-all font-black text-[9px] ${p.amountPaid >= (i+1) * INSTALLMENT_VALUE ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-300'}`}
                          >
                            {i+1}
                          </button>
                        ))}
                      </div>
                    </td>
                  </>
                ) : (
                  <td className="px-8 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => (
                        <button key={tid} onClick={() => updatePerson(p.id, { teamId: tid })} className={`w-6 h-6 rounded-md border transition-all ${p.teamId === tid ? TEAM_UI[tid].color + ' border-transparent scale-110 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`} />
                      ))}
                      <button onClick={() => updatePerson(p.id, { teamId: 'none' })} className="w-6 h-6 rounded-md border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500"><X size={10} /></button>
                    </div>
                  </td>
                )}

                {/* Ações */}
                <td className="px-8 py-4 text-center">
                  <button onClick={() => deletePerson(p.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
