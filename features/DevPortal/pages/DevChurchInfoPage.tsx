import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Bell,
  X,
  ArrowRight
} from 'lucide-react';
import { DevTabs, TabItem } from '../components/DevTabs';
import {
  DEFAULT_WEEKLY_SERVICES,
  TEACHING_SERVICE_NOTE,
  WEEKDAY_LABELS,
  WeeklyService,
  fetchWeeklyServices,
  saveWeeklyServices,
} from '../../Church/data/churchWeeklyServices';

interface ChurchData {
  name: string;
  foundationDate: string;
  document: string;
  legalName: string;
  notes: string;
  logoUrl: string;
}

const STORAGE_KEY = 'manancial_dev_church_info';

const DEFAULT_CHURCH_DATA: ChurchData = {
  name: 'Igreja Família Manancial',
  foundationDate: '2018-07-01',
  document: '34.868.191/0001-20',
  legalName: 'Comunidade Evangélica Manancial',
  notes: 'Sede administrativa e centro de retiros e convenções Manancial.',
  logoUrl: '/logo-manancial.png',
};

export const DevChurchInfoPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [services, setServices] = useState<WeeklyService[]>(DEFAULT_WEEKLY_SERVICES);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchWeeklyServices()
      .then((items) => {
        if (active) setServices(items);
      })
      .catch(() => {
        if (active) showError('Não foi possível carregar os dias de culto salvos. Exibindo o padrão.');
      })
      .finally(() => {
        if (active) setServicesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
    const newService: WeeklyService = {
      id: `new-${Date.now()}`,
      dayOfWeek: 0,
      time: '19:00',
      title: '',
      isTeaching: false,
    };
    setServices((prev) => [...prev, newService]);
    showToast('Novo horário de culto adicionado. Salve para publicar.');
  };

  const handleRemoveSchedule = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Horário removido. Salve para publicar.');
  };

  const handleUpdateSchedule = <K extends keyof WeeklyService>(
    id: string,
    field: K,
    value: WeeklyService[K]
  ) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = { ...s, [field]: value };
        if (field === 'isTeaching') {
          next.tag = value ? TEACHING_SERVICE_NOTE : s.tag === TEACHING_SERVICE_NOTE ? undefined : s.tag;
        }
        return next;
      })
    );
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (services.some((s) => !s.title.trim() || !s.time)) {
      showError('Preencha o horário e o nome de todos os cultos antes de salvar.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await saveWeeklyServices(services);
      setServices(saved);
      showToast('Informações e dias de culto salvos com sucesso!');
    } catch (err: any) {
      showError(err?.message || 'Não foi possível salvar os dias de culto. Verifique sua permissão.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: TabItem[] = [
    { id: 'info', label: 'Informações & Cultos', icon: Church },
    { id: 'detalhes', label: 'Resumo Institucional', icon: FileSpreadsheet },
    { id: 'faturas', label: 'Tesouraria', icon: Receipt },
    { id: 'notificacoes', label: 'Avisos & Pedidos', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification positioned below DevLayout header (h-16) */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 right-4 sm:right-6 z-[90] max-w-md bg-[#082f38] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in slide-in-from-top-3"
        >
          <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Fechar aviso"
            className="text-cyan-300 hover:text-white p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Notification positioned below DevLayout header (h-16) */}
      {errorMessage && (
        <div
          role="alert"
          className="fixed top-20 right-4 sm:right-6 z-[90] max-w-md bg-rose-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-rose-600 animate-in fade-in slide-in-from-top-3"
        >
          <AlertCircle size={18} className="text-rose-300 shrink-0" />
          <span className="text-xs font-semibold flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Fechar erro"
            className="text-rose-200 hover:text-white p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Title & Navigation Tabs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <DevTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'detalhes' ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800">{church.name}</h3>
              <p className="text-xs text-slate-500">{church.legalName} • CNPJ: {church.document}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className="px-4 py-2 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider transition-all self-start sm:self-auto"
            >
              Editar Informações
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-[11px] font-bold uppercase text-slate-400">Cultos Semanais Ativos</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{services.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-[11px] font-bold uppercase text-slate-400">Data de Fundação</div>
              <div className="text-lg font-black text-slate-800 mt-1">{church.foundationDate || '—'}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-[11px] font-bold uppercase text-slate-400">Portal Público</div>
              <button
                type="button"
                onClick={() => navigate('/landing')}
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-black text-cyan-700 hover:text-cyan-900"
              >
                Abrir Landing Page <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'faturas' ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200/80 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 mx-auto flex items-center justify-center">
            <Receipt size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Tesouraria &amp; Lançamentos</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Contas fixas, dízimos, ofertas e conciliação de eventos estão centralizados no módulo Financeiro Manancial.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/financeiro')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider transition-all"
            >
              <span>Abrir Financeiro</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              Voltar para Dados
            </button>
          </div>
        </div>
      ) : activeTab === 'notificacoes' ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200/80 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-800 mx-auto flex items-center justify-center">
            <Bell size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Central de Avisos &amp; Solicitações</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Acompanhe solicitações pastorais de membros e dispare avisos para a congregação.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/solicitacoes')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider transition-all"
            >
              <span>Ver Solicitações</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/notificacoes')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-600 text-cyan-800 hover:bg-cyan-50 text-xs font-black uppercase tracking-wider transition-all"
            >
              <span>Mural de Notificações</span>
              <ArrowRight size={14} />
            </button>
          </div>
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
            {servicesLoading ? (
              <div className="py-8 text-center text-xs font-bold text-slate-500">Carregando dias de culto...</div>
            ) : services.length === 0 ? (
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
                {services.map((schedule) => (
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
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                      >
                        {WEEKDAY_LABELS.map((label, dayIndex) => (
                          <option key={label} value={dayIndex}>
                            {label}
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
                        Nome do culto *
                      </label>
                      <input
                        type="text"
                        required
                        value={schedule.title}
                        onChange={(e) =>
                          handleUpdateSchedule(
                            schedule.id,
                            'title',
                            e.target.value
                          )
                        }
                        placeholder="Ex: Culto da Família, Culto de Ensino..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                      <label className="mt-1.5 inline-flex items-center gap-2 text-[11px] font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schedule.isTeaching}
                          onChange={(e) =>
                            handleUpdateSchedule(schedule.id, 'isTeaching', e.target.checked)
                          }
                          className="accent-cyan-800"
                        />
                        Culto de ensino (Curso de Teologia)
                      </label>
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
              disabled={isSaving || servicesLoading}
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
