import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Church,
  Clock,
  Compass,
  Eye,
  Flame,
  GraduationCap,
  Heart,
  HeartHandshake,
  History,
  Instagram,
  MapPin,
  Menu,
  Moon,
  Plus,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Sunrise,
  Tent,
  Users,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import { ManancialWaterCanvas } from '../../components/splash/ManancialWaterCanvas';
import { ManancialEmblem } from '../../components/splash/ManancialLogo';
import { useWeeklyServices, WEEKDAY_LABELS } from '../Church/data/churchWeeklyServices';
import { createChurchRequest } from '../Church/data/churchModulesApi';
import { AVAILABLE_CHURCH_COURSES, INSTAGRAM_URL } from '../Church/data/churchMemberData';
import {
  ChurchEventRecord,
  ChurchSitePhotoRecord,
  DEFAULT_SITE_EVENTS,
  DEFAULT_SITE_PHOTOS,
  SITE_GALLERY_SECTIONS,
  SiteGallerySectionKey,
  fetchChurchSiteEvents,
  fetchChurchSitePhotos,
} from '../Church/data/churchSiteContentApi';
import {
  SitePhotoGallerySection,
  SitePhotoUploadModal,
} from './components/SitePhotoGalleryModal';

type LeadTopicType =
  | 'visita_igreja'
  | 'grupo_jovens'
  | 'ministerio_familia'
  | 'cursos_discipulado'
  | 'mercado_solidario'
  | 'acamp_manancial';

interface EventShowcasePillar {
  key: SiteGallerySectionKey;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  scheduleHint: string;
  highlights: string[];
  accentColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultImage: string;
  ctaLabel: string;
  ctaRoute?: string;
}

const EVENT_PILLARS: EventShowcasePillar[] = [
  {
    key: 'vigilia',
    title: 'Vigília',
    subtitle: 'Clamor Profético & Avivamento no Altar',
    badge: 'Intercessão & Busca',
    description:
      'Nossas vigílias reúnem toda a igreja em madrugadas intensas de oração pelas famílias, adoração espontânea, estudo da Palavra e renovo do Espírito Santo.',
    scheduleHint: 'Última sexta-feira do mês • Templo Sede',
    highlights: [
      'Clamor ininterrupto pelas famílias e pela nossa cidade',
      'Louvor congregacional profundo e ministração da Palavra',
      'Momento de oração individual e imposição de mãos no altar',
    ],
    accentColor: 'from-indigo-500 to-cyan-500',
    icon: Flame,
    defaultImage: '/assets/images/manancial_church_community_1794615448217.jpg',
    ctaLabel: 'Quero Participar da Próxima Vigília',
  },
  {
    key: 'manha-com-deus',
    title: 'Manhã com Deus',
    subtitle: 'Consagração Matinal, Palavra & Comunhão',
    badge: 'Altar & Comunhão',
    description:
      'Manhãs especiais separadas para buscar a face do Senhor logo ao amanhecer, celebrar a Santa Ceia, aprender as Escrituras e compartilhar a mesa em família.',
    scheduleHint: 'Domingos especiais às 08:00 • Templo Sede',
    highlights: [
      'Oração matinal e consagração das primícias da semana',
      'Ensino bíblico edificante para todas as gerações',
      'Café e comunhão fraterna entre membros e visitantes',
    ],
    accentColor: 'from-cyan-500 to-teal-400',
    icon: Sunrise,
    defaultImage: '/assets/images/manancial_church_community_1794615448217.jpg',
    ctaLabel: 'Estar na Próxima Manhã com Deus',
  },
  {
    key: 'evangelismo',
    title: 'Evangelismo',
    subtitle: 'Ide & Pregai o Evangelho a Toda Criatura',
    badge: 'Missão & Ruas',
    description:
      'A igreja fora das quatro paredes: saímos às praças, bairros e lares de São Pedro levando a mensagem da Cruz, oração, abraço acolhedor e apoio social.',
    scheduleHint: 'Mobilizações mensais • Praças e Bairros de São Pedro',
    highlights: [
      'Ações evangelísticas nas praças com louvor e palavra de esperança',
      'Visitação nos lares e oração pelas famílias da cidade',
      'Integração direta com o cuidado social e acolhimento de vidas',
    ],
    accentColor: 'from-emerald-500 to-teal-500',
    icon: Compass,
    defaultImage: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    ctaLabel: 'Conhecer Ações de Evangelismo',
  },
  {
    key: 'acamp-manancial',
    title: 'Acamp Manancial',
    subtitle: 'Retiro Espiritual & Gincana das Tribos (Salmos 25:14)',
    badge: 'Temporada 2027 • 05 a 09 Fev',
    description:
      'Cinco dias inesquecíveis de imersão espiritual durante o feriado de Carnaval: cultos poderosos, gincana bíblica entre as tribos, batismos, lazer e comunhão.',
    scheduleHint: '05 a 09 de Fevereiro de 2027 • Estância São Pedro - SP',
    highlights: [
      'Ministrações transformadoras, fogueira e adoração ao ar livre',
      'Gincana Bíblica 25:14 unindo jovens, adultos e famílias',
      'Estrutura completa de lazer, refeições inclusas e segurança familiar',
    ],
    accentColor: 'from-amber-500 to-orange-500',
    icon: Tent,
    defaultImage: '/acampamento-2027.jpg',
    ctaLabel: 'Ver Detalhes do Acamp Manancial',
    ctaRoute: '/acampamento/informacoes',
  },
  {
    key: 'dia-da-familia',
    title: 'Dia da Família',
    subtitle: 'Celebrando a Aliança de Deus em Nossos Lares',
    badge: 'Festa das Gerações',
    description:
      'Um dia inteiro preparado para honrar os lares da nossa igreja e receber famílias convidadas com louvor, palavra para casais e pais, recreação infantil e almoço.',
    scheduleHint: 'Celebração Especial • Templo & Espaço Manancial',
    highlights: [
      'Palavra especial para fortalecimento de casamentos e pais e filhos',
      'Programação recreativa completa com o Ministério Infantil',
      'Almoço de comunhão e integração de novas famílias visitantes',
    ],
    accentColor: 'from-rose-500 to-pink-500',
    icon: Heart,
    defaultImage: '/assets/images/manancial_church_community_1794615448217.jpg',
    ctaLabel: 'Participar com Minha Família',
  },
];

const HISTORY_TIMELINE = [
  {
    year: 'O Chamado & Raízes',
    title: 'Um Sonho Nascido em Oração',
    description:
      'A Manancial nasceu do coração de Deus através de reuniões familiares de oração em São Pedro - SP, com o desejo ardente de ser uma fonte de águas vivas para restaurar vidas e famílias.',
  },
  {
    year: '2018 • Fundação Oficial',
    title: 'Plantação da Igreja Família Manancial',
    description:
      'Em julho de 2018, a Comunidade Evangélica Manancial estabeleceu suas portas abertas no coração de São Pedro, firmada no ensino bíblico, no acolhimento fraterno e na adoração genuína.',
  },
  {
    year: 'Expansão dos Ministérios',
    title: 'Jovens, Famílias, Crianças & Ação Social',
    description:
      'Com o crescimento da igreja, floresceram o Grupo de Jovens, o Ministério da Família (Curso de Casais e Curso de Pais), o Ministério Infantil, o Curso de Teologia e o Mercado Solidário.',
  },
  {
    year: 'Hoje & Futuro',
    title: 'Uma Família que Acolhe, Ensina e Transforma',
    description:
      'Seguimos avançando com nossos cultos semanais, o Acamp Manancial (Salmos 25:14), vigílias e missões urbanas, preparando uma geração apaixonada por Jesus.',
  },
];

