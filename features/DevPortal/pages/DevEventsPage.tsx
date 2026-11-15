import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  CheckCircle2,
  ExternalLink,
  Tent,
  Camera,
  Edit3,
  Trash2,
  DollarSign,
  Globe,
  History,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Sparkles,
  Check,
  RotateCcw,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ChurchEventRecord,
  ChurchEventCategory,
  ChurchSitePhotoRecord,
  SITE_GALLERY_SECTIONS,
  SiteGallerySectionKey,
  fetchChurchSiteEvents,
  getStoredSiteEvents,
  upsertChurchSiteEvent,
  deleteChurchSiteEvent,
  fetchChurchSitePhotos,
  getStoredSitePhotos,
  uploadChurchMediaFile,
} from '../../Church/data/churchSiteContentApi';
import {
  SitePhotoGallerySection,
  SitePhotoUploadModal,
} from '../../Landing/components/SitePhotoGalleryModal';

const EVENT_CATEGORIES: ChurchEventCategory[] = [
  'Acamp Manancial',
  'Vigília',
  'Manhã com Deus',
  'Evangelismo',
  'Dia da Família',
  'Ministério da Família',
  'Grupo Jovens',
  'Ministério Infantil',
  'Mercado Solidário',
  'Culto Especial',
  'Conferência',
];

const BANNER_OPTIONS = [
  { label: 'Teal Manancial Oficial', value: 'from-cyan-700 via-teal-700 to-[#082f38]' },
  { label: 'Ouro & Laranja (Acampamento)', value: 'from-amber-600 via-orange-600 to-amber-800' },
  { label: 'Índigo & Noite (Vigília)', value: 'from-indigo-950 via-slate-900 to-cyan-950' },
  { label: 'Esmeralda & Missões', value: 'from-emerald-700 via-teal-800 to-cyan-900' },
  { label: 'Rosa & Família', value: 'from-rose-600 via-pink-700 to-amber-700' },
  { label: 'Azul Juventude', value: 'from-cyan-900 via-blue-950 to-slate-950' },
];

type ActiveTab = 'upcoming' | 'past' | 'gallery';

