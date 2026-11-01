import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Calendar,
  MessageCircle,
  Edit2,
  Trash2,
  X,
  Save,
  ChevronRight,
  ExternalLink,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useChurchStore } from '../../../store/churchStore';

export interface CourseStudent {
  id: string;
  studentName: string;
  phoneWhatsApp: string;
  courseTitle: 'Batismo nas Águas' | 'Novos Convertidos' | 'Escola Bíblica de Maturidade' | 'Academia de Líderes';
  teacherName: string;
  startDate: string;
  completedLessons: number;
  totalLessons: number;
  status: 'Em Andamento' | 'Concluído' | 'Trancado';
  notes?: string;
}

const STORAGE_KEY = 'manancial_church_courses';

const INITIAL_STUDENTS: CourseStudent[] = [
  {
    id: '1',
    studentName: 'Gabriel Siqueira Rocha',
    phoneWhatsApp: '(11) 98877-6655',
    courseTitle: 'Batismo nas Águas',
    teacherName: 'Pr. Carlos & Diác. Mateus',
    startDate: '2026-02-01',
    completedLessons: 4,
    totalLessons: 4,
    status: 'Concluído',
    notes: 'Apto para o batismo no próximo culto de celebração.',
  },
  {
    id: '2',
    studentName: 'Mariana Duarte Costa',
    phoneWhatsApp: '(11) 97766-5544',
    courseTitle: 'Novos Convertidos',
    teacherName: 'Líder Amanda',
    startDate: '2026-02-10',
    completedLessons: 3,
    totalLessons: 6,
    status: 'Em Andamento',
    notes: 'Acompanhando com mentoria individual.',
  },
  {
    id: '3',
    studentName: 'Lucas Gabriel Moreira',
    phoneWhatsApp: '(11) 97654-3210',
    courseTitle: 'Academia de Líderes',
    teacherName: 'Pr. Caio Augusto',
    startDate: '2026-01-15',
    completedLessons: 6,
    totalLessons: 8,
    status: 'Em Andamento',
    notes: 'Desenvolvendo projeto para abertura de nova célula.',
  },
  {
    id: '4',
    studentName: 'Beatriz Almeida Veiga',
    phoneWhatsApp: '(11) 98822-1100',
    courseTitle: 'Escola Bíblica de Maturidade',
    teacherName: 'Ev. Marcos',
    startDate: '2026-02-05',
    completedLessons: 5,
    totalLessons: 10,
    status: 'Em Andamento',
    notes: 'Excelente frequência nas aulas de teologia bíblica.',
  },
  {
    id: '5',
    studentName: 'Thiago Mendes Ferreira',
    phoneWhatsApp: '(11) 96543-2109',
    courseTitle: 'Batismo nas Águas',
    teacherName: 'Pr. Carlos & Diác. Mateus',
    startDate: '2026-02-01',
    completedLessons: 2,
    totalLessons: 4,
    status: 'Em Andamento',
    notes: 'Faltou na lição 3 sobre Espírito Santo, reposição agendada.',
  },
];

const COURSE_TYPES = [
  'Batismo nas Águas',
  'Novos Convertidos',
  'Escola Bíblica de Maturidade',
  'Academia de Líderes'
] as const;

