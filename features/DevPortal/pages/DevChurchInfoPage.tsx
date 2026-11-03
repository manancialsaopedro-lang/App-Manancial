import React, { useState, useEffect } from 'react';
import {
  Church,
  Calendar,
  Clock,
  Trash2,
  Plus,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  FileSpreadsheet,
  Receipt,
  Bell
} from 'lucide-react';
import { DevTabs, TabItem } from '../components/DevTabs';

interface WorshipSchedule {
  id: string;
  dayOfWeek: string;
  time: string;
  description: string;
}

interface ChurchData {
  name: string;
  foundationDate: string;
  document: string;
  legalName: string;
  notes: string;
  logoUrl: string;
  schedules: WorshipSchedule[];
}

const STORAGE_KEY = 'manancial_dev_church_info';

const DEFAULT_CHURCH_DATA: ChurchData = {
  name: 'Igreja Família Manancial',
  foundationDate: '2018-07-01',
  document: '34.868.191/0001-20',
  legalName: 'Comunidade Evangélica Manancial',
  notes: 'Sede administrativa e centro de retiros e convenções Manancial.',
  logoUrl: '/logo-manancial.png',
  schedules: [
    {
      id: '1',
      dayOfWeek: 'Domingo',
      time: '09:30',
      description: 'Culto da Família & Ceia',
    },
    {
      id: '2',
      dayOfWeek: 'Domingo',
      time: '18:00',
      description: 'Culto de Celebração & Jovens',
    },
    {
      id: '2b',
      dayOfWeek: 'Terça-feira',
      time: '19:30',
      description: 'Curso de Teologia — Pr. Adenilson Freitas',
    },
    {
      id: '3',
      dayOfWeek: 'Quarta-feira',
      time: '19:30',
      description: 'Culto da Palavra & Oração',
    },
    {
      id: '4',
      dayOfWeek: 'Sábado',
      time: '19:00',
      description: 'Rede de Jovens / Encontro de Células',
    },
  ],
};

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const DevChurchInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [church, setChurch] = useState<ChurchData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler dados da igreja:', e);
    }
    return DEFAULT_CHURCH_DATA;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(church));
    } catch (e) {
      console.error('Erro ao salvar dados localmente:', e);
    }
  }, [church]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 800KB = 819200 bytes)
    if (file.size > 800 * 1024) {
      showError('O arquivo selecionado ultrapassa o limite de 800KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setChurch((prev) => ({ ...prev, logoUrl: result }));
      showToast('Logo atualizada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleAddSchedule = () => {
    const newSchedule: WorshipSchedule = {
      id: Date.now().toString(),
      dayOfWeek: 'Domingo',
      time: '19:00',
      description: '',
    };
    setChurch((prev) => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule],
    }));
    showToast('Novo horário de culto adicionado.');
  };

  const handleRemoveSchedule = (id: string) => {
    setChurch((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((s) => s.id !== id),
    }));
    showToast('Horário de culto removido.');
  };

  const handleUpdateSchedule = (
    id: string,
    field: keyof WorshipSchedule,
    value: string
  ) => {
    setChurch((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Todas as informações foram salvas com sucesso!');
    }, 400);
  };

  const tabs: TabItem[] = [
    { id: 'detalhes', label: 'Detalhes', icon: FileSpreadsheet },
    { id: 'info', label: 'Informações da Igreja', icon: Church },
    { id: 'faturas', label: 'Faturas', icon: Receipt },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: '3' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-rose-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-rose-600 animate-in fade-in slide-in-from-top-3">
          <AlertCircle size={18} className="text-rose-300" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Page Title & Navigation Tabs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <DevTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab !== 'info' ? (
        /* Empty / Alternative Tab View */
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/80">
          <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-800 mx-auto flex items-center justify-center mb-4">
            <Church size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Aba {tabs.find((t) => t.id === activeTab)?.label}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Módulo em preparação. Você pode gerenciar as informações cadastrais e horários na aba "Informações da Igreja".
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className="px-5 py-2.5 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider transition-all"
          >
            Voltar para Informações da Igreja
          </button>
        </div>
      ) : (
        /* Main Tab: Informações da Igreja */
        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* Card 1: Logotipo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
              Identidade Visual da Igreja
            </h3>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Logo Preview */}
              <div className="w-48 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center p-3 overflow-hidden shadow-inner shrink-0">
                {church.logoUrl ? (
                  <img
                    src={church.logoUrl}
                    alt="Logo da Igreja"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <Church size={28} className="mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] font-bold">Sem Logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls & Guidelines */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-cyan-950/20 active:scale-95 transition-all">
                  <Upload size={15} />
                  <span>Enviar Logo</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                <div className="text-xs text-slate-500 space-y-0.5 font-medium">
                  <p>Formatos permitidos: JPG, GIF ou PNG.</p>
                  <p>Dimensões recomendadas: 50x200 px (horizontal).</p>
                  <p>Tamanho máximo permitido: 800KB.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dados Gerais */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Dados Cadastrais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome da Igreja */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Igreja *
                </label>
                <input
                  type="text"
                  required
                  value={church.name}
                  onChange={(e) =>
                    setChurch((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Igreja Família Manancial"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Data Fundação */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data Fundação
                </label>
                <input
                  type="date"
                  value={church.foundationDate}
                  onChange={(e) =>
                    setChurch((prev) => ({
                      ...prev,
                      foundationDate: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
                />
              </div>

              {/* CPF / CNPJ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CPF / CNPJ
                </label>
                <input
                  type="text"
                  value={church.document}
                  onChange={(e) =>
                    setChurch((prev) => ({ ...prev, document: e.target.value }))
                  }
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Razão Social */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={church.legalName}
                  onChange={(e) =>
                    setChurch((prev) => ({ ...prev, legalName: e.target.value }))
                  }
                  placeholder="Ex: Comunidade Evangélica Manancial"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={church.notes}
                onChange={(e) =>
                  setChurch((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Observações administrativas, lema ou anotações..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all resize-y"
              />
            </div>
          </div>

          {/* Card 3: Dias e Horários de Culto */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-cyan-800" />
                <h3 className="text-sm font-black tracking-tight text-slate-800">
                  Dias e Horários de Culto
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddSchedule}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold border border-cyan-200 transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Adicionar Culto</span>
              </button>
            </div>

            {/* Lista de Cultos */}
            {church.schedules.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Clock size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  Nenhum horário de culto cadastrado
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Clique no botão abaixo para adicionar a programação da semana.
                </p>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="px-4 py-2 rounded-lg bg-[#082f38] text-cyan-200 text-xs font-bold"
                >
                  Adicionar Primeiro Horário
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {church.schedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-colors"
                  >
                    {/* Dia da Semana */}
                    <div className="w-full md:w-48 shrink-0">
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Dia da Semana
                      </label>
                      <select
                        value={schedule.dayOfWeek}
                        onChange={(e) =>
                          handleUpdateSchedule(
                            schedule.id,
                            'dayOfWeek',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Horário */}
                    <div className="w-full md:w-36 shrink-0">
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Horário
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={schedule.time}
                          onChange={(e) =>
                            handleUpdateSchedule(
                              schedule.id,
                              'time',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Descrição */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Descrição (opcional)
                      </label>
                      <input
                        type="text"
                        value={schedule.description}
                        onChange={(e) =>
                          handleUpdateSchedule(
                            schedule.id,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Ex: Culto da Família, Escola Bíblica, Oração..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </div>

                    {/* Botão de Excluir */}
                    <div className="flex items-end justify-end md:self-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveSchedule(schedule.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                        title="Remover horário"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar / Salvar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-950/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
