export interface WorshipItem {
  day: string;
  time: string;
  title: string;
  tag?: string;
  highlight?: boolean;
}

export interface ChurchRequestItem {
  id: string;
  subject: string;
  type: string;
  subCategory?: string;
  requester: string;
  createdAt: string;
  status: 'Atendido' | 'Em Análise' | 'Pendente';
  details?: string;
  phone?: string;
  urgency?: 'Normal' | 'Urgente';
  preferredShift?: string;
  privacyLevel?: 'Pastores' | 'Intercessão';
  assignedPastor?: string;
  routingMode?: 'Atendimento Direto' | 'Direcionado';
  pastorNotified?: boolean;
}

export interface MemberEventItem {
  id: string;
  title: string;
  category: 'Retiro' | 'Conferência' | 'Culto Especial' | 'Vigília' | 'Curso';
  date: string;
  time: string;
  location: string;
  description: string;
  targetAudience: string;
  registeredCount: number;
  capacity?: number;
  directLink?: string;
  bannerGrad: string;
  badgeText?: string;
}

export interface ChurchNewsItem {
  id: string;
  tag: string;
  title: string;
  dateLabel: string;
  summary: string;
  actionLabel: string;
  actionType: 'teologia' | 'atendimento' | 'instagram' | 'batismo';
  highlightColor: string;
}

export interface MemberCourseItem {
  id: string;
  title: string;
  teacher: string;
  scheduleLabel: string;
  totalLessons: number;
  description: string;
  badge: string;
  featured?: boolean;
  modules: string[];
}

export interface BaptismInstructionStep {
  stepNumber: string;
  title: string;
  description: string;
  highlight: string;
}

export const STORAGE_REQUESTS_KEY = 'manancial_church_requests';
export const STORAGE_COURSES_KEY = 'manancial_church_courses';
export const STORAGE_CONFIRMED_EVENTS_KEY = 'manancial_member_confirmed_events';
export const STORAGE_MEMBER_CHECKINS_KEY = 'manancial_member_service_checkins';
export const STORAGE_BAPTISM_INTENT_KEY = 'manancial_member_baptism_intents';
export const INSTAGRAM_URL = 'https://www.instagram.com/manancialsaopedro/';
export const CHURCH_PIX_KEY = '34.868.191/0001-20';
export const CHURCH_PIX_NAME = 'Comunidade Evangélica Manancial São Pedro';

export const DEFAULT_SCHEDULES: WorshipItem[] = [
  { day: 'Domingo', time: '09:30', title: 'Culto da Família & Santa Ceia', tag: 'Manhã de Ensino' },
  { day: 'Domingo', time: '18:00', title: 'Culto de Celebração & Louvor', tag: 'Culto Principal' },
  {
    day: 'Terça-feira',
    time: '19:30',
    title: 'Curso de Teologia — Pr. Adenilson Freitas',
    tag: 'Formação Teológica',
    highlight: true,
  },
  { day: 'Quarta-feira', time: '19:30', title: 'Culto da Palavra & Oração', tag: 'Meio de Semana' },
  { day: 'Sábado', time: '19:00', title: 'Culto de Jovens & Comunhão', tag: 'Juventude' },
];

export const BAPTISM_INSTRUCTIONS_STEPS: BaptismInstructionStep[] = [
  {
    stepNumber: '01',
    title: 'Decisão de Fé & Inscrição ("Quero me Batizar")',
    description:
      'O batismo nas águas é uma ordenança de Jesus para todos que creram Nele como Único e Suficiente Salvador. Manifeste seu desejo aqui pelo aplicativo para iniciarmos seu acompanhamento.',
    highlight: 'Inscrição aberta todo o ano',
  },
  {
    stepNumber: '02',
    title: 'Encontros de Preparação Batismal',
    description:
      'Antes do batismo, você participará de 4 encontros bíblicos rápidos e abençoadores sobre Salvação, o significado da imersão nas águas, Santa Ceia e vida em comunhão na igreja.',
    highlight: '4 lições preparatórias',
  },
  {
    stepNumber: '03',
    title: 'Conversa e Oração com o Pastor',
    description:
      'Nossa equipe pastoral fará um atendimento acolhedor para ouvir seu testemunho, tirar todas as suas dúvidas e orar por esse novo ciclo espiritual na sua vida.',
    highlight: 'Acompanhamento pastoral direto',
  },
  {
    stepNumber: '04',
    title: 'Orientações Práticas para o Dia do Batismo',
    description:
      'No dia da celebração, traga uma toalha, uma muda de roupa seca e roupas discretas/escuras para entrar no tanque batismal (a igreja também auxilia com as vestes batismais). Convide toda a sua família!',
    highlight: 'Festa para toda a família',
  },
];