export const DevEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const [events, setEvents] = useState<ChurchEventRecord[]>(() => getStoredSiteEvents());
  const [photos, setPhotos] = useState<ChurchSitePhotoRecord[]>(() => getStoredSitePhotos());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de Criar / Editar Evento
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Vigília');
  const [eventDate, setEventDate] = useState('2026-12-05');
  const [eventTime, setEventTime] = useState('19:30');
  const [location, setLocation] = useState('Templo Sede Manancial • São Pedro - SP');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('Toda a Igreja & Famílias');
  const [registeredCount, setRegisteredCount] = useState<number>(50);
  const [capacity, setCapacity] = useState<string>('180');
  const [directLink, setDirectLink] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [bannerColor, setBannerColor] = useState(BANNER_OPTIONS[0].value);
  const [gallerySlug, setGallerySlug] = useState<SiteGallerySectionKey>('vigilia');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isUpcoming, setIsUpcoming] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Modal de Upload de Foto vinculado a um evento/seção
  const [photoModalState, setPhotoModalState] = useState<{
    open: boolean;
    sectionKey: SiteGallerySectionKey;
    eventId?: string;
  }>({
    open: false,
    sectionKey: 'quem-somos',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([fetchChurchSiteEvents(), fetchChurchSitePhotos()])
      .then(([evRes, phRes]) => {
        if (!mounted) return;
        setEvents(evRes.data);
        setPhotos(phRes.data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const onEventsUpdated = () => setEvents(getStoredSiteEvents());
    const onPhotosUpdated = () => setPhotos(getStoredSitePhotos());

    window.addEventListener('manancial-site-events-updated', onEventsUpdated);
    window.addEventListener('manancial-site-photos-updated', onPhotosUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('manancial-site-events-updated', onEventsUpdated);
      window.removeEventListener('manancial-site-photos-updated', onPhotosUpdated);
    };
  }, []);

  const upcomingEvents = useMemo(() => events.filter((e) => e.isUpcoming), [events]);
  const pastEvents = useMemo(() => events.filter((e) => !e.isUpcoming), [events]);

  const displayedEvents = useMemo(() => {
    const base = activeTab === 'past' ? pastEvents : upcomingEvents;
    return base.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'todos' || e.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [activeTab, upcomingEvents, pastEvents, search, categoryFilter]);

  const openCreateEventModal = (defaultUpcoming = true) => {
    setEditingEventId(null);
    setTitle('');
    setCategory('Vigília');
    setEventDate(new Date().toISOString().slice(0, 10));
    setEventTime('19:30');
    setLocation('Templo Sede Manancial • São Pedro - SP');
    setDescription('');
    setTargetAudience('Toda a Igreja & Famílias');
    setRegisteredCount(0);
    setCapacity('200');
    setDirectLink('');
    setBadgeText(defaultUpcoming ? 'Inscrições Abertas' : 'Evento Realizado');
    setBannerColor(BANNER_OPTIONS[0].value);
    setGallerySlug('vigilia');
    setCoverImageUrl('/assets/images/manancial_church_community_1794615448217.jpg');
    setIsUpcoming(defaultUpcoming);
    setIsFeatured(true);
    setEventModalOpen(true);
  };

  const openEditEventModal = (ev: ChurchEventRecord) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setCategory(ev.category);
    setEventDate(ev.eventDate);
    setEventTime(ev.eventTime);
    setLocation(ev.location);
    setDescription(ev.description);
    setTargetAudience(ev.targetAudience);
    setRegisteredCount(ev.registeredCount);
    setCapacity(ev.capacity ? String(ev.capacity) : '');
    setDirectLink(ev.directLink || '');
    setBadgeText(ev.badgeText || '');
    setBannerColor(ev.bannerColor || BANNER_OPTIONS[0].value);
    setGallerySlug(ev.gallerySlug || 'quem-somos');
    setCoverImageUrl(ev.coverImageUrl || '');
    setIsUpcoming(ev.isUpcoming);
    setIsFeatured(ev.isFeatured);
    setEventModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const uploaded = await uploadChurchMediaFile(file, gallerySlug || 'quem-somos');
      setCoverImageUrl(uploaded.publicUrl);
      showToast('Foto de capa enviada com sucesso!');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSavingEvent(true);
    try {
      const res = await upsertChurchSiteEvent({
        id: editingEventId || undefined,
        title: title.trim(),
        category,
        eventDate,
        eventTime: eventTime.trim() || '19:30',
        location: location.trim() || 'Templo Sede Manancial • São Pedro - SP',
        description: description.trim(),
        targetAudience: targetAudience.trim() || 'Toda a Igreja',
        registeredCount: Number(registeredCount) || 0,
        capacity: capacity ? Number(capacity) : undefined,
        directLink: directLink.trim() || undefined,
        badgeText: badgeText.trim() || (isUpcoming ? 'Confirmado na Agenda' : 'Evento Realizado'),
        bannerColor,
        gallerySlug,
        coverImageUrl: coverImageUrl.trim() || undefined,
        isUpcoming,
        isFeatured,
      });

      setEvents(getStoredSiteEvents());
      setEventModalOpen(false);
      showToast(
        res.syncedRemote
          ? `Evento "${res.data.title}" salvo e publicado no Site e no App!`
          : `Evento "${res.data.title}" salvo localmente e atualizado no Site!`
      );
    } finally {
      setSavingEvent(false);
    }
  };

  const handleToggleUpcomingStatus = async (ev: ChurchEventRecord) => {
    const nextStatus = !ev.isUpcoming;
    await upsertChurchSiteEvent({
      ...ev,
      isUpcoming: nextStatus,
      badgeText: nextStatus ? 'Inscrições Abertas' : 'Evento Realizado',
    });
    setEvents(getStoredSiteEvents());
    showToast(
      nextStatus
        ? `"${ev.title}" movido para Próximos Eventos!`
        : `"${ev.title}" marcado como Evento Realizado (Histórico)!`
    );
  };

  const handleDeleteEvent = async (ev: ChurchEventRecord) => {
    await deleteChurchSiteEvent(ev.id);
    setEvents(getStoredSiteEvents());
    showToast(`Evento "${ev.title}" removido da agenda.`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast de Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm bg-[#082f38] text-white px-4 py-3 rounded-2xl shadow-xl border border-cyan-400/40 flex items-center gap-2.5 text-xs font-extrabold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={16} className="text-cyan-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-900 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              Central Pastoral & Mídia do Site
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Sincronizado com /landing e App do Membro
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar size={24} className="text-[#082f38] shrink-0" />
            <span>Eventos, Cronogramas & Galeria de Fotos do Site</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Gerencie próximos eventos (Vigília, Manhã com Deus, Evangelismo, Acamp Manancial, Dia da Família), histórico de eventos anteriores e fotos de todas as seções do site.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openCreateEventModal(activeTab !== 'past')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0c434f] text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer transition-all"
          >
            <Plus size={15} />
            <span>Novo Evento</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setPhotoModalState({
                open: true,
                sectionKey: 'quem-somos',
              })
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#082f38] border border-cyan-200 font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
          >
            <Camera size={15} />
            <span>Enviar Foto para o Site</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/landing')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer transition-all"
          >
            <Globe size={14} />
            <span>Ver no Site</span>
          </button>
        </div>
      </div>

      {/* 3 Abas Principais */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#082f38] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar size={15} />
          <span>Próximos Eventos & Cronograma ({upcomingEvents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'bg-[#082f38] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History size={15} />
          <span>Eventos Anteriores / Histórico ({pastEvents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-[#082f38] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera size={15} />
          <span>Galeria de Fotos do Site ({photos.length})</span>
        </button>
      </div>

      {/* ABA 3: GALERIA DE FOTOS DO SITE (TODAS AS SEÇÕES) */}
      {activeTab === 'gallery' ? (
        <div className="space-y-6">
          {/* Resumo por Seção com botão rápido de upload */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Seções de Fotos da Página Inicial (/landing)
                </h3>
                <p className="text-xs text-slate-500">
                  Clique em qualquer seção abaixo para enviar novas fotos direto para o bucket oficial ou gerenciar as imagens exibidas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SITE_GALLERY_SECTIONS.map((sec) => {
                const count = photos.filter((p) => p.sectionKey === sec.key).length;
                return (
                  <div
                    key={sec.key}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#082f38]">
                          {sec.shortLabel}
                        </span>
                        <span className="text-xs font-black text-slate-700">
                          {count} {count === 1 ? 'foto' : 'fotos'}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-2">
                        {sec.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {sec.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPhotoModalState({
                          open: true,
                          sectionKey: sec.key,
                        })
                      }
                      className="w-full py-2 px-3 rounded-xl bg-[#082f38] hover:bg-[#0c434f] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload size={13} />
                      <span>Enviar / Gerenciar Fotos</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Galeria Completa Interativa */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
            <SitePhotoGallerySection
              title="Todas as Fotos Publicadas no Site"
              subtitle="Visualize em tela cheia, filtre por ministério/iniciativa ou exclua fotos."
              showSectionTabs={true}
              isLight={true}
              canManageOverride={true}
            />
          </div>
        </div>
      ) : (
        /* ABAS 1 E 2: PRÓXIMOS EVENTOS E EVENTOS ANTERIORES */
        <div className="space-y-5">
          {/* Barra de Busca e Filtro de Categoria */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, categoria ou local..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="todos">Todas as Categorias</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => openCreateEventModal(activeTab === 'upcoming')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-900 hover:bg-cyan-950 text-cyan-100 text-xs font-black cursor-pointer"
              >
                <Plus size={14} />
                <span>
                  {activeTab === 'upcoming'
                    ? 'Adicionar Próximo Evento'
                    : 'Registrar Evento Anterior'}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <Loader2 size={28} className="animate-spin mx-auto text-[#082f38] mb-2" />
              <p className="text-xs font-bold text-slate-600">
                Sincronizando eventos e galerias da Igreja Manancial...
              </p>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Calendar size={32} className="mx-auto text-slate-400" />
              <h3 className="text-sm font-black text-slate-800">
                Nenhum evento encontrado para este filtro
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Você pode cadastrar um novo evento agora mesmo para que ele apareça no site e no aplicativo dos membros.
              </p>
              <button
                type="button"
                onClick={() => openCreateEventModal(activeTab === 'upcoming')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082f38] text-white text-xs font-black cursor-pointer"
              >
                <Plus size={15} />
                <span>Criar Evento Agora</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedEvents.map((ev) => {
                const eventPhotosCount = photos.filter(
                  (p) => p.eventId === ev.id || (ev.gallerySlug && p.sectionKey === ev.gallerySlug)
                ).length;

                return (
                  <div
                    key={ev.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:border-cyan-500/60 transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Banner / Capa */}
                      <div
                        className={`relative p-5 bg-gradient-to-r ${ev.bannerColor} text-white overflow-hidden`}
                      >
                        {ev.coverImageUrl && (
                          <img
                            src={ev.coverImageUrl}
                            alt={ev.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none"
                          />
                        )}
                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                                {ev.category}
                              </span>
                              {ev.badgeText && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2.5 py-0.5 rounded-full text-amber-200">
                                  {ev.badgeText}
                                </span>
                              )}
                              {ev.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400/25 px-2 py-0.5 rounded-full text-amber-200">
                                  <Star size={10} /> Destaque
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
                              {ev.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditEventModal(ev)}
                              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                              title="Editar evento"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev)}
                              className="p-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-white transition-colors cursor-pointer"
                              title="Excluir evento"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {ev.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#082f38] shrink-0" />
                            <span>{ev.eventDate.split('-').reverse().join('/')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-[#082f38] shrink-0" />
                            <span className="truncate">{ev.eventTime}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin size={14} className="text-[#082f38] shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Users size={14} className="text-[#082f38] shrink-0" />
                            <span className="truncate">Público: {ev.targetAudience}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações Operacionais do Card */}
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 block">
                            Participantes / Inscritos
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {ev.registeredCount}{' '}
                            {ev.capacity ? `/ ${ev.capacity} vagas` : 'confirmados'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleUpcomingStatus(ev)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold transition-colors cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          <span>
                            {ev.isUpcoming
                              ? 'Marcar como Realizado'
                              : 'Mover p/ Próximos Eventos'}
                          </span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoModalState({
                              open: true,
                              sectionKey: ev.gallerySlug || 'quem-somos',
                              eventId: ev.id,
                            })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#082f38] border border-cyan-200 text-xs font-black cursor-pointer transition-colors"
                        >
                          <Camera size={14} />
                          <span>Fotos ({eventPhotosCount})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate('/financeiro?tab=eventos')}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-black cursor-pointer transition-colors"
                        >
                          <DollarSign size={14} />
                          <span>Financeiro</span>
                        </button>

                        {ev.directLink ? (
                          <button
                            type="button"
                            onClick={() => navigate(ev.directLink!)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#082f38] hover:bg-[#0c434f] text-white text-xs font-black cursor-pointer transition-colors"
                          >
                            <Tent size={14} />
                            <span>Painel</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/landing')}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold cursor-pointer transition-colors"
                          >
                            <ExternalLink size={13} />
                            <span>Ver no Site</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL CRIAR / EDITAR EVENTO */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={() => setEventModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#082f38] to-[#0e4b57] text-white flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-0.5 rounded-full text-cyan-200">
                  Agenda & Cronograma Oficial
                </span>
                <h3 className="text-lg font-black mt-1">
                  {editingEventId ? 'Editar Evento da Igreja' : 'Cadastrar Novo Evento da Igreja'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSaveEvent}
              className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-800"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Vigília Rompendo em Fé • Dezembro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Categoria / Iniciativa *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Seção da Galeria Vinculada
                  </label>
                  <select
                    value={gallerySlug}
                    onChange={(e) => setGallerySlug(e.target.value as SiteGallerySectionKey)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {SITE_GALLERY_SECTIONS.map((sec) => (
                      <option key={sec.key} value={sec.key}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Horário / Período *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="Ex: 23:00 às 04:30 ou 08:00 às 11:30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Localização *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Descrição / Resumo Pastoral *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva a programação, preletor ou como foi a realização do evento..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Público-Alvo
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Selo de Destaque (Badge)
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Ex: Inscrições Abertas / Toda Última Sexta"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Confirmados / Participantes
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={registeredCount}
                    onChange={(e) => setRegisteredCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Capacidade de Vagas (Opcional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Ex: 200"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Status do Evento
                  </label>
                  <select
                    value={isUpcoming ? 'upcoming' : 'past'}
                    onChange={(e) => setIsUpcoming(e.target.value === 'upcoming')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="upcoming">📅 Próximo Evento (Agenda Futura)</option>
                    <option value="past">✅ Evento Realizado (Histórico / Galeria)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Cor do Banner
                  </label>
                  <select
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    {BANNER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload de Capa */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                      Imagem de Capa do Evento
                    </label>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#082f38] hover:underline cursor-pointer"
                    >
                      {uploadingCover ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      <span>Enviar foto do dispositivo</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="URL da foto de capa ou envie um arquivo acima..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-[#082f38]"
                  />
                  <span>Destacar este evento na página inicial (/landing)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEventModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingEvent}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0c434f] text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {savingEvent ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Salvar Evento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE FOTOS DO SITE */}
      <SitePhotoUploadModal
        isOpen={photoModalState.open}
        onClose={() => setPhotoModalState((prev) => ({ ...prev, open: false }))}
        initialSectionKey={photoModalState.sectionKey}
        initialEventId={photoModalState.eventId}
        events={events}
        photos={photos}
        onSuccess={() => {
          setPhotos(getStoredSitePhotos());
          showToast('Foto publicada na galeria do site!');
        }}
        onDeletePhoto={() => {
          setPhotos(getStoredSitePhotos());
          showToast('Foto removida da galeria.');
        }}
      />
    </div>
  );
};
