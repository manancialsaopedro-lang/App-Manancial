import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, UserPlus, Trash2, X, CheckCircle, AlertCircle, Filter, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store';
import { TEAM_UI, INSTALLMENT_VALUE, CAMP_TOTAL_PRICE } from '../../constants';
import { AgeGroup, TeamId, PersonType, PaymentStatus, Person } from '../../types';
import { AgeBadge } from '../../components/Shared';
import { listPeople, createPerson, deletePerson as deletePersonApi, upsertPerson } from '../../lib/api/people';

export const PeopleList = ({ mode }: { mode: 'org' | 'gincana' }) => {
  const { people, setPeople, updatePerson } = useAppStore();
  const [search, setSearch] = useState("");
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const getErrorMessage = (error: unknown) => (error instanceof Error && error.message ? error.message : "Erro desconhecido");
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'Todos' | PersonType>('Todos');
  const [filterAge, setFilterAge] = useState<'Todos' | AgeGroup>('Todos');
  const [filterStatus, setFilterStatus] = useState<'Todos' | PaymentStatus>('Todos');
  const [filterInstallments, setFilterInstallments] = useState<'Todos' | 'Quitadas' | 'Abertas'>('Todos');

  const fetchPeople = useCallback(async () => {
    try {
      const data = await listPeople({ alphabetical: false });
      setPeople(data);
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error);
    }
  }, [setPeople]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const commitPersonUpdate = async (person: Person) => {
    try {
      await upsertPerson(person);
      await fetchPeople();
    } catch (error) {
      console.error("Erro ao salvar pessoa:", error);
      alert(`Nao foi possivel salvar a pessoa. Motivo: ${getErrorMessage(error)}`);
    }
  };

  const cycleAge = (id: string, current: AgeGroup) => {
    const list: AgeGroup[] = ['Adulto', 'Jovem', 'Criança', 'Indefinido'];
    const nextAge = list[(list.indexOf(current) + 1) % list.length];
    updatePerson(id, { ageGroup: nextAge });
    const updated = people.find(p => p.id === id);
    if (updated) commitPersonUpdate({ ...updated, ageGroup: nextAge });
  };

  const toggleType = (id: string, current: PersonType) => {
    const nextType = current === 'Membro' ? 'Visitante' : 'Membro';
    updatePerson(id, { personType: nextType });
    const updated = people.find(p => p.id === id);
    if (updated) commitPersonUpdate({ ...updated, personType: nextType });
  };

  const togglePaymentStatus = (id: string, current: PaymentStatus) => {
    const nextStatus = current === 'PAGO' ? 'PENDENTE' : 'PAGO';
    updatePerson(id, { paymentStatus: nextStatus });
    const updated = people.find(p => p.id === id);
    if (updated) commitPersonUpdate({ ...updated, paymentStatus: nextStatus });
  };

  const handleInstallmentClick = (p: Person, clickedIndex: number) => {
    const targetAmount = (clickedIndex + 1) * INSTALLMENT_VALUE;
    // Se clicar na parcela que jÃƒÂ¡ ÃƒÂ© o valor total atual, zera o pagamento (permite desmarcar a primeira parcela)
    // Se nÃƒÂ£o, define o valor para aquela parcela (acumulativo)
    const newAmount = p.amountPaid === targetAmount ? 0 : targetAmount;
    const paymentUpdate = { amountPaid: newAmount, lastPaymentDate: new Date().toISOString() };
    updatePerson(p.id, paymentUpdate);
    commitPersonUpdate({ ...p, ...paymentUpdate });
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

  const displayedPeople = useMemo(() => {
    if (!sortAlphabetically) return filtered;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }, [filtered, sortAlphabetically]);

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
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            <span className="text-xs font-black uppercase text-gray-500 tracking-wider">A-Z</span>
            <button
              type="button"
              role="switch"
              aria-checked={sortAlphabetically}
              onClick={() => setSortAlphabetically(prev => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sortAlphabetically ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${sortAlphabetically ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </label>
          <button onClick={async () => {
            try {
              const created = await createPerson({
                name: 'Novo Participante',
                amountPaid: 0,
                totalPrice: CAMP_TOTAL_PRICE,
                ageGroup: 'Indefinido',
                personType: 'Membro',
                teamId: 'none',
                paymentStatus: 'PENDENTE'
              });
              setPeople([created, ...people.filter(p => p.id !== created.id)]);
            } catch (error) {
              console.error("Erro ao criar pessoa:", error);
              alert(`Nao foi possivel criar a pessoa. Motivo: ${getErrorMessage(error)}`);
            }
          }} className={`px-8 py-3 rounded-2xl font-black flex items-center gap-2 text-white shadow-lg transition-all hover:scale-105 ${mode === 'org' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}>
            <UserPlus size={18} /> Novo
          </button>
        </div>
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
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Faixa EtÃƒÂ¡ria</label>
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

      <div className="md:hidden space-y-3">
        {displayedPeople.map(p => (
          <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
            <input
              className="bg-transparent font-black text-lg w-full outline-none focus:ring-2 focus:ring-blue-50 rounded p-1"
              value={p.name}
              onChange={e => updatePerson(p.id, { name: e.target.value })}
              onBlur={() => commitPersonUpdate(p)}
            />
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => toggleType(p.id, p.personType)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${p.personType === 'Membro' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}
              >
                {p.personType}
              </button>
              <AgeBadge group={p.ageGroup} onClick={() => cycleAge(p.id, p.ageGroup)} />
            </div>

            {mode === 'org' ? (
              <>
                <button
                  onClick={() => togglePaymentStatus(p.id, p.paymentStatus)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider ${p.paymentStatus === 'PAGO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-400 border-gray-200'}`}
                >
                  {p.paymentStatus === 'PAGO' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {p.paymentStatus}
                </button>
                <div className="flex justify-between gap-1">
                  {[...Array(6)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleInstallmentClick(p, i)}
                      className={`w-8 h-8 rounded-full border transition-all font-black text-[10px] ${p.amountPaid >= (i + 1) * INSTALLMENT_VALUE ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex justify-center gap-2">
                {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => (
                  <button key={tid} onClick={() => {
                    updatePerson(p.id, { teamId: tid });
                    commitPersonUpdate({ ...p, teamId: tid });
                  }} className={`w-7 h-7 rounded-md border transition-all ${p.teamId === tid ? TEAM_UI[tid].color + ' border-transparent scale-110 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`} />
                ))}
                <button onClick={() => {
                  updatePerson(p.id, { teamId: 'none' });
                  commitPersonUpdate({ ...p, teamId: 'none' });
                }} className="w-7 h-7 rounded-md border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500"><X size={10} /></button>
              </div>
            )}

            <button onClick={async () => {
              try {
                await deletePersonApi(p.id);
                await fetchPeople();
              } catch (error) {
                console.error("Erro ao remover pessoa:", error);
                alert(`Nao foi possivel remover a pessoa. Motivo: ${getErrorMessage(error)}`);
              }
            }} className="w-full py-2 rounded-xl text-red-500 bg-red-50 font-bold text-sm">
              Excluir
            </button>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Nome</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Tipo</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Idade</th>
              {mode === 'org' ? (
                <>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Status Pagamento</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Parcelas (Ref.)</th>
                </>
              ) : (
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Equipe</th>
              )}
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">A&ccedil;&otilde;es</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayedPeople.map(p => (
              <tr key={p.id} className="group hover:bg-gray-50/50">
                <td className="px-8 py-4">
                  <input
                    className="bg-transparent font-bold w-full outline-none focus:ring-2 focus:ring-blue-50 rounded p-1"
                    value={p.name}
                    onChange={e => updatePerson(p.id, { name: e.target.value })}
                    onBlur={() => commitPersonUpdate(p)}
                  />
                </td>
                <td className="px-8 py-4 text-center">
                  <button
                    onClick={() => toggleType(p.id, p.personType)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 ${p.personType === 'Membro' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}
                  >
                    {p.personType}
                  </button>
                </td>
                <td className="px-8 py-4 text-center"><AgeBadge group={p.ageGroup} onClick={() => cycleAge(p.id, p.ageGroup)} /></td>
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
                            className={`w-6 h-6 rounded-full border transition-all font-black text-[9px] ${p.amountPaid >= (i + 1) * INSTALLMENT_VALUE ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-300'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </td>
                  </>
                ) : (
                  <td className="px-8 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => (
                        <button key={tid} onClick={() => {
                          updatePerson(p.id, { teamId: tid });
                          commitPersonUpdate({ ...p, teamId: tid });
                        }} className={`w-6 h-6 rounded-md border transition-all ${p.teamId === tid ? TEAM_UI[tid].color + ' border-transparent scale-110 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`} />
                      ))}
                      <button onClick={() => {
                        updatePerson(p.id, { teamId: 'none' });
                        commitPersonUpdate({ ...p, teamId: 'none' });
                      }} className="w-6 h-6 rounded-md border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500"><X size={10} /></button>
                    </div>
                  </td>
                )}
                <td className="px-8 py-4 text-center">
                  <button onClick={async () => {
                    try {
                      await deletePersonApi(p.id);
                      await fetchPeople();
                    } catch (error) {
                      console.error("Erro ao remover pessoa:", error);
                      alert(`Nao foi possivel remover a pessoa. Motivo: ${getErrorMessage(error)}`);
                    }
                  }} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