export const DevCoursesPage: React.FC = () => {
  const { generateWhatsAppUrl } = useChurchStore();

  const [students, setStudents] = useState<CourseStudent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler estudantes de cursos:', e);
    }
    return INITIAL_STUDENTS;
  });

  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CourseStudent, 'id'>>({
    studentName: '',
    phoneWhatsApp: '',
    courseTitle: 'Batismo nas Águas',
    teacherName: '',
    startDate: new Date().toISOString().split('T')[0],
    completedLessons: 0,
    totalLessons: 4,
    status: 'Em Andamento',
    notes: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Erro ao persistir cursos:', e);
    }
  }, [students]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      studentName: '',
      phoneWhatsApp: '',
      courseTitle: 'Batismo nas Águas',
      teacherName: '',
      startDate: new Date().toISOString().split('T')[0],
      completedLessons: 0,
      totalLessons: 4,
      status: 'Em Andamento',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: CourseStudent) => {
    setEditingId(s.id);
    setFormData({
      studentName: s.studentName,
      phoneWhatsApp: s.phoneWhatsApp,
      courseTitle: s.courseTitle,
      teacherName: s.teacherName,
      startDate: s.startDate,
      completedLessons: s.completedLessons,
      totalLessons: s.totalLessons,
      status: s.status,
      notes: s.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim()) {
      showToast('Por favor, informe o nome do aluno.');
      return;
    }

    if (editingId) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...formData } : s))
      );
      showToast('Inscrição atualizada com sucesso!');
    } else {
      const newStudent: CourseStudent = {
        id: 'student_' + Date.now(),
        ...formData,
      };
      setStudents((prev) => [newStudent, ...prev]);
      showToast('Novo aluno matriculado com sucesso!');
    }

    setIsModalOpen(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o aluno "${name}" do curso?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      showToast('Aluno removido com sucesso.');
    }
  };

  const handleIncrementLesson = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextVal = Math.min(s.totalLessons, s.completedLessons + 1);
          const isComplete = nextVal === s.totalLessons;
          return {
            ...s,
            completedLessons: nextVal,
            status: isComplete ? 'Concluído' : s.status,
          };
        }
        return s;
      })
    );
    showToast('Presença na lição registrada!');
  };

  const handleSendWhatsAppEncouragement = (s: CourseStudent) => {
    const text = encodeURIComponent(
      `Graça e Paz, ${s.studentName}! Estamos muito felizes com a sua dedicação no curso *${s.courseTitle}* na Igreja Manancial. Você já completou ${s.completedLessons} de ${s.totalLessons} lições! Deus te abençoe rica e abundantemente!`
    );
    const cleanPhone = s.phoneWhatsApp.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.teacherName.toLowerCase().includes(search.toLowerCase());
    const matchCourse =
      selectedCourse === 'todos' || s.courseTitle === selectedCourse;
    const matchStatus =
      selectedStatus === 'todos' || s.status === selectedStatus;
    return matchSearch && matchCourse && matchStatus;
  });

  // KPIs
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Em Andamento').length;
  const completedStudents = students.filter((s) => s.status === 'Concluído').length;
  const baptismStudents = students.filter((s) => s.courseTitle === 'Batismo nas Águas').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-cyan-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-600 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={18} className="text-cyan-300" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
            Formação & Discipulado
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <GraduationCap size={24} className="text-[#082f38]" />
            <span>Cursos & Academia Ministerial</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de turmas de Batismo, Novos Convertidos, Maturidade Cristã e Treinamento de Líderes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#082f38] hover:bg-[#0c434f] text-cyan-200 hover:text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/20 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>Matricular Aluno</span>
        </button>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-900">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total de Alunos
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{activeStudents}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Em Andamento
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <Award size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{completedStudents}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Concluintes Formados
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{baptismStudents}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Turma de Batismo
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno ou professor..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="todos">Todos os Cursos</option>
            {COURSE_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Trancado">Trancado</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <GraduationCap size={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Nenhum aluno encontrado para os filtros.</p>
            <p className="text-xs">Tente buscar por outro termo ou cadastre um novo aluno.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#082f38] text-cyan-100 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="py-3 px-4">Aluno & Contato</th>
                  <th className="py-3 px-4">Curso</th>
                  <th className="py-3 px-4">Professor / Mentor</th>
                  <th className="py-3 px-4">Progresso de Lições</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((s) => {
                  const percent = Math.round((s.completedLessons / s.totalLessons) * 100);
                  const isDone = s.status === 'Concluído';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{s.studentName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.phoneWhatsApp}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-100">
                          {s.courseTitle}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold">{s.teacherName}</span>
                        <div className="text-[10px] text-slate-400">Início: {s.startDate}</div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span>
                            {s.completedLessons} de {s.totalLessons} lições
                          </span>
                          <span className="text-cyan-700 font-black">{percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => handleIncrementLesson(s.id)}
                            className="mt-1 text-[10px] text-cyan-800 hover:text-cyan-950 font-bold hover:underline"
                          >
                            + Marcar presença na lição
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'Em Andamento'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isDone && <CheckCircle2 size={11} />}
                          <span>{s.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppEncouragement(s)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-all"
                            title="Enviar Mensagem de Incentivo no WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-cyan-900 transition-all"
                            title="Editar Dados"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(s.id, s.studentName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                            title="Remover Aluno"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Matricular / Editar Aluno */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#082f38] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-cyan-300" />
                <h3 className="font-bold text-sm">
                  {editingId ? 'Editar Matrícula do Aluno' : 'Matricular Novo Aluno'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-cyan-200 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                  Nome do Aluno *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Nome completo do participante"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneWhatsApp}
                    onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                    placeholder="(11) 98888-7777"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                  Curso *
                </label>
                <select
                  value={formData.courseTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseTitle: e.target.value as any,
                      totalLessons: e.target.value === 'Batismo nas Águas' ? 4 : e.target.value === 'Novos Convertidos' ? 6 : 8
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-slate-800"
                >
                  {COURSE_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                  Professor / Mentor Responsável
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="Ex: Pr. Carlos, Diác. Amanda..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    Lições Feitas
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={formData.totalLessons}
                    value={formData.completedLessons}
                    onChange={(e) => setFormData({ ...formData, completedLessons: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    Total Lições
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalLessons}
                    onChange={(e) => setFormData({ ...formData, totalLessons: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Trancado">Trancado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                  Observações & Mentoria
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o aluno..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#082f38] text-cyan-200 hover:text-white uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-950/20 active:scale-95 transition-all"
                >
                  <Save size={15} />
                  <span>Salvar Inscrição</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
