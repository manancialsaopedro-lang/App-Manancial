import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  ExternalLink,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  Star,
  Filter,
  Eye,
} from 'lucide-react';
import {
  SITE_GALLERY_SECTIONS,
  SiteGallerySectionKey,
  ChurchSitePhotoRecord,
  ChurchEventRecord,
  fetchChurchSitePhotos,
  getStoredSitePhotos,
  fetchChurchSiteEvents,
  getStoredSiteEvents,
  uploadChurchMediaFile,
  createChurchSitePhoto,
  deleteChurchSitePhoto,
} from '../../Church/data/churchSiteContentApi';
import { useCurrentRole } from '../../../hooks/useCurrentRole';

// ============================================================================
// 1. MODAL DE UPLOAD E GERENCIAMENTO DE FOTOS POR SEÇÃO / EVENTO
// ============================================================================

export interface SitePhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSectionKey?: SiteGallerySectionKey;
  initialEventId?: string;
  events?: ChurchEventRecord[];
  photos?: ChurchSitePhotoRecord[];
  onSuccess?: (photo: ChurchSitePhotoRecord) => void;
  onDeletePhoto?: (photo: ChurchSitePhotoRecord) => void;
}

export const SitePhotoUploadModal: React.FC<SitePhotoUploadModalProps> = ({
  isOpen,
  onClose,
  initialSectionKey = 'quem-somos',
  initialEventId = '',
  events: propEvents,
  photos: propPhotos,
  onSuccess,
  onDeletePhoto,
}) => {
  const { roleLabel } = useCurrentRole();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sectionKey, setSectionKey] = useState<SiteGallerySectionKey>(initialSectionKey);
  const [eventId, setEventId] = useState<string>(initialEventId);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [categoryTag, setCategoryTag] = useState('');
  const [eventDateLabel, setEventDateLabel] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const [localEvents, setLocalEvents] = useState<ChurchEventRecord[]>(() =>
    propEvents && propEvents.length > 0 ? propEvents : getStoredSiteEvents()
  );
  const [localPhotos, setLocalPhotos] = useState<ChurchSitePhotoRecord[]>(() =>
    propPhotos && propPhotos.length > 0 ? propPhotos : getStoredSitePhotos()
  );

  useEffect(() => {
    if (isOpen) {
      setSectionKey(initialSectionKey || 'quem-somos');
      setEventId(initialEventId || '');
      setFeedback(null);
      if (!propEvents) {
        setLocalEvents(getStoredSiteEvents());
      } else {
        setLocalEvents(propEvents);
      }
      if (!propPhotos) {
        setLocalPhotos(getStoredSitePhotos());
      } else {
        setLocalPhotos(propPhotos);
      }
    }
  }, [isOpen, initialSectionKey, initialEventId, propEvents, propPhotos]);

  const currentSectionMeta = useMemo(
    () =>
      SITE_GALLERY_SECTIONS.find((s) => s.key === sectionKey) || SITE_GALLERY_SECTIONS[0],
    [sectionKey]
  );

  const sectionPhotos = useMemo(
    () => localPhotos.filter((p) => p.sectionKey === sectionKey),
    [localPhotos, sectionKey]
  );

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setTitle(cleanName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Informe um título para identificar a foto.' });
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      setFeedback({ type: 'error', message: 'Selecione uma imagem do seu dispositivo.' });
      return;
    }

    if (uploadMode === 'url' && !imageUrlInput.trim()) {
      setFeedback({ type: 'error', message: 'Cole o endereço (URL) da imagem.' });
      return;
    }

    setSubmitting(true);
    try {
      let finalUrl = imageUrlInput.trim();
      let storagePath: string | undefined;

      if (uploadMode === 'file' && selectedFile) {
        const uploaded = await uploadChurchMediaFile(selectedFile, sectionKey);
        finalUrl = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      }

      const linkedEvent = localEvents.find((ev) => ev.id === eventId);
      const finalDateLabel =
        eventDateLabel.trim() ||
        (linkedEvent ? linkedEvent.eventDate.split('-').reverse().join('/') : 'Registro Oficial');

      const result = await createChurchSitePhoto({
        sectionKey,
        eventId: eventId || undefined,
        title: title.trim(),
        caption:
          caption.trim() ||
          `Registro especial de ${currentSectionMeta.shortLabel} na Igreja Manancial.`,
        categoryTag: categoryTag.trim() || currentSectionMeta.shortLabel,
        imageUrl: finalUrl,
        storagePath,
        eventDateLabel: finalDateLabel,
        isFeatured,
        sortOrder: 1,
        uploadedBy: roleLabel || 'Portal Pastoral',
      });

      setLocalPhotos(getStoredSitePhotos());
      setTitle('');
      setCaption('');
      setCategoryTag('');
      setEventDateLabel('');
      setSelectedFile(null);
      setFilePreview('');
      setImageUrlInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setFeedback({
        type: 'success',
        message: result.syncedRemote
          ? 'Foto enviada e sincronizada com o banco de dados do site!'
          : 'Foto salva localmente e aplicada imediatamente na galeria!',
      });

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Não foi possível salvar a foto. Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveExisting = async (photo: ChurchSitePhotoRecord) => {
    setDeletingId(photo.id);
    try {
      await deleteChurchSitePhoto(photo);
      setLocalPhotos(getStoredSitePhotos());
      if (onDeletePhoto) onDeletePhoto(photo);
      setFeedback({
        type: 'success',
        message: `Foto "${photo.title}" removida da seção ${currentSectionMeta.shortLabel}.`,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-slate-900 border border-cyan-500/30 text-white shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#082f38] via-[#0b3c49] to-slate-900 border-b border-white/10 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
              <Camera size={12} />
              Central de Mídia & Galeria Oficial
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Gerenciar & Enviar Fotos do Site
            </h3>
            <p className="text-xs text-cyan-100/80">
              Envie fotos reais para cada ministério, ação social ou evento realizado da Igreja Manancial.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seção do Site */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-1.5">
                  Seção do Site / Ministério *
                </label>
                <select
                  value={sectionKey}
                  onChange={(e) => setSectionKey(e.target.value as SiteGallerySectionKey)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                >
                  {SITE_GALLERY_SECTIONS.map((sec) => (
                    <option key={sec.key} value={sec.key}>
                      {sec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vincular a um Evento (Opcional) */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-1.5">
                  Vincular a um Evento (Opcional)
                </label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Sem vínculo específico (Geral da Seção)</option>
                  {localEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.isUpcoming ? '📅 [Próximo] ' : '✅ [Realizado] '}
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alternador de Upload de Arquivo vs URL */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                  Origem da Fotografia *
                </label>
                <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      uploadMode === 'file'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Upload size={12} />
                    <span>Enviar Arquivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      uploadMode === 'url'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <LinkIcon size={12} />
                    <span>Colar URL</span>
                  </button>
                </div>
              </div>

              {uploadMode === 'file' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-800/50 hover:bg-slate-800/80 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                      <img
                        src={filePreview}
                        alt="Prévia"
                        className="w-24 h-20 object-cover rounded-xl border border-white/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-emerald-300 truncate">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Clique para trocar a imagem antes de publicar
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 space-y-1.5">
                      <Upload size={24} className="mx-auto text-cyan-400" />
                      <p className="text-xs font-black text-white">
                        Clique para escolher uma foto do celular ou computador
                      </p>
                      <p className="text-[11px] text-slate-400">
                        JPG, PNG ou WEBP • Sincronização automática com o bucket church-media
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/foto-culto-manancial.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/15 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
                />
              )}
            </div>

            {/* Título, Data/Etiqueta e Legenda */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-1.5">
                  Título da Foto *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Batismo nas Águas • Acamp Manancial"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/15 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-1.5">
                  Data / Etiqueta do Momento
                </label>
                <input
                  type="text"
                  value={eventDateLabel}
                  onChange={(e) => setEventDateLabel(e.target.value)}
                  placeholder="Ex: Novembro 2026 • Templo Sede"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/15 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-1.5">
                Legenda / Testemunho Breve
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Descreva brevemente esse momento especial da igreja..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-white/15 text-xs font-medium text-white focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Destacar foto em primeiro lugar nesta seção</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 cursor-pointer transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Publicando Foto...</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>Publicar Foto na Seção</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Lista de Fotos Atuais da Seção */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Fotos Atuais em "{currentSectionMeta.shortLabel}" ({sectionPhotos.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Clique na lixeira para remover do site
              </span>
            </div>

            {sectionPhotos.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-800/50 rounded-2xl p-4 text-center border border-white/5">
                Nenhuma foto cadastrada nesta seção ainda. Envie a primeira acima!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                {sectionPhotos.map((ph) => (
                  <div
                    key={ph.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-800/80 border border-white/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={ph.imageUrl}
                        alt={ph.title}
                        className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0 bg-slate-900"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{ph.title}</p>
                        <p className="text-[10px] text-cyan-300 truncate">
                          {ph.eventDateLabel || currentSectionMeta.shortLabel}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === ph.id}
                      onClick={() => handleRemoveExisting(ph)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors shrink-0 cursor-pointer"
                      title="Excluir foto"
                    >
                      {deletingId === ph.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. SEÇÃO DE GALERIA INTERATIVA COM ABAS, LIGHTBOX E BOTÃO ADMINISTRATIVO
// ============================================================================

export interface SitePhotoGallerySectionProps {
  sectionKey?: SiteGallerySectionKey;
  eventId?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  showSectionTabs?: boolean;
  isLight?: boolean;
  canManageOverride?: boolean;
  maxItems?: number;
}

export const SitePhotoGallerySection: React.FC<SitePhotoGallerySectionProps> = ({
  sectionKey,
  eventId,
  title,
  subtitle,
  compact = false,
  showSectionTabs = false,
  isLight = false,
  canManageOverride,
  maxItems,
}) => {
  const { activeRole, canAccessPastoral } = useCurrentRole();
  const canManagePhotos =
    typeof canManageOverride === 'boolean'
      ? canManageOverride
      : canAccessPastoral ||
        [
          'admin',
          'pastoral',
          'primeiro_pastor',
          'segundo_pastor',
          'equipe_pastoral',
          'organizacao',
        ].includes(activeRole);

  const [photos, setPhotos] = useState<ChurchSitePhotoRecord[]>(() => getStoredSitePhotos());
  const [events, setEvents] = useState<ChurchEventRecord[]>(() => getStoredSiteEvents());
  const [activeTab, setActiveTab] = useState<SiteGallerySectionKey | 'todas'>(
    sectionKey || 'todas'
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    if (sectionKey) {
      setActiveTab(sectionKey);
    }
  }, [sectionKey]);

  useEffect(() => {
    let mounted = true;
    fetchChurchSitePhotos().then((res) => {
      if (mounted) setPhotos(res.data);
    });
    fetchChurchSiteEvents().then((res) => {
      if (mounted) setEvents(res.data);
    });

    const handlePhotosUpdated = () => {
      setPhotos(getStoredSitePhotos());
    };
    const handleEventsUpdated = () => {
      setEvents(getStoredSiteEvents());
    };

    window.addEventListener('manancial-site-photos-updated', handlePhotosUpdated);
    window.addEventListener('manancial-site-events-updated', handleEventsUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('manancial-site-photos-updated', handlePhotosUpdated);
      window.removeEventListener('manancial-site-events-updated', handleEventsUpdated);
    };
  }, []);

  const filteredPhotos = useMemo(() => {
    let list = photos;
    if (eventId) {
      list = list.filter((p) => p.eventId === eventId || p.sectionKey === sectionKey);
    } else if (activeTab !== 'todas') {
      list = list.filter((p) => p.sectionKey === activeTab);
    }
    if (maxItems && maxItems > 0) {
      return list.slice(0, maxItems);
    }
    return list;
  }, [photos, activeTab, eventId, sectionKey, maxItems]);

  const currentSectionMeta = useMemo(() => {
    const keyToFind = activeTab === 'todas' ? sectionKey || 'quem-somos' : activeTab;
    return (
      SITE_GALLERY_SECTIONS.find((s) => s.key === keyToFind) || SITE_GALLERY_SECTIONS[0]
    );
  }, [activeTab, sectionKey]);

  const activeLightboxPhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex]
      ? filteredPhotos[lightboxIndex]
      : null;

  const handleDeleteFromLightbox = async (photo: ChurchSitePhotoRecord) => {
    await deleteChurchSitePhoto(photo);
    setPhotos(getStoredSitePhotos());
    setLightboxIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Header & Admin Upload Button */}
      {(title || subtitle || canManagePhotos || showSectionTabs) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {title && (
              <h3
                className={`font-black tracking-tight flex items-center gap-2 ${
                  compact ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
                } ${isLight ? 'text-slate-900' : 'text-white'}`}
              >
                <Camera
                  size={compact ? 16 : 20}
                  className={isLight ? 'text-[#082f38]' : 'text-cyan-400'}
                />
                <span>{title}</span>
              </h3>
            )}
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? 'text-slate-600' : 'text-slate-300/85'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          {canManagePhotos && (
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-[#082f38] hover:bg-[#0c434f] text-cyan-200 shadow-xs'
                  : 'bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-200 border border-cyan-400/35'
              }`}
            >
              <Upload size={14} />
              <span>Gerenciar / Enviar Foto nesta Seção</span>
            </button>
          )}
        </div>
      )}

      {/* Abas de Seção quando showSectionTabs = true */}
      {showSectionTabs && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'todas'
                ? isLight
                  ? 'bg-[#082f38] text-white'
                  : 'bg-cyan-400 text-slate-950'
                : isLight
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Todas ({photos.length})
          </button>
          {SITE_GALLERY_SECTIONS.map((sec) => {
            const count = photos.filter((p) => p.sectionKey === sec.key).length;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveTab(sec.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === sec.key
                    ? isLight
                      ? 'bg-[#082f38] text-white'
                      : 'bg-cyan-400 text-slate-950'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {sec.shortLabel} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grid de Fotos */}
      {filteredPhotos.length === 0 ? (
        <div
          className={`rounded-2xl p-6 text-center border ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-white/[0.03] border-white/10 text-slate-300'
          }`}
        >
          <ImageIcon
            size={28}
            className={`mx-auto mb-2 ${isLight ? 'text-slate-400' : 'text-cyan-400/60'}`}
          />
          <p className="text-xs font-bold">
            Nenhuma foto publicada nesta seção ainda.
          </p>
          {canManagePhotos && (
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Enviar Primeira Foto</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid gap-3.5 ${
            compact
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                isLight
                  ? 'bg-white border-slate-200/90 hover:border-cyan-500 shadow-xs hover:shadow-md'
                  : 'bg-slate-900/70 border-white/10 hover:border-cyan-400/50'
              }`}
            >
              <div className={compact ? 'aspect-[16/10] overflow-hidden' : 'aspect-[16/10] overflow-hidden'}>
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex flex-col justify-end p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/25 text-cyan-200 border border-cyan-400/30 backdrop-blur-xs">
                    {photo.categoryTag || currentSectionMeta.shortLabel}
                  </span>
                  {photo.eventDateLabel && (
                    <span className="text-[10px] font-bold text-slate-200/90 truncate">
                      {photo.eventDateLabel}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white leading-snug line-clamp-1">
                  {photo.title}
                </h4>
                {!compact && photo.caption && (
                  <p className="text-[11px] text-slate-200/85 line-clamp-2 mt-0.5">
                    {photo.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal ao clicar na foto */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="fixed top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            aria-label="Fechar visualização"
          >
            <X size={20} />
          </button>

          {filteredPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                  )
                }
                className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
                className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                aria-label="Próxima foto"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="max-w-4xl w-full bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-black flex items-center justify-center max-h-[65dvh] overflow-hidden">
              <img
                src={activeLightboxPhoto.imageUrl}
                alt={activeLightboxPhoto.title}
                className="max-h-[65dvh] w-auto object-contain"
              />
            </div>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {activeLightboxPhoto.categoryTag || currentSectionMeta.shortLabel}
                  </span>
                  {activeLightboxPhoto.eventDateLabel && (
                    <span className="text-xs font-bold text-slate-400">
                      • {activeLightboxPhoto.eventDateLabel}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {activeLightboxPhoto.title}
                </h3>
                {activeLightboxPhoto.caption && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeLightboxPhoto.caption}
                  </p>
                )}
              </div>

              {canManagePhotos && (
                <button
                  type="button"
                  onClick={() => handleDeleteFromLightbox(activeLightboxPhoto)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-black shrink-0 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Excluir Foto</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload Administrativo */}
      <SitePhotoUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        initialSectionKey={activeTab === 'todas' ? sectionKey || 'quem-somos' : activeTab}
        initialEventId={eventId}
        events={events}
        photos={photos}
        onSuccess={() => setPhotos(getStoredSitePhotos())}
        onDeletePhoto={() => setPhotos(getStoredSitePhotos())}
      />
    </div>
  );
};

export const SitePhotoGalleryModal = SitePhotoUploadModal;
export default SitePhotoGalleryModal;
