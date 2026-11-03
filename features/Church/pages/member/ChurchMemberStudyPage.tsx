import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle2,
  BookOpen,
  MessageCircle,
  ArrowRight,
  Droplets,
  Sparkles,
  HeartHandshake,
  Check,
  X
} from 'lucide-react';
import {
  AVAILABLE_CHURCH_COURSES,
  BAPTISM_INSTRUCTIONS_STEPS,
  STORAGE_COURSES_KEY,
  STORAGE_BAPTISM_INTENT_KEY,
  MemberCourseItem,
  ChurchRequestItem,
  getStoredPastoralRequests,
  saveStoredPastoralRequests
} from '../../data/churchMemberData';
import { PastoralRequestModal } from '../../components/PastoralRequestModal';

interface MemberLayoutContext {
  memberFullName: string;
  memberFirstName: string;
  openPastoralModal: () => void;
  showToast: (msg: string) => void;
}

export const ChurchMemberStudyPage: React.FC = () => {
  const { memberFullName, memberFirstName, showToast } =
    useOutletContext<MemberLayoutContext>();

  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [selectedCourseModal, setSelectedCourseModal] = useState<MemberCourseItem | null>(null);
  const [studentName, setStudentName] = useState(memberFullName);
  const [studentPhone, setStudentPhone] = useState('');
  const [studentNotes, setStudentNotes] = useState('');

  // Estado específico para "Quero me Batizar"
  const [baptismModalOpen, setBaptismModalOpen] = useState(false);
  const [baptismRegistered, setBaptismRegistered] = useState(false);
  const [baptismPhone, setBaptismPhone] = useState('');
  const [baptismShift, setBaptismShift] = useState('Domingo de Manhã (08:30)');
  const [baptismTestimony, setBaptismTestimony] = useState('');

  // Atendimento com Pr. Adenilson
  const [adenilsonModalOpen, setAdenilsonModalOpen] = useState(false);

  const loadEnrollments = () => {
    try {
      const raw = localStorage.getItem(STORAGE_COURSES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const myCourseTitles = parsed
          .filter((c: any) =>
            (c.studentName || '').toLowerCase().includes(memberFirstName.toLowerCase())
          )
          .map((c: any) => c.courseTitle);
        setEnrolledCourses(myCourseTitles);
        if (myCourseTitles.includes('Batismo nas Águas')) {
          setBaptismRegistered(true);
        }
      }
      const savedBaptism = localStorage.getItem(STORAGE_BAPTISM_INTENT_KEY);
      if (savedBaptism === 'true') {
        setBaptismRegistered(true);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    setStudentName(memberFullName);
    loadEnrollments();
  }, [memberFullName, memberFirstName]);

  const handleConfirmCourseEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseModal || !studentName.trim()) return;

    try {
      const existingRaw = localStorage.getItem(STORAGE_COURSES_KEY);
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const newEnrollment = {
        id: 'student_' + Date.now(),
        studentName: studentName.trim(),
        phoneWhatsApp: studentPhone.trim() || '(22) 99999-0000',
        courseTitle: selectedCourseModal.title,
        teacherName: selectedCourseModal.teacher,
        startDate: new Date().toISOString().split('T')[0],
        completedLessons: 0,
        totalLessons: selectedCourseModal.totalLessons,
        status: 'Em Andamento',
        notes:
          studentNotes.trim() ||
          `Matrícula realizada pelo App do Membro no curso ${selectedCourseModal.title}.`,
      };
      localStorage.setItem(
        STORAGE_COURSES_KEY,
        JSON.stringify([newEnrollment, ...existingList])
      );
    } catch (err) {
      console.warn('Erro ao salvar matrícula:', err);
    }

    setEnrolledCourses((prev) => [...prev, selectedCourseModal.title]);
    showToast(`Matrícula confirmada em "${selectedCourseModal.title}"!`);
    setSelectedCourseModal(null);
    setStudentNotes('');
  };

  const handleConfirmBaptismDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    // 1. Registra na lista de Cursos (Batismo nas Águas)
    try {
      const existingRaw = localStorage.getItem(STORAGE_COURSES_KEY);
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const newBaptismStudent = {
        id: 'baptism_' + Date.now(),
        studentName: studentName.trim(),
        phoneWhatsApp: baptismPhone.trim() || '(22) 99999-0000',
        courseTitle: 'Batismo nas Águas',
        teacherName: 'Pr. Carlos & Equipe Pastoral',
        startDate: new Date().toISOString().split('T')[0],
        completedLessons: 0,
        totalLessons: 4,
        status: 'Em Andamento',
        notes: `Quero me Batizar! Horário preferencial: ${baptismShift}. ${baptismTestimony.trim()}`,
      };
      localStorage.setItem(
        STORAGE_COURSES_KEY,
        JSON.stringify([newBaptismStudent, ...existingList])
      );
      localStorage.setItem(STORAGE_BAPTISM_INTENT_KEY, 'true');
    } catch (err) {
      console.warn('Erro ao registrar batismo:', err);
    }

    // 2. Envia também notificação de Atendimento Pastoral para o Pastor acompanhar o batizando
    const newPastoralReq: ChurchRequestItem = {
      id: Date.now().toString(),
      subject: 'Quero me Batizar nas Águas (Inscrição & Preparação)',
      type: 'Atendimento Pastoral',
      subCategory: 'Batismo nas Águas',
      requester: studentName.trim(),
      phone: baptismPhone.trim() || undefined,
      details: `Decisão pelo Batismo nas Águas registrada pelo App do Membro. Disponibilidade para aulas preparatórias: ${baptismShift}. ${
        baptismTestimony.trim() ? `Observação: ${baptismTestimony.trim()}` : ''
      }`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
      urgency: 'Normal',
      preferredShift: baptismShift,
      privacyLevel: 'Pastores',
      assignedPastor: 'Pastor Titular (Atende direto ou direciona)',
      routingMode: 'Atendimento Direto',
      pastorNotified: true,
    };

    const currentReqs = getStoredPastoralRequests();
    saveStoredPastoralRequests([newPastoralReq, ...currentReqs]);

    setBaptismRegistered(true);
    setEnrolledCourses((prev) => [...prev, 'Batismo nas Águas']);
    setBaptismModalOpen(false);
    showToast(
      'Que alegria! Sua decisão "Quero me Batizar" foi registrada e o Pastor já foi notificado!'
    );
  };

  const theologyCourse = AVAILABLE_CHURCH_COURSES[0];
  const otherCourses = AVAILABLE_CHURCH_COURSES.filter(
    (c) => c.id !== 'curso-teologia' && c.id !== 'curso-batismo'
  );
  const isEnrolledTheology = enrolledCourses.includes('Curso de Teologia');

  return (
    <div className="space-y-7">
      {/* 1. DESTAQUE PRINCIPAL: CURSO DE TEOLOGIA ÀS TERÇAS COM PR. ADENILSON FREITAS */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062127] via-[#082f38] to-[#0f515e] text-white p-6 sm:p-8 shadow-lg">
        <div className="pointer-events-none absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/30">
                <GraduationCap size={14} className="text-amber-300" />
                Formação Teológica Oficial
              </span>
              <span className="text-xs font-extrabold text-cyan-200 bg-white/10 px-3 py-1 rounded-full">
                Toda Terça-feira • 19:30h
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Curso de Teologia Manancial
              </h1>
              <p className="text-sm sm:text-base font-extrabold text-amber-300 mt-1">
                Professor: Pr. Adenilson Freitas
              </p>
              <p className="text-xs sm:text-sm text-cyan-100/90 font-medium mt-2.5 leading-relaxed">
                {theologyCourse.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isEnrolledTheology ? (
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-100 text-xs font-black">
                  <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                  <span>Você está matriculado no Curso de Teologia (Terças-feiras)!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedCourseModal(theologyCourse)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <GraduationCap size={18} />
                  <span>Inscrever-se no Curso de Teologia</span>
                  <ArrowRight size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setAdenilsonModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Falar com Pr. Adenilson Freitas</span>
              </button>
            </div>
          </div>

          {/* Grade Curricular Resumida do Curso de Teologia */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-xs rounded-2xl p-5 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Módulos de Estudo (Terças-feiras)
              </span>
              <span className="text-[11px] font-bold text-cyan-200">
                {theologyCourse.totalLessons} aulas
              </span>
            </div>
            <ul className="space-y-2 text-xs text-white/95 font-semibold">
              {theologyCourse.modules.map((mod, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-xl bg-black/20 border border-white/10 flex items-center gap-2.5"
                >
                  <BookOpen size={14} className="text-amber-300 shrink-0" />
                  <span>{mod}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO ESPECIAL: INSTRUÇÕES DO BATISMO NAS ÁGUAS & "QUERO ME BATIZAR" */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-cyan-200/90 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-[#082f38] text-white flex items-center justify-center shadow-md shrink-0">
              <Droplets size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#082f38]">
                  <Sparkles size={11} />
                  Ordenança & Passo de Fé
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  “Quem crer e for batizado será salvo” (Marcos 16:16)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Batismo nas Águas — Instruções & Inscrição
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Deseja descer às águas batismais na Igreja Manancial? Confira abaixo como funciona a preparação passo a passo.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {baptismRegistered ? (
              <div className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-black">
                <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                <span>Inscrição "Quero me Batizar" Confirmada!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setBaptismModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#082f38] hover:bg-[#0a434d] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-950/20 transition-all active:scale-95 cursor-pointer"
              >
                <Droplets size={18} className="text-cyan-300" />
                <span>Quero me Batizar!</span>
                <ArrowRight size={16} className="text-cyan-300" />
              </button>
            )}
          </div>
        </div>

        {/* Os 4 Passos das Instruções do Batismo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BAPTISM_INSTRUCTIONS_STEPS.map((item) => (
            <div
              key={item.stepNumber}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#082f38] text-cyan-300 font-black text-sm flex items-center justify-center shrink-0">
                {item.stepNumber}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded">
                  {item.highlight}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de Dúvidas sobre o Batismo */}
        <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-cyan-950 font-medium">
            <strong>Tem alguma dúvida sobre o batismo?</strong> Ao clicar em{' '}
            <strong>"Quero me Batizar"</strong>, o Pastor recebe a notificação e entra em contato para combinar as aulas preparatórias.
          </div>
          {!baptismRegistered && (
            <button
              type="button"
              onClick={() => setBaptismModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#082f38] text-cyan-200 text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Fazer Minha Inscrição
            </button>
          )}
        </div>
      </section>

      {/* 3. OUTROS CURSOS DE DISCIPULADO & FORMAÇÃO */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-800 block">
            Discipulado & Crescimento
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Novos Convertidos & Formação de Obreiros
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherCourses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course.title);
            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 text-[#082f38] border border-cyan-200">
                      {course.badge}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {course.totalLessons} lições
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{course.title}</h3>
                  <p className="text-xs font-bold text-cyan-900">{course.teacher}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
                  <p className="text-[11px] font-semibold text-slate-500 pt-1">
                    📅 {course.scheduleLabel}
                  </p>
                </div>

                {isEnrolled ? (
                  <div className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Inscrito na Turma</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedCourseModal(course)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Participar da Turma
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal "Quero me Batizar!" */}
      {baptismModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setBaptismModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#082f38] text-cyan-300 flex items-center justify-center shrink-0">
                  <Droplets size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-md">
                    Passo de Fé & Preparação
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Quero me Batizar nas Águas!
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Sua inscrição será enviada ao Pastor para iniciar a classe preparatória
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBaptismModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmBaptismDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#082f38] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  WhatsApp para Contato Pastoral *
                </label>
                <input
                  type="tel"
                  required
                  value={baptismPhone}
                  onChange={(e) => setBaptismPhone(e.target.value)}
                  placeholder="(22) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#082f38] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Melhor Horário para os 4 Encontros Preparatórios
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Domingo de Manhã (08:30)',
                    'Quarta-feira antes do Culto (18:30)',
                    'Sábado à Tarde',
                    'Combinar com o Pastor',
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBaptismShift(opt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between gap-2 cursor-pointer ${
                        baptismShift === opt
                          ? 'bg-cyan-50 border-[#082f38] text-[#082f38]'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {baptismShift === opt && <Check size={14} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Alguma dúvida ou observação para o Pastor? (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={baptismTestimony}
                  onChange={(e) => setBaptismTestimony(e.target.value)}
                  placeholder="Conte brevemente sobre sua decisão ou dúvida..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:border-[#082f38] outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBaptismModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  <HeartHandshake size={16} />
                  <span>Confirmar "Quero me Batizar"</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Inscrição em Curso (Teologia / Discipulado) */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setSelectedCourseModal(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#082f38] text-amber-300 flex items-center justify-center shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                    {selectedCourseModal.scheduleLabel}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {selectedCourseModal.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    Professor: {selectedCourseModal.teacher}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmCourseEnrollment} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Nome Completo do Aluno *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#082f38] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  WhatsApp para Material & Avisos da Turma
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="(22) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#082f38] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Ex: Desejo iniciar na próxima aula..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:border-[#082f38] outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedCourseModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-amber-300 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  <GraduationCap size={16} />
                  <span>Confirmar Matrícula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Contato Pastoral Direcionado ao Pr. Adenilson Freitas */}
      <PastoralRequestModal
        isOpen={adenilsonModalOpen}
        onClose={() => setAdenilsonModalOpen(false)}
        memberFullName={memberFullName}
        initialTopicId="Apoio Familiar & Diaconal"
        initialSubject="Dúvida / Orientação sobre o Curso de Teologia (Pr. Adenilson Freitas)"
        onSuccess={() => {
          showToast('Solicitação enviada e direcionada ao Pr. Adenilson Freitas!');
        }}
      />
    </div>
  );
};