export const UPCOMING_CHURCH_EVENTS: MemberEventItem[] = [
  {
    id: 'ev-acampamento',
    title: 'Acampamento & Gincana Manancial (Temporada 25:14)',
    category: 'Retiro',
    date: '05 a 09 de Fevereiro de 2027',
    time: 'Saída às 06:00',
    location: 'Estância São Pedro - SP',
    description:
      'Grande retiro espiritual com gincana bíblica entre as tribos, cultos poderosos, comunhão e painel em tempo real.',
    targetAudience: 'Toda a Igreja & Juventude',
    registeredCount: 148,
    capacity: 200,
    directLink: '/membro/home',
    bannerGrad: 'from-amber-500 via-orange-600 to-amber-700',
    badgeText: 'Inscrições Abertas',
  },
  {
    id: 'ev-vigilia',
    title: 'Vigília Rompendo em Fé & Clamor pelas Famílias',
    category: 'Vigília',
    date: 'Última Sexta do Mês',
    time: '23:00 às 04:30',
    location: 'Templo Sede Manancial São Pedro',
    description:
      'Noite especial de adoração, intercessão profética pelas famílias e renovo espiritual com toda a liderança pastoral.',
    targetAudience: 'Membros, Obreiros e Visitantes',
    registeredCount: 85,
    bannerGrad: 'from-[#062127] via-[#082f38] to-[#0e4b57]',
    badgeText: 'Entrada Franca',
  },
  {
    id: 'ev-batismo',
    title: 'Culto Especial de Celebração & Batismo nas Águas',
    category: 'Culto Especial',
    date: 'Próximo Mês • Domingo',
    time: '18:00',
    location: 'Templo Sede Manancial (Tanque Batismal)',
    description:
      'Festa espiritual celebrando a pública confissão de fé dos irmãos que concluíram a classe de batismo.',
    targetAudience: 'Toda a Igreja e Familiares',
    registeredCount: 32,
    bannerGrad: 'from-cyan-900 via-teal-800 to-emerald-900',
    badgeText: 'Celebração Especial',
  },
  {
    id: 'ev-conferencia',
    title: 'Conferência Manancial: Geração de Impacto',
    category: 'Conferência',
    date: '18 e 19 de Abril',
    time: '19:30',
    location: 'Auditório Principal Manancial São Pedro',
    description:
      'Dois dias de imersão na Palavra, louvor e despertamento vocacional para jovens, casais e líderes.',
    targetAudience: 'Toda a Igreja',
    registeredCount: 120,
    capacity: 250,
    bannerGrad: 'from-indigo-900 via-slate-900 to-cyan-950',
    badgeText: 'Vagas Limitadas',
  },
];

export const CHURCH_NEWS_FEED: ChurchNewsItem[] = [
  {
    id: 'news-teologia',
    tag: 'Ensino & Palavra',
    title: 'Curso de Teologia às Terças-feiras com Pr. Adenilson Freitas',
    dateLabel: 'Toda Terça-feira às 19:30',
    summary:
      'As aulas de Teologia Bíblica e Sistemática acontecem presencialmente toda terça-feira sob ministração do Pr. Adenilson Freitas. Garanta sua vaga!',
    actionLabel: 'Acessar Curso de Teologia',
    actionType: 'teologia',
    highlightColor: 'border-amber-300 bg-amber-50/70 text-amber-950',
  },
  {
    id: 'news-batismo',
    tag: 'Batismo nas Águas',
    title: 'Quer se batizar? Veja as instruções e faça sua inscrição',
    dateLabel: 'Preparação Batismal Aberta',
    summary:
      'Deseja dar o passo de fé do Batismo nas Águas? Confira todas as instruções, como funcionam as aulas preparatórias e manifeste sua decisão pelo app.',
    actionLabel: 'Quero me Batizar / Ver Instruções',
    actionType: 'batismo',
    highlightColor: 'border-emerald-300 bg-emerald-50/70 text-emerald-950',
  },
  {
    id: 'news-pastoral',
    tag: 'Cuidado Pastoral',
    title: 'Atendimento Pastoral Direto ou Direcionado pela Liderança',
    dateLabel: 'Canal Prioritário Ativo',
    summary:
      'Ao solicitar atendimento pastoral pelo app, o Pastor recebe a notificação na hora e pode atender você diretamente ou direcionar para outro pastor da equipe.',
    actionLabel: 'Solicitar Atendimento Pastoral',
    actionType: 'atendimento',
    highlightColor: 'border-cyan-300 bg-cyan-50/70 text-cyan-950',
  },
  {
    id: 'news-instagram',
    tag: 'Rede Social Oficial',
    title: 'Siga @manancialsaopedro no Instagram',
    dateLabel: 'Fotos, Reels e Avisos Diários',
    summary:
      'Fique conectado com os resumos dos cultos, cortes de pregações, fotos dos eventos e comunicados em tempo real no nosso Instagram oficial.',
    actionLabel: 'Abrir @manancialsaopedro',
    actionType: 'instagram',
    highlightColor: 'border-pink-300 bg-pink-50/70 text-pink-950',
  },
];