const formatEventDateBr = (isoDate: string) => {
  if (!isoDate) return 'Data a confirmar';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  const monthIdx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${d} de ${months[monthIdx]} de ${y}`;
};

export const ChurchLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, user } = useAppStore();
  const { canAccessPastoral, activeRole } = useCurrentRole();

  const canManageSite =
    canAccessPastoral ||
    activeRole === 'admin' ||
    activeRole === 'primeiro_pastor' ||
    activeRole === 'segundo_pastor' ||
    activeRole === 'equipe_pastoral';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeEventPillar, setActiveEventPillar] = useState<SiteGallerySectionKey>('acamp-manancial');
  const [upcomingCategoryFilter, setUpcomingCategoryFilter] = useState<string>('Todos');

  // Dados sincronizados com o Portal Gerencial e Supabase
  const { services: weeklyServices, loading: servicesLoading } = useWeeklyServices();
  const [siteEvents, setSiteEvents] = useState<ChurchEventRecord[]>(DEFAULT_SITE_EVENTS);
  const [sitePhotos, setSitePhotos] = useState<ChurchSitePhotoRecord[]>(DEFAULT_SITE_PHOTOS);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Modal de Upload / Gestão de Fotos direto na Landing Page
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetSection, setUploadTargetSection] = useState<SiteGallerySectionKey>('quem-somos');
  const [uploadTargetEventId, setUploadTargetEventId] = useState<string | undefined>(undefined);

  // Formulário de Boas-Vindas / Interesse (Salva direto no Portal Pastoral sem expor WhatsApp)
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadTopic, setLeadTopic] = useState<LeadTopicType>('visita_igreja');
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSyncWarning, setLeadSyncWarning] = useState<string | null>(null);

  const heroTiltRef = useRef<HTMLDivElement | null>(null);
  const heroSheenRef = useRef<HTMLDivElement | null>(null);

  const loadSiteContent = async () => {
    setLoadingEvents(true);
    try {
      const [evRes, phRes] = await Promise.all([
        fetchChurchSiteEvents(),
        fetchChurchSitePhotos(),
      ]);
      setSiteEvents(evRes.data);
      setSitePhotos(phRes.data);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadSiteContent();
    const onEventsUpdated = () => {
      fetchChurchSiteEvents().then((res) => setSiteEvents(res.data));
    };
    const onPhotosUpdated = () => {
      fetchChurchSitePhotos().then((res) => setSitePhotos(res.data));
    };
    window.addEventListener('manancial-site-events-updated', onEventsUpdated);
    window.addEventListener('manancial-site-photos-updated', onPhotosUpdated);
    return () => {
      window.removeEventListener('manancial-site-events-updated', onEventsUpdated);
      window.removeEventListener('manancial-site-photos-updated', onPhotosUpdated);
    };
  }, []);

  const handleHeroTilt = (rx: number, ry: number, normX: number, normY: number) => {
    if (heroTiltRef.current) {
      const tx = (ry * 10).toFixed(2);
      const ty = (-rx * 8).toFixed(2);
      heroTiltRef.current.style.transform = `perspective(950px) translate3d(${tx}px, ${ty}px, 0) rotateX(${(rx * 9).toFixed(2)}deg) rotateY(${(ry * 9).toFixed(2)}deg)`;
    }
    if (heroSheenRef.current) {
      const px = Math.round(normX * 100);
      const py = Math.round(normY * 100);
      heroSheenRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(165, 243, 252, 0.32), transparent 58%)`;
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openPhotoManager = (sectionKey: SiteGallerySectionKey, eventId?: string) => {
    setUploadTargetSection(sectionKey);
    setUploadTargetEventId(eventId);
    setUploadModalOpen(true);
  };

  const upcomingEvents = useMemo(
    () => siteEvents.filter((ev) => ev.isUpcoming),
    [siteEvents]
  );

  const pastEvents = useMemo(
    () => siteEvents.filter((ev) => !ev.isUpcoming),
    [siteEvents]
  );

  const filteredUpcomingEvents = useMemo(() => {
    if (upcomingCategoryFilter === 'Todos') return upcomingEvents;
    return upcomingEvents.filter(
      (ev) => ev.category.toLowerCase() === upcomingCategoryFilter.toLowerCase()
    );
  }, [upcomingEvents, upcomingCategoryFilter]);

  const currentPillar = useMemo(
    () => EVENT_PILLARS.find((p) => p.key === activeEventPillar) || EVENT_PILLARS[0],
    [activeEventPillar]
  );

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim() || isSubmittingLead) return;

    setIsSubmittingLead(true);
    setLeadSyncWarning(null);
    const trimmedName = leadName.trim();
    const trimmedPhone = leadPhone.trim();

    const topicLabels: Record<LeadTopicType, { subject: string; subCategory: string; type: string }> = {
      visita_igreja: {
        type: 'Visitante / Oração',
        subCategory: 'Quero Visitar a Igreja',
        subject: 'Planejando Visita à Igreja / Pedido de Oração',
      },
      grupo_jovens: {
        type: 'Ministérios',
        subCategory: 'Grupo Jovens',
        subject: 'Interesse no Grupo de Jovens Manancial',
      },
      ministerio_familia: {
        type: 'Ministérios',
        subCategory: 'Ministério da Família (Curso de Casais / Pais)',
        subject: 'Inscrição / Interesse no Curso de Casais ou Curso de Pais',
      },
      cursos_discipulado: {
        type: 'Ensino & Discipulado',
        subCategory: 'Nossos Cursos (Teologia / Batismo)',
        subject: 'Interesse nos Cursos Bíblicos e Batismo',
      },
      mercado_solidario: {
        type: 'Assistência Social',
        subCategory: 'Mercado Solidário',
        subject: 'Voluntariado / Apoio ao Mercado Solidário',
      },
      acamp_manancial: {
        type: 'Acampamento',
        subCategory: 'Acamp Manancial 2027',
        subject: 'Interesse no Acamp Manancial 2027',
      },
    };

    const meta = topicLabels[leadTopic];

    try {
      const result = await createChurchRequest({
        source: leadTopic === 'acamp_manancial' ? 'CAMP_LEAD' : 'LANDING_PAGE',
        type: meta.type,
        subCategory: meta.subCategory,
        subject: meta.subject,
        requester: trimmedName,
        phone: trimmedPhone,
        email: leadEmail.trim() || undefined,
        details:
          leadMessage.trim() ||
          `Mensagem enviada pelo site oficial da Igreja Manancial (${meta.subCategory}).`,
        urgency: 'Normal',
        privacyLevel: 'Pastores',
        status: 'Pendente',
      });

      if (!result.syncedRemote && result.error) {
        setLeadSyncWarning(
          'Seu registro foi salvo com segurança neste dispositivo e será sincronizado com a secretaria pastoral.'
        );
      }

      setLeadSubmitted(true);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div
      data-testid="landing-page"
      className={`min-h-[100dvh] overflow-x-clip transition-colors duration-700 ${
        isDarkMode ? 'bg-[#070B0E] text-[#F1F6F8]' : 'bg-[#F4FAFC] text-[#082F38]'
      }`}
    >
      {/* =========================================================================
          HEADER FIXO INSTITUCIONAL
         ========================================================================= */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
          isDarkMode
            ? 'border-white/10 bg-[#070B0E]/88 text-white'
            : 'border-[#082F38]/10 bg-white/90 text-[#082F38] shadow-2xs'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-2 sm:gap-5 px-3.5 sm:px-8">
          {/* Logo e Nome */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex min-w-0 items-center gap-2.5 text-left font-display font-bold tracking-tight text-base sm:text-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#082F38] via-[#0E7490] to-[#06B6D4] p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-black">M</span>
            </div>
            <div className="truncate">
              <span className="block leading-none font-extrabold">Manancial</span>
              <span
                className={`block text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
                  isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
                }`}
              >
                São Pedro • SP
              </span>
            </div>
          </button>

          {/* Navegação Principal Desktop */}
          <nav
            aria-label="Navegação principal"
            className={`hidden xl:flex items-center gap-5 text-[11px] font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-[#A6C2CC]' : 'text-[#3B5B66]'
            }`}
          >
            <button
              type="button"
              onClick={() => scrollToSection('identidade')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              A Igreja
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('quem-somos')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Quem Somos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('ministerios')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Jovens &amp; Família
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('infantil-social')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Infantil &amp; Social
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('programacao')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Programação
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('cursos')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Cursos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('nossos-eventos')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Eventos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('proximos-eventos')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Agenda
            </button>
          </nav>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {canManageSite && (
              <button
                type="button"
                onClick={() => openPhotoManager('quem-somos')}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'border-amber-400/35 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                    : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
                title="Gerenciar fotos e galerias do site"
              >
                <Camera size={14} />
                <span>Gerenciar Fotos</span>
              </button>
            )}

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Oficial da Igreja Manancial"
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isDarkMode
                  ? 'border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20'
                  : 'border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <Instagram size={16} />
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar aparência"
              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                isDarkMode
                  ? 'border-white/10 bg-white/5 text-amber-300 hover:bg-white/10'
                  : 'border-[#082F38]/12 bg-white/80 text-[#082F38] hover:bg-white shadow-2xs'
              }`}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              type="button"
              onClick={() => navigate('/visitante')}
              className={`hidden md:inline-flex min-h-[38px] items-center gap-1.5 cursor-pointer whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold border transition-all active:scale-95 ${
                isDarkMode
                  ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                  : 'border-cyan-300 bg-cyan-50 text-cyan-900 hover:bg-cyan-100'
              }`}
            >
              <span>Sou Visitante</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(user ? '/igreja' : '/login')}
              className={`min-h-[36px] sm:min-h-[38px] cursor-pointer whitespace-nowrap rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-all active:scale-95 shadow-md ${
                isDarkMode
                  ? 'bg-[#32B7D9] text-[#051217] hover:bg-[#4FD1E8] shadow-cyan-500/20'
                  : 'bg-[#0891B2] text-white hover:bg-[#0E7490] shadow-cyan-900/15'
              }`}
            >
              {canManageSite ? 'Portal Gerencial' : 'Área de Membros'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border xl:hidden ${
                isDarkMode ? 'border-white/15 text-white' : 'border-[#082F38]/15 text-[#082F38]'
              }`}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <nav
            aria-label="Menu móvel"
            className={`border-t px-5 py-5 xl:hidden flex flex-col gap-2.5 text-sm font-semibold ${
              isDarkMode ? 'border-white/10 bg-[#080E12] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('identidade')}
              >
                Visão, Missão &amp; Valores
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('quem-somos')}
              >
                Quem Somos Nós
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('ministerios')}
              >
                Grupo Jovens &amp; Família
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('infantil-social')}
              >
                Infantil &amp; Mercado Solidário
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('programacao')}
              >
                Nossa Programação
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('cursos')}
              >
                Nossos Cursos
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('nossos-eventos')}
              >
                Nossos Eventos
              </button>
              <button
                type="button"
                className="text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                onClick={() => scrollToSection('proximos-eventos')}
              >
                Próximos Eventos
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/visitante');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border border-cyan-500/30 text-cyan-400 text-center"
              >
                Recepção de Visitantes
              </button>
              {canManageSite && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openPhotoManager('quem-somos');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 text-center"
                >
                  Enviar Fotos do Site
                </button>
              )}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center flex items-center justify-center gap-2"
              >
                <Instagram size={14} />
                <span>Seguir @manancialsaopedro no Instagram</span>
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* =========================================================================
          HERO INSTITUCIONAL — BEM-VINDO À IGREJA FAMÍLIA MANANCIAL
         ========================================================================= */}
      <section id="topo" className="relative overflow-hidden border-b border-white/10">
        <ManancialWaterCanvas
          intensity="hero"
          isDarkMode={isDarkMode}
          onTiltChange={handleHeroTilt}
        />

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 py-16 sm:py-24 lg:py-28">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
                {/* Coluna Esquerda: Mensagem de Acolhimento e Identidade */}
                <div className="flex flex-col justify-center lg:col-span-7">
                  <div className="inline-flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase text-cyan-400">
                    <Sparkles size={14} />
                    <span>Comunidade Evangélica Manancial • São Pedro - SP</span>
                  </div>

                  <h1 className="font-display text-[clamp(2.2rem,4.3vw,3.9rem)] font-extrabold leading-[1.08] tracking-tight [text-wrap:balance]">
                    Uma família de fé, graça e águas vivas para o seu lar.
                  </h1>

                  <p
                    className={`mt-5 max-w-[60ch] text-base leading-relaxed sm:text-[17px] ${
                      isDarkMode ? 'text-[#B8CED6]' : 'text-[#3B5B66]'
                    }`}
                  >
                    Somos uma igreja apaixonada por Jesus Cristo no coração de São Pedro - SP. Um lugar
                    preparado para acolher você, edificar sua família na Palavra, discipular a nova
                    geração e servir nossa cidade com amor prático.
                  </p>

                  {/* CTAs Principais */}
                  <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => scrollToSection('programacao')}
                      className={`inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                        isDarkMode
                          ? 'bg-[#32B7D9] text-[#051217] hover:bg-[#4FD1E8] shadow-cyan-500/30'
                          : 'bg-[#0891B2] text-white hover:bg-[#0E7490] shadow-cyan-900/20'
                      }`}
                    >
                      <Clock size={16} />
                      <span>Horários dos Cultos &amp; Endereço</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/visitante')}
                      className={`inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold backdrop-blur-md transition-all active:scale-95 ${
                        isDarkMode
                          ? 'border-white/15 bg-white/[0.05] text-[#E4F0F4] hover:bg-white/[0.1]'
                          : 'border-[#082F38]/15 bg-white/85 text-[#082F38] hover:bg-white shadow-2xs'
                      }`}
                    >
                      <Heart size={16} className="text-cyan-400" />
                      <span>Primeira Visita / Recepção</span>
                    </button>

                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      <Instagram size={17} />
                      <span>Nossas Redes Sociais →</span>
                    </a>
                  </div>

                  {/* Destaques Rápidos de Localização e Cultos */}
                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Onde Estamos</div>
                        <div className="text-[11px] text-slate-400">Av. Ângelo Nogueira, 45 • Centro</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                        <Church size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Culto da Família</div>
                        <div className="text-[11px] text-slate-400">Domingos às 19:00h</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <Tent size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Acamp Manancial</div>
                        <div className="text-[11px] text-slate-400">Temporada Salmos 25:14</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Card Institucional de Boas-Vindas */}
                <div className="flex items-center justify-center lg:col-span-5">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex w-full flex-col items-center justify-between rounded-3xl border p-7 sm:p-8 text-center backdrop-blur-xl ${
                      isDarkMode
                        ? 'border-white/12 bg-[#0A1116]/85 shadow-2xl'
                        : 'border-white bg-white/90 shadow-xl'
                    }`}
                  >
                    <div className="mb-5">
                      <ManancialEmblem
                        size="lg"
                        tiltRef={heroTiltRef}
                        sheenRef={heroSheenRef}
                        isDarkMode={isDarkMode}
                        layoutId="hero-static-emblem"
                      />
                    </div>

                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400">
                      Igreja Família Manancial
                    </span>
                    <p
                      className={`mt-2 text-xs sm:text-sm italic font-serif max-w-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      &ldquo;O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua
                      aliança.&rdquo; — Salmos 25:14
                    </p>

                    <div
                      className={`w-full mt-6 space-y-3 border-t pt-5 text-left text-xs ${
                        isDarkMode ? 'border-white/10' : 'border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => scrollToSection('identidade')}
                        className="w-full flex items-center justify-between gap-4 py-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        <span className="text-slate-400">Nossa Identidade</span>
                        <span className="font-bold text-cyan-400 flex items-center gap-1">
                          Visão • Missão • Valores <ChevronRight size={14} />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSection('ministerios')}
                        className="w-full flex items-center justify-between gap-4 py-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        <span className="text-slate-400">Ministérios Ativos</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          Jovens • Família • Infantil • Social <ChevronRight size={14} />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSection('proximos-eventos')}
                        className="w-full flex items-center justify-between gap-4 py-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        <span className="text-slate-400">Próximos Eventos</span>
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          {upcomingEvents.length} programações abertas <ChevronRight size={14} />
                        </span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
      </section>

      {/* =========================================================================
          SEÇÃO 1: CONHECER MAIS SOBRE A IGREJA (VISÃO, MISSÃO E VALORES)
         ========================================================================= */}
      <section id="identidade" className="mx-auto max-w-[1280px] px-5 sm:px-8 py-20 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Compass size={13} /> Conhecer Mais Sobre a Igreja
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Nossa Essência: Visão, Missão e Valores
          </h2>
          <p
            className={`mt-3 text-sm sm:text-base leading-relaxed ${
              isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
            }`}
          >
            Cremos em uma igreja bíblica, acolhedora e comprometida com a transformação espiritual e
            familiar através do Evangelho de Jesus Cristo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: VISÃO */}
          <div
            className={`rounded-3xl border p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 ${
              isDarkMode
                ? 'bg-[#0C151B]/90 border-cyan-500/30 shadow-xl'
                : 'bg-white border-cyan-200 shadow-lg'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg mb-6">
                <Eye size={26} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
                01 • Nossa Visão
              </span>
              <h3 className="text-2xl font-extrabold mt-1">Para onde caminhamos</h3>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Ser uma igreja referência em comunhão, ensino profundo da Palavra e restauração de
                lares em São Pedro e região — onde cada pessoa encontre em Cristo uma fonte
                inesgotável de vida, propósito e acolhimento familiar.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-cyan-400 flex items-center gap-2">
              <Sparkles size={14} />
              <span>Uma fonte de águas vivas para todas as gerações</span>
            </div>
          </div>

          {/* Card 2: MISSÃO */}
          <div
            className={`rounded-3xl border p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 ${
              isDarkMode
                ? 'bg-[#0C151B]/90 border-emerald-500/30 shadow-xl'
                : 'bg-white border-emerald-200 shadow-lg'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg mb-6">
                <Compass size={26} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                02 • Nossa Missão
              </span>
              <h3 className="text-2xl font-extrabold mt-1">O nosso chamado diário</h3>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Glorificar a Deus proclamando o Evangelho de Jesus Cristo, acolher cada visitante
                com amor genuíno, discipular crentes através do ensino bíblico, edificar casamentos
                e filhos e servir aos que precisam com compaixão e dignidade.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>Adorar • Acolher • Discipular • Servir</span>
            </div>
          </div>

          {/* Card 3: VALORES */}
          <div
            className={`rounded-3xl border p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 ${
              isDarkMode
                ? 'bg-[#0C151B]/90 border-amber-500/30 shadow-xl'
                : 'bg-white border-amber-200 shadow-lg'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 flex items-center justify-center shadow-lg mb-6">
                <Award size={26} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                03 • Nossos Valores
              </span>
              <h3 className="text-2xl font-extrabold mt-1">Princípios inegociáveis</h3>
              <ul
                className={`mt-4 space-y-2.5 text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fidelidade à Palavra:</strong> A Bíblia como única regra de fé e prática.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Família no Altar:</strong> Casamentos fortes, pais presentes e filhos no caminho.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Oração &amp; Espírito Santo:</strong> Vida de comunhão e dependência de Deus.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Amor Prático:</strong> Generosidade e cuidado social sem distinção.
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck size={14} />
              <span>Aliança, Santidade e Comunhão Fraterna</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 2: QUEM SOMOS NÓS & BREVE HISTÓRICO DE COMO NASCEU
         ========================================================================= */}
      <section
        id="quem-somos"
        className={`border-y py-20 sm:py-24 ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white/80'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <History size={13} /> Quem Somos Nós
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Breve Histórico: Como Nasceu a Manancial
              </h2>
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                A <strong>Igreja Família Manancial</strong> nasceu em São Pedro - SP a partir de um
                chamado pastoral claro: construir uma comunidade onde ninguém caminhe sozinho. O que
                começou em reuniões simples de oração e consagração tornou-se uma família espiritual
                vibrante, unindo gerações ao redor da Palavra de Deus.
              </p>
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Nosso nome, <strong>Manancial</strong>, reflete a promessa bíblica de um lugar de
                refrigério, cura interior e renovo contínuo nas águas do Espírito Santo — de onde
                brotam frutos para abençoar casais, jovens, crianças e toda a nossa cidade.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection('programacao')}
                  className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Conhecer Nossos Cultos
                </button>
                {canManageSite && (
                  <button
                    type="button"
                    onClick={() => openPhotoManager('quem-somos')}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                      isDarkMode
                        ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Adicionar Foto Histórica</span>
                  </button>
                )}
              </div>
            </div>

            {/* Linha do Tempo Histórica */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HISTORY_TIMELINE.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border flex flex-col justify-between ${
                    isDarkMode
                      ? 'bg-[#0C151B]/90 border-white/10'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 mb-3">
                      {item.year}
                    </span>
                    <h3 className="text-lg font-extrabold">{item.title}</h3>
                    <p
                      className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Galeria de Fotos da Seção Quem Somos */}
          <SitePhotoGallerySection
            sectionKey="quem-somos"
            title="Registros da Nossa Caminhada & Comunhão"
            subtitle="Fotos da nossa igreja, celebrações e momentos que marcam a história da Família Manancial."
            isLight={!isDarkMode}
            canManageOverride={canManageSite}
          />
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 3: NOSSO GRUPO DE JOVENS & MINISTÉRIO DA FAMÍLIA
          (CURSO DE CASAIS • CURSO DE PAIS • EVENTOS ANTERIORES)
         ========================================================================= */}
      <section id="ministerios" className="mx-auto max-w-[1280px] px-5 sm:px-8 py-20 sm:py-24 space-y-20">
        {/* 3A. NOSSO GRUPO DE JOVENS */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Flame size={13} /> Juventude Manancial
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
                Nosso Grupo de Jovens
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
                }`}
              >
                Uma geração avivada, firmada na Rocha e comprometida com santidade, comunhão
                verdadeira, louvor intenso e propósito missionário.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setLeadTopic('grupo_jovens');
                  scrollToSection('contato');
                }}
                className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
              >
                Quero Participar dos Jovens
              </button>
              {canManageSite && (
                <button
                  type="button"
                  onClick={() => openPhotoManager('grupo-jovens')}
                  className={`px-4 py-3 rounded-2xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode
                      ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Camera size={14} />
                  <span>Gerenciar Fotos dos Jovens</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-[#0C151B]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-4">
                <Flame size={22} />
              </div>
              <h3 className="text-lg font-extrabold">Cultos &amp; Encontros de Jovens</h3>
              <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Noites de adoração profunda, pregação expositiva da Palavra e rodas de conversa sobre
                os desafios reais da juventude cristã.
              </p>
            </div>

            <div
              className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-[#0C151B]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                <Users size={22} />
              </div>
              <h3 className="text-lg font-extrabold">Discipulado &amp; Comunhão</h3>
              <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Acompanhamento próximo, células jovens, descoberta de dons ministeriais (louvor,
                mídia, recepção, ensino) e amizades que edificam.
              </p>
            </div>

            <div
              className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-[#0C151B]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                <Tent size={22} />
              </div>
              <h3 className="text-lg font-extrabold">Conferências &amp; Acamp Manancial</h3>
              <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Protagonismo nas tribos da Gincana 25:14, vigílias na fogueira, evangelismos de
                impacto e conferências anuais.
              </p>
            </div>
          </div>

          <SitePhotoGallerySection
            sectionKey="grupo-jovens"
            title="Galeria do Grupo de Jovens"
            subtitle="Momentos de adoração, comunhão e eventos realizados com a nossa juventude."
            isLight={!isDarkMode}
            canManageOverride={canManageSite}
          />
        </div>

        {/* 3B. MINISTÉRIO DA FAMÍLIA (CURSO DE CASAIS • CURSO DE PAIS • EVENTOS ANTERIORES) */}
        <div className="space-y-8 pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Heart size={13} /> Lares Firmados na Rocha
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
                Ministério da Família
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
                }`}
              >
                Cremos que uma igreja forte começa em lares curados e estruturados. Acompanhamos
                casais e pais com cursos práticos, encontros de aliança e aconselhamento pastoral.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setLeadTopic('ministerio_familia');
                  scrollToSection('contato');
                }}
                className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Participar dos Cursos da Família
              </button>
              {canManageSite && (
                <button
                  type="button"
                  onClick={() => openPhotoManager('ministerio-familia')}
                  className={`px-4 py-3 rounded-2xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode
                      ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Camera size={14} />
                  <span>Fotos do Min. da Família</span>
                </button>
              )}
            </div>
          </div>

          {/* Pilares do Ministério da Família: Curso de Casais, Curso de Pais e Eventos Anteriores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Curso de Casais */}
            <div
              className={`rounded-3xl border p-7 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-gradient-to-br from-rose-950/35 via-[#0C151B] to-[#0C151B] border-rose-500/30'
                  : 'bg-white border-rose-200 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Aliança Conjugal
                  </span>
                  <Heart size={20} className="text-rose-400" />
                </div>
                <h3 className="text-2xl font-extrabold">Curso de Casais</h3>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Uma jornada transformadora de 8 encontros para casais de todas as idades:
                  comunicação sem ruídos, perdão, finanças à luz da Bíblia, intimidade e sacerdócio
                  no lar.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-rose-400 shrink-0" />
                    <span>Material de apoio próprio e dinâmicas para o casal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-rose-400 shrink-0" />
                    <span>Formatura especial com jantar de renovação de aliança</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeadTopic('ministerio_familia');
                  scrollToSection('contato');
                }}
                className="mt-6 w-full py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Inscrever Nosso Casal →
              </button>
            </div>

            {/* Curso de Pais */}
            <div
              className={`rounded-3xl border p-7 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-gradient-to-br from-amber-950/35 via-[#0C151B] to-[#0C151B] border-amber-500/30'
                  : 'bg-white border-amber-200 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Educação de Filhos
                  </span>
                  <Users size={20} className="text-amber-400" />
                </div>
                <h3 className="text-2xl font-extrabold">Curso de Pais</h3>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Capacitação bíblica e acolhedora em 6 encontros para pais de crianças,
                  adolescentes e jovens: como pastorear o coração dos filhos com amor, limites e
                  sabedoria.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                    <span>Princípios para cada fase do desenvolvimento dos filhos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                    <span>Protegendo a mente e o coração da nova geração</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeadTopic('ministerio_familia');
                  scrollToSection('contato');
                }}
                className="mt-6 w-full py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Quero Participar do Curso de Pais →
              </button>
            </div>

            {/* Eventos Anteriores (Família & Jovens) Sincronizados com o Portal */}
            <div
              className={`rounded-3xl border p-7 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-[#0C151B]/90 border-white/12'
                  : 'bg-white border-slate-200 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Memórias &amp; Testemunhos
                  </span>
                  <History size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-2xl font-extrabold">Eventos Anteriores</h3>
                <p
                  className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Confira os principais encontros, conferências e celebrações que já aconteceram e
                  foram registrados pela nossa igreja:
                </p>

                <div className="mt-4 space-y-2.5">
                  {pastEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-2xl border text-xs ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-cyan-400">{ev.category}</span>
                        <span className="text-[10px] text-slate-400">{ev.eventTime}</span>
                      </div>
                      <div className="font-extrabold mt-0.5">{ev.title}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {canManageSite ? (
                <button
                  type="button"
                  onClick={() => navigate('/eventos')}
                  className="mt-6 w-full py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Gerenciar Eventos Passados no Portal →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => scrollToSection('proximos-eventos')}
                  className="mt-6 w-full py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Ver Próximas Edições →
                </button>
              )}
            </div>
          </div>

          <SitePhotoGallerySection
            sectionKey="ministerio-familia"
            title="Galeria do Ministério da Família & Eventos Anteriores"
            subtitle="Encontros de casais, formaturas do Curso de Pais e momentos marcantes com os lares da igreja."
            isLight={!isDarkMode}
            canManageOverride={canManageSite}
          />
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 4: MINISTÉRIO INFANTIL & ASSISTÊNCIA SOCIAL (MERCADO SOLIDÁRIO)
         ========================================================================= */}
      <section
        id="infantil-social"
        className={`border-y py-20 sm:py-24 ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white/80'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 space-y-20">
          {/* 4A. MINISTÉRIO INFANTIL */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Sparkles size={13} /> Cuidado com os Pequenos
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Ministério Infantil Manancial
                </h2>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Enquanto os pais participam do culto com tranquilidade, nossas crianças vivem uma
                  experiência alegre, segura e cheia da presença de Deus. Nosso Espaço Kids conta
                  com equipe treinada, salas por faixa etária e ensino bíblico lúdico.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-amber-400">Ensino Bíblico Criativo</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Histórias bíblicas, louvor infantil, teatro e memorização da Palavra adaptados
                      para cada idade.
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-cyan-400">Segurança &amp; Acolhimento</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Recepção identificada dos pequenos e professoras dedicadas durante todos os
                      cultos de domingo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <SitePhotoGallerySection
                  sectionKey="ministerio-infantil"
                  title="Fotos do Ministério Infantil"
                  subtitle="Alegria, ensino da Palavra e comunhão das nossas crianças."
                  isLight={!isDarkMode}
                  canManageOverride={canManageSite}
                />
              </div>
            </div>
          </div>

          {/* 4B. ASSISTÊNCIA SOCIAL & MERCADO SOLIDÁRIO */}
          <div className="space-y-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <HeartHandshake size={13} /> Assistência Social
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Mercado Solidário &amp; Diaconia
                </h2>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  O Evangelho de Jesus se manifesta em amor prático. Através da nossa{' '}
                  <strong>Assistência Social</strong> e do <strong>Mercado Solidário</strong>,
                  acolhemos famílias em situação de vulnerabilidade com dignidade, permitindo que
                  escolham os itens essenciais de alimentação e higiene para o seu lar, acompanhadas
                  de oração e cuidado pastoral.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
                      <ShoppingBag size={15} /> Dignidade na Escolha
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Estrutura organizada onde as famílias cadastradas são atendidas com respeito,
                      carinho e acompanhamento contínuo.
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-teal-400 flex items-center gap-1.5">
                      <Heart size={15} /> Como Contribuir ou Solicitar
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Você pode doar alimentos nos cultos ou entrar em contato com nossa equipe
                      pastoral e diaconal pelo formulário abaixo.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLeadTopic('mercado_solidario');
                      scrollToSection('contato');
                    }}
                    className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                  >
                    Quero Apoiar ou Falar com a Assistência Social
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <SitePhotoGallerySection
                  sectionKey="mercado-solidario"
                  title="Fotos do Mercado Solidário & Ação Social"
                  subtitle="Amor em ação cuidando das famílias da nossa comunidade."
                  isLight={!isDarkMode}
                  canManageOverride={canManageSite}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 5: NOSSA PROGRAMAÇÃO (CULTOS SEMANAIS & LOCALIZAÇÃO)
         ========================================================================= */}
      <section id="programacao" className="mx-auto max-w-[1280px] px-5 sm:px-8 py-20 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Clock size={13} /> Nossa Programação
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
              Horários dos Cultos &amp; Onde Estamos
            </h2>
            <p
              className={`mt-2 text-sm sm:text-base leading-relaxed ${
                isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
              }`}
            >
              Nossas portas estão abertas durante toda a semana no centro de São Pedro - SP. Traga
              sua família para adorar a Deus conosco!
            </p>
          </div>

          {canManageSite && (
            <button
              type="button"
              onClick={() => navigate('/igreja')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                isDarkMode
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                  : 'border-cyan-200 bg-cyan-50 text-cyan-900 hover:bg-cyan-100'
              }`}
            >
              <Settings2 size={14} />
              <span>Editar Horários no Portal</span>
            </button>
          )}
        </div>

        {servicesLoading && weeklyServices.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl border h-52 animate-pulse ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                }`}
              />
            ))}
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              weeklyServices.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            } gap-5`}
          >
            {weeklyServices.map((svc) => {
              const weekdayLabel = WEEKDAY_LABELS[svc.dayOfWeek] || 'Culto';
              const isSunday = svc.dayOfWeek === 0;
              const IconComponent = isSunday ? Church : svc.isTeaching ? BookOpen : Clock;
              return (
                <div
                  key={svc.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 ${
                    isSunday
                      ? isDarkMode
                        ? 'bg-[#0C151B] border-cyan-500/45 ring-1 ring-cyan-500/30 shadow-xl'
                        : 'bg-white border-cyan-300 ring-2 ring-cyan-200 shadow-md'
                      : isDarkMode
                        ? 'bg-[#0C151B]/80 border-white/10'
                        : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isSunday
                            ? 'bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-md'
                            : svc.isTeaching
                              ? 'bg-amber-500/15 border border-amber-400/30 text-amber-400'
                              : 'bg-teal-500/15 border border-teal-400/30 text-teal-400'
                        }`}
                      >
                        <IconComponent size={22} />
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          isSunday
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : svc.isTeaching
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {weekdayLabel}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold">{svc.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {svc.isTeaching
                        ? 'Estudo bíblico sistemático e Curso de Teologia aberto a toda a igreja.'
                        : svc.tag || 'Comunhão, louvor e ministração da Palavra de Deus.'}
                    </p>
                    <div
                      className={`mt-4 flex items-center gap-2 text-sm font-mono font-extrabold ${
                        isSunday ? 'text-cyan-400' : svc.isTeaching ? 'text-amber-400' : 'text-teal-400'
                      }`}
                    >
                      <Clock size={16} /> {svc.time}h
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
                    {isSunday
                      ? 'Templo Principal • Ministério Infantil Ativo'
                      : svc.isTeaching
                        ? 'Templo Principal • Ensino & Discipulado'
                        : 'Templo Sede Manancial • São Pedro - SP'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Card de Endereço e Como Chegar */}
        <div
          className={`mt-8 p-6 sm:p-8 rounded-3xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
            isDarkMode ? 'bg-[#0C151B]/90 border-white/12' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <MapPin size={26} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Localização Oficial
              </span>
              <div className="font-extrabold text-lg sm:text-xl mt-0.5">
                Av. Ângelo Nogueira, 45 • Centro • São Pedro - SP
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Ambiente familiar, acessível e com recepção dedicada para acolher você desde a
                entrada.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Angelo+Nogueira+45+Centro+Sao+Pedro+SP"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 sm:flex-none text-center px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                isDarkMode
                  ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                  : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              Ver no Google Maps
            </a>
            <button
              type="button"
              onClick={() => navigate('/visitante')}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              Planejar Minha Visita
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 6: NOSSOS CURSOS (TEOLOGIA, BATISMO, CASAIS, PAIS, LÍDERES)
         ========================================================================= */}
      <section
        id="cursos"
        className={`border-y py-20 sm:py-24 ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white/80'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <GraduationCap size={13} /> Crescimento Bíblico &amp; Discipulado
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
                Nossos Cursos
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
                }`}
              >
                Trilhas de formação cristã para todas as fases da sua caminhada: desde os primeiros
                passos na fé e o Batismo nas Águas até o Curso de Teologia, Curso de Casais e Curso
                de Pais.
              </p>
            </div>

            {canManageSite && (
              <button
                type="button"
                onClick={() => navigate('/cursos')}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                  isDarkMode
                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                    : 'border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100'
                }`}
              >
                <GraduationCap size={14} />
                <span>Gerenciar Alunos no Portal</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_CHURCH_COURSES.map((course) => (
              <div
                key={course.id}
                className={`rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all hover:-translate-y-1 ${
                  course.featured
                    ? isDarkMode
                      ? 'bg-gradient-to-br from-amber-950/30 via-[#0C151B] to-[#0C151B] border-amber-500/40 shadow-xl'
                      : 'bg-gradient-to-br from-amber-50/70 via-white to-white border-amber-300 shadow-md'
                    : isDarkMode
                      ? 'bg-[#0C151B]/90 border-white/10'
                      : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        course.featured
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                      }`}
                    >
                      {course.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {course.totalLessons} lições
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold">{course.title}</h3>
                  <p className="text-xs font-bold text-cyan-400 mt-1">{course.teacher}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{course.scheduleLabel}</p>

                  <p
                    className={`mt-3 text-xs sm:text-sm leading-relaxed ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {course.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                    {course.modules.slice(0, 3).map((mod, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                        <BookOpen size={12} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLeadTopic(
                      course.id === 'curso-casais' || course.id === 'curso-pais'
                        ? 'ministerio_familia'
                        : 'cursos_discipulado'
                    );
                    scrollToSection('contato');
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-slate-950 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  Manifestar Interesse no Curso →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 7: NOSSOS EVENTOS EM DESTAQUE
          (VIGÍLIA • MANHÃ COM DEUS • EVANGELISMO • ACAMP MANANCIAL • DIA DA FAMÍLIA)
         ========================================================================= */}
      <section id="nossos-eventos" className="mx-auto max-w-[1280px] px-5 sm:px-8 py-20 sm:py-24 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Sparkles size={13} /> Nossos Eventos &amp; Mobilizações
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Os Grandes Encontros da Família Manancial
          </h2>
          <p
            className={`mt-2 text-sm sm:text-base leading-relaxed ${
              isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
            }`}
          >
            Selecione cada iniciativa abaixo para conhecer como vivemos nossas Vigílias, Manhãs com
            Deus, Evangelismos, o Acamp Manancial e o Dia da Família — com fotos gerenciadas em
            tempo real pelo nosso portal.
          </p>
        </div>

        {/* Seletor Interativo dos 5 Eventos-Pilares */}
        <div
          role="tablist"
          aria-label="Nossos eventos principais"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {EVENT_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activeEventPillar === pillar.key;
            return (
              <button
                key={pillar.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveEventPillar(pillar.key)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${pillar.accentColor} text-slate-950 border-transparent shadow-lg scale-[1.02]`
                    : isDarkMode
                      ? 'bg-[#0C151B] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <Icon size={16} />
                <span>{pillar.title}</span>
              </button>
            );
          })}
        </div>

        {/* Painel Detalhado do Pilar Selecionado + Galeria de Fotos Específica */}
        <div
          className={`rounded-[2rem] border p-6 sm:p-10 transition-all ${
            isDarkMode
              ? 'bg-[#0C151B]/95 border-white/12 shadow-2xl'
              : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${currentPillar.accentColor} text-slate-950`}
                >
                  {currentPillar.badge}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {currentPillar.scheduleHint}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentPillar.title} — {currentPillar.subtitle}
              </h3>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {currentPillar.description}
              </p>

              <ul className="space-y-2.5 pt-1">
                {currentPillar.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (currentPillar.ctaRoute) {
                      navigate(currentPillar.ctaRoute);
                    } else {
                      setLeadTopic(
                        currentPillar.key === 'acamp-manancial'
                          ? 'acamp_manancial'
                          : 'visita_igreja'
                      );
                      scrollToSection('contato');
                    }
                  }}
                  className={`px-6 py-3.5 rounded-2xl bg-gradient-to-r ${currentPillar.accentColor} text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-transform active:scale-95 cursor-pointer`}
                >
                  {currentPillar.ctaLabel}
                </button>

                {canManageSite && (
                  <button
                    type="button"
                    onClick={() => openPhotoManager(currentPillar.key)}
                    className={`px-4 py-3.5 rounded-2xl border text-xs font-bold inline-flex items-center gap-2 cursor-pointer ${
                      isDarkMode
                        ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                        : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Camera size={15} />
                    <span>Enviar Foto em {currentPillar.title}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <SitePhotoGallerySection
                sectionKey={currentPillar.key}
                title={`Galeria: ${currentPillar.title}`}
                subtitle={`Registros fotográficos oficiais de ${currentPillar.title} na Igreja Manancial.`}
                isLight={!isDarkMode}
                canManageOverride={canManageSite}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 8: PRÓXIMOS EVENTOS (SINCRONIZADOS COM O PORTAL GERENCIAL)
         ========================================================================= */}
      <section
        id="proximos-eventos"
        className={`border-y py-20 sm:py-24 ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white/80'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Calendar size={13} /> Agenda &amp; Cronograma Oficial
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
                Próximos Eventos
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
                }`}
              >
                Acompanhe as datas das nossas próximas programações. Toda atualização feita pela
                liderança no Portal Gerencial reflete imediatamente aqui no site.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  'Todos',
                  'Acamp Manancial',
                  'Vigília',
                  'Manhã com Deus',
                  'Evangelismo',
                  'Dia da Família',
                ] as const
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setUpcomingCategoryFilter(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    upcomingCategoryFilter === cat
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : isDarkMode
                        ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {canManageSite && (
                <button
                  type="button"
                  onClick={() => navigate('/eventos')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Settings2 size={13} />
                  <span>Gerenciar Eventos</span>
                </button>
              )}
            </div>
          </div>

          {loadingEvents && filteredUpcomingEvents.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-72 rounded-3xl border animate-pulse ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                  }`}
                />
              ))}
            </div>
          ) : filteredUpcomingEvents.length === 0 ? (
            <div
              className={`p-10 rounded-3xl border text-center space-y-3 ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <Calendar size={32} className="mx-auto text-cyan-400" />
              <div className="font-bold text-base">
                Nenhum evento futuro filtrado nesta categoria no momento.
              </div>
              <button
                type="button"
                onClick={() => setUpcomingCategoryFilter('Todos')}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Mostrar Todos os Próximos Eventos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUpcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 ${
                    isDarkMode
                      ? 'bg-[#0C151B]/95 border-white/12 shadow-xl'
                      : 'bg-white border-slate-200 shadow-md'
                  }`}
                >
                  <div>
                    {/* Capa / Banner do Evento */}
                    <div
                      className={`p-6 bg-gradient-to-r ${ev.bannerColor} text-white relative overflow-hidden`}
                    >
                      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                          {ev.category}
                        </span>
                        {ev.badgeText && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/30 text-amber-200">
                            {ev.badgeText}
                          </span>
                        )}
                      </div>
                      <h3 className="relative z-10 text-lg font-extrabold leading-snug">
                        {ev.title}
                      </h3>
                    </div>

                    <div className="p-6 space-y-4">
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {ev.description}
                      </p>

                      <div
                        className={`p-3.5 rounded-2xl border space-y-2 text-xs font-semibold ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10 text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-cyan-400 shrink-0" />
                          <span>{formatEventDateBr(ev.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-cyan-400 shrink-0" />
                          <span>{ev.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-cyan-400 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-cyan-400 shrink-0" />
                          <span className="truncate">{ev.targetAudience}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Confirmados</span>
                      <span className="text-xs font-extrabold">
                        {ev.registeredCount}{' '}
                        {ev.capacity ? `/ ${ev.capacity} vagas` : 'participantes'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManageSite && ev.gallerySlug && (
                        <button
                          type="button"
                          onClick={() => openPhotoManager(ev.gallerySlug!, ev.id)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition-colors cursor-pointer"
                          title="Enviar foto para este evento"
                        >
                          <Camera size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (ev.directLink) {
                            navigate(ev.directLink);
                          } else {
                            setLeadTopic('visita_igreja');
                            scrollToSection('contato');
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>{ev.directLink ? 'Acessar Página' : 'Quero Ir'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 9: REDES SOCIAIS & CONEXÃO COM A IGREJA
          (SEM EXPOR WHATSAPP DO PASTOR — CONECTADO À SECRETARIA PASTORAL)
         ========================================================================= */}
      <section id="contato" className="mx-auto max-w-[1100px] px-5 sm:px-8 py-20 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Coluna Redes Sociais & Recepção Digital */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/15 text-pink-400 border border-pink-500/30">
              <Instagram size={13} /> Conecte-se Conosco
            </span>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Acompanhe Nossas Redes Sociais e Visite-nos
            </h2>

            <p
              className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Siga o perfil oficial da <strong>Igreja Família Manancial</strong> para acompanhar as
              fotos dos cultos, cortes de mensagens, avisos da semana e novidades de todos os
              ministérios.
            </p>

            {/* Card Oficial do Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-6 rounded-3xl border transition-all hover:-translate-y-1 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-pink-950/40 via-[#0C151B] to-purple-950/30 border-pink-500/35 hover:border-pink-400'
                  : 'bg-gradient-to-br from-pink-50 via-white to-rose-50 border-pink-200 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-pink-400">
                      Instagram Oficial
                    </div>
                    <div className="text-lg font-extrabold">@manancialsaopedro</div>
                    <div className="text-xs text-slate-400">
                      Fotos, Reels, Cultos &amp; Comunicados
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-pink-400 shrink-0" />
              </div>
            </a>

            {/* Card Cartão de Boas-Vindas do Visitante */}
            <div
              className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-[#0C151B]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Recepção de Visitantes
              </div>
              <h3 className="text-lg font-extrabold mt-1">Está nos visitando pela primeira vez?</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Preparamos um cartão de boas-vindas rápido para conhecer você, orar pela sua família
                e acolher seu lar com todo carinho pastoral.
              </p>
              <button
                type="button"
                onClick={() => navigate('/visitante')}
                className="mt-4 w-full py-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Abrir Cartão de Boas-Vindas →
              </button>
            </div>
          </div>

          {/* Coluna Formulário Integrado ao Portal Pastoral (Sem Expor WhatsApp Pessoal) */}
          <div className="lg:col-span-7">
            <div
              className={`p-7 sm:p-9 rounded-3xl border ${
                isDarkMode
                  ? 'bg-[#0C151B]/95 border-white/12 shadow-2xl'
                  : 'bg-white border-slate-200 shadow-xl'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Canal Pastoral &amp; Secretaria
              </span>
              <h3 className="text-2xl font-extrabold mt-1">
                Fale com a Nossa Liderança ou Inscreva-se
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                Sua mensagem é enviada diretamente com sigilo para o nosso Portal Pastoral, onde os
                pastores e líderes acompanham cada pedido de oração, visita ou inscrição em cursos.
              </p>

              {leadSubmitted ? (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-sm space-y-3 text-center">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
                  <div className="font-extrabold text-base">
                    Mensagem recebida pela Equipe Pastoral!
                  </div>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Agradecemos o seu contato, <strong>{leadName}</strong>! Sua solicitação já está
                    registrada na central da liderança da Igreja Manancial e nossa equipe entrará em
                    contato em breve.
                  </p>
                  {leadSyncWarning && (
                    <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-xl px-3 py-2">
                      {leadSyncWarning}
                    </p>
                  )}
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Instagram size={14} />
                      <span>Visitar Nosso Instagram</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setLeadSubmitted(false);
                        setLeadName('');
                        setLeadPhone('');
                        setLeadEmail('');
                        setLeadMessage('');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-white/15 text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-400">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Como podemos chamar você?"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-cyan-400 ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-400">
                      Telefone / Contato com DDD *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(19) 99999-9999"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-cyan-400 ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1.5 text-slate-400">
                      Assunto ou Ministério de Interesse
                    </label>
                    <select
                      value={leadTopic}
                      onChange={(e) => setLeadTopic(e.target.value as LeadTopicType)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-cyan-400 ${
                        isDarkMode
                          ? 'bg-[#0b121e] border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="visita_igreja">
                        Quero visitar a Igreja / Pedido de Oração Pastoral
                      </option>
                      <option value="ministerio_familia">
                        Ministério da Família (Curso de Casais / Curso de Pais)
                      </option>
                      <option value="grupo_jovens">
                        Participar do Nosso Grupo de Jovens
                      </option>
                      <option value="cursos_discipulado">
                        Nossos Cursos (Teologia, Batismo nas Águas, Discipulado)
                      </option>
                      <option value="mercado_solidario">
                        Assistência Social &amp; Mercado Solidário
                      </option>
                      <option value="acamp_manancial">
                        Acamp Manancial 2027 (Temporada 25:14)
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1.5 text-slate-400">
                      Mensagem ou Pedido de Oração (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Conte-nos brevemente como podemos acolher ou orar por você e sua família..."
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-cyan-400 resize-none ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      <Send size={15} />
                      <span>
                        {isSubmittingLead
                          ? 'Enviando para a Secretaria Pastoral...'
                          : 'Enviar para a Equipe Pastoral'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RODAPÉ INSTITUCIONAL COMPLETO
         ========================================================================= */}
      <footer
        className={`border-t py-12 text-xs ${
          isDarkMode
            ? 'border-white/10 bg-[#05080B] text-slate-400'
            : 'border-slate-200 bg-slate-100 text-slate-600'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#082F38] to-[#06B6D4] flex items-center justify-center text-white font-black">
              M
            </div>
            <div>
              <div className="font-bold text-slate-200">
                Comunidade Evangélica Manancial © {new Date().getFullYear()}
              </div>
              <div className="text-[11px] text-slate-500">
                Av. Ângelo Nogueira, 45 • Centro • São Pedro - SP
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-semibold">
            <button
              type="button"
              onClick={() => scrollToSection('identidade')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              A Igreja
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('programacao')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Cultos
            </button>
            <button
              type="button"
              onClick={() => navigate('/visitante')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Sou Visitante
            </button>
            <button
              type="button"
              onClick={() => navigate('/acampamento')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Acamp Manancial
            </button>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 inline-flex items-center gap-1"
            >
              <Instagram size={13} />
              <span>Instagram</span>
            </a>
            <button
              type="button"
              onClick={() => navigate(user ? '/igreja' : '/login')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Portal Interno
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Upload & Gestão de Fotos (Acessível no próprio Site e no Portal) */}
      {uploadModalOpen && (
        <SitePhotoUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          initialSectionKey={uploadTargetSection}
          initialEventId={uploadTargetEventId}
          events={siteEvents}
          photos={sitePhotos}
          onSuccess={() => loadSiteContent()}
          onDeletePhoto={() => loadSiteContent()}
        />
      )}
    </div>
  );
};