export const INITIAL_SEED_REQUESTS: ChurchRequestItem[] = [
  {
    id: '1',
    subject: 'Aconselhamento e Oração Familiar',
    type: 'Atendimento Pastoral',
    subCategory: 'Gabinete & Aconselhamento',
    requester: 'Érika Cristina Lacerda Laudino',
    createdAt: '04/07/2026',
    status: 'Em Análise',
    details: 'Orientação pastoral para alinhamento familiar e oração.',
    urgency: 'Normal',
    privacyLevel: 'Pastores',
    assignedPastor: 'Pastor Titular (Atendimento Direto)',
    routingMode: 'Atendimento Direto',
    pastorNotified: true,
  },
  {
    id: '2',
    subject: 'Acompanhamento de Estudos & Discipulado',
    type: 'Atendimento Pastoral',
    subCategory: 'Orientação Espiritual & Teológica',
    requester: 'Fernando Luiz Laudino Filho',
    createdAt: '08/07/2026',
    status: 'Atendido',
    details: 'Direcionamento espiritual e acompanhamento de estudos bíblicos.',
    urgency: 'Normal',
    privacyLevel: 'Pastores',
    assignedPastor: 'Pr. Adenilson Freitas',
    routingMode: 'Direcionado',
    pastorNotified: true,
  },
  {
    id: '3',
    subject: 'Pedido de oração e visita por saúde familiar',
    type: 'Atendimento Pastoral',
    subCategory: 'Oração & Visita Pastoral',
    requester: 'Marcos Vinícius de Souza',
    createdAt: '12/07/2026',
    status: 'Pendente',
    details: 'Solicitação de oração e visita domiciliar com a família.',
    urgency: 'Normal',
    privacyLevel: 'Pastores',
    assignedPastor: 'Pastor Titular (Em Triagem / Direcionamento)',
    routingMode: 'Atendimento Direto',
    pastorNotified: true,
  },
];

export const PASTORAL_TOPICS = [
  {
    id: 'Gabinete & Aconselhamento',
    label: 'Gabinete & Aconselhamento',
    desc: 'Conversa individual ou de casal com total sigilo pastoral.',
    suggestions: [
      'Aconselhamento pastoral individual',
      'Orientação para casamento e família',
      'Direcionamento espiritual e ministerial',
      'Quero conversar sobre o Batismo nas Águas',
    ],
  },
  {
    id: 'Oração & Intercessão',
    label: 'Oração & Clamor no Altar',
    desc: 'Motivos de saúde, família, portas abertas ou gratidão.',
    suggestions: [
      'Oração por saúde e recuperação familiar',
      'Clamor por paz e restauração no lar',
      'Oração por causas profissionais e finanças',
      'Testemunho e gratidão por bênção alcançada',
    ],
  },
  {
    id: 'Visita Pastoral',
    label: 'Visita no Lar ou Hospital',
    desc: 'Presença de pastores para oração na residência ou hospital.',
    suggestions: [
      'Visita pastoral e oração na residência',
      'Visita hospitalar de urgência',
      'Consagração de novo lar / endereço',
      'Visita a familiar acamado ou idoso',
    ],
  },
  {
    id: 'Apoio Familiar & Diaconal',
    label: 'Apoio Familiar & Cuidado Social',
    desc: 'Acolhimento fraterno, escuta e suporte emergencial.',
    suggestions: [
      'Acolhimento pastoral para família',
      'Solicitação de apoio diaconal / cesta básica',
      'Acompanhamento de novo membro na igreja',
      'Orientação para ingresso no Curso de Teologia',
    ],
  },
];

export const PASTOR_ROUTING_OPTIONS = [
  'Pastor Titular (Atende direto ou direciona para equipe)',
  'Pr. Adenilson Freitas (Ensino, Teologia & Aconselhamento)',
  'Equipe de Pastores Auxiliares & Cuidado Familiar',
];

export const AVAILABLE_CHURCH_COURSES: MemberCourseItem[] = [
  {
    id: 'curso-teologia',
    title: 'Curso de Teologia',
    teacher: 'Pr. Adenilson Freitas',
    scheduleLabel: 'Terças-feiras às 19:30 • Presencial',
    totalLessons: 12,
    description:
      'Formação teológica completa abordando Bibliologia, Teologia Sistemática, História da Igreja, Hermenêutica e Vida Ministerial sob condução do Pr. Adenilson Freitas.',
    badge: 'Destaque • Terças-feiras',
    featured: true,
    modules: [
      'Módulo 1: Introdução à Teologia & Revelação Bíblica',
      'Módulo 2: Doutrina de Deus, Cristo e Espírito Santo',
      'Módulo 3: Hermenêutica Bíblica & Exposição da Palavra',
      'Módulo 4: Eclesiologia, Missões & Liderança Cristã',
    ],
  },
  {
    id: 'curso-batismo',
    title: 'Batismo nas Águas',
    teacher: 'Pr. Carlos & Equipe Pastoral',
    scheduleLabel: 'Domingos às 08:30 • 4 Lições Preparatórias',
    totalLessons: 4,
    description:
      'Preparação doutrinária fundamental para novos irmãos que desejam dar o passo de fé e pública confissão nas águas batismais.',
    badge: 'Preparação Batismal',
    modules: [
      'Lição 1: O Plano da Salvação e Novo Nascimento',
      'Lição 2: O Significado Bíblico do Batismo por Imersão',
      'Lição 3: A Ceia do Senhor e Comunhão no Corpo de Cristo',
      'Lição 4: Compromisso Cristão e Família Manancial',
    ],
  },
  {
    id: 'curso-novos-convertidos',
    title: 'Novos Convertidos',
    teacher: 'Líder Amanda & Equipe de Consolidação',
    scheduleLabel: 'Quartas-feiras às 18:30 • 6 Lições',
    totalLessons: 6,
    description:
      'Primeiros passos na caminhada cristã: vida de oração, leitura diária da Bíblia, vitória sobre provações e integração na igreja.',
    badge: '6 Encontros',
    modules: [
      'Lição 1: Certeza da Salvação em Cristo',
      'Lição 2: Como Orar e Ouvir a Voz de Deus',
      'Lição 3: A Importância da Palavra no Dia a Dia',
    ],
  },
  {
    id: 'curso-lideres',
    title: 'Academia de Líderes',
    teacher: 'Pr. Caio Augusto & Liderança',
    scheduleLabel: 'Sábados (Quinzenal) às 17:00 • 8 Lições',
    totalLessons: 8,
    description:
      'Capacitação prática para obreiros, músicos e voluntários que desejam servir com excelência nos ministérios da igreja.',
    badge: 'Formação Ministerial',
    modules: [
      'Lição 1: Caráter e Chamado do Obreiro Cristão',
      'Lição 2: Cuidado de Pessoas e Discipulado Prático',
      'Lição 3: Excelência no Serviço ao Reino',
    ],
  },
];

// Helpers de leitura e gravação sincronizados
export function getStoredPastoralRequests(): ChurchRequestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(INITIAL_SEED_REQUESTS));
    return INITIAL_SEED_REQUESTS;
  } catch (e) {
    return INITIAL_SEED_REQUESTS;
  }
}

export function saveStoredPastoralRequests(list: ChurchRequestItem[]): void {
  try {
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('manancial-requests-updated'));
  } catch (e) {
    console.warn('Erro ao salvar solicitações pastorais:', e);
  }
}

export function getChurchSchedules(): WorshipItem[] {
  try {
    const saved = localStorage.getItem('manancial_dev_church_info');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.schedules && parsed.schedules.length > 0) {
        const mapped: WorshipItem[] = parsed.schedules.map((s: any, idx: number) => ({
          day: s.dayOfWeek,
          time: s.time,
          title: (s.description || 'Culto da Igreja').replace(/& Células|\/ Encontro de Células/gi, ''),
          tag: idx === 0 ? 'Reunião da Família' : 'Culto Presencial',
          highlight:
            (s.description || '').toLowerCase().includes('teologia') ||
            (s.description || '').toLowerCase().includes('adenilson'),
        }));
        const hasTheology = mapped.some(
          (m) =>
            m.title.toLowerCase().includes('teologia') ||
            m.title.toLowerCase().includes('adenilson')
        );
        if (!hasTheology) {
          mapped.splice(2, 0, {
            day: 'Terça-feira',
            time: '19:30',
            title: 'Curso de Teologia — Pr. Adenilson Freitas',
            tag: 'Formação Teológica',
            highlight: true,
          });
        }
        return mapped;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_SCHEDULES;
}

export function getConfirmedEventIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIRMED_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveConfirmedEventIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_CONFIRMED_EVENTS_KEY, JSON.stringify(ids));
  } catch (e) {
    // ignore
  }
}
