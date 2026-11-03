import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Music, 
  Mic, 
  Plus, 
  Trash2, 
  Headphones, 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Song, Profile, StudyAudioTrack, StudySongSection, StudyRecording } from '../../types';
import { 
  fetchStudyAudioTracks, 
  deleteStudyAudioTrack, 
  fetchStudySections, 
  createStudySection, 
  deleteStudySection, 
  saveStudyRecording, 
  submitStudyRecording, 
  deleteStudyRecording, 
  fetchStudyRecordings 
} from '../../lib/appData';
import StudyPlayer from './StudyPlayer';
import StudyRecorder from './StudyRecorder';
import StudyAudioUploader from './StudyAudioUploader';
import { toast } from 'react-hot-toast';

interface StudySongDetailProps {
  song: Song;
  userProfile: Profile | null;
  onBack: () => void;
  isMinister: boolean;
}

export default function StudySongDetail({ song, userProfile, onBack, isMinister }: StudySongDetailProps) {
  // Data State
  const [tracks, setTracks] = useState<StudyAudioTrack[]>([]);
  const [sections, setSections] = useState<StudySongSection[]>([]);
  const [recordings, setRecordings] = useState<StudyRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selections
  const [selectedSection, setSelectedSection] = useState<StudySongSection | null>(null);
  const [selectedVocalPart, setSelectedVocalPart] = useState<string>('unison');
  const [isSecondVoiceMode, setIsSecondVoiceMode] = useState(false);

  // Player & Recorder Toggle
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackVolume, setPlaybackVolume] = useState(0.8);
  const [guideVolume, setGuideVolume] = useState(0.8);

  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isSavingRecording, setIsSavingRecording] = useState(false);

  // Modals & Forms
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionStart, setNewSectionStart] = useState('0');
  const [newSectionEnd, setNewSectionEnd] = useState('60');
  const [newSectionLyrics, setNewSectionLyrics] = useState('');
  const [newSectionHas2ndVoice, setNewSectionHas2ndVoice] = useState(false);
  const [newSection2ndVoiceNotes, setNewSection2ndVoiceNotes] = useState('');

  // Audio elements references for synchronized recording
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const guideRef = useRef<HTMLAudioElement | null>(null);

  // Load Initial Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedTracks, fetchedSections] = await Promise.all([
        fetchStudyAudioTracks(song.id),
        fetchStudySections(song.id)
      ]);

      setTracks(fetchedTracks);
      setSections(fetchedSections);

      // Pre-select "Música Completa" if it exists, or the first section
      if (fetchedSections.length > 0) {
        const completeSection = fetchedSections.find(s => s.name.toLowerCase().includes('completa'));
        setSelectedSection(completeSection || fetchedSections[0]);
      }

      if (userProfile) {
        const fetchedRecordings = await fetchStudyRecordings(userProfile.id);
        setRecordings(fetchedRecordings.filter(r => r.song_id === song.id));
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados de estudo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [song.id, userProfile]);

  // Sync vocal part to second voice if Second Voice Mode is active
  useEffect(() => {
    if (isSecondVoiceMode) {
      setSelectedVocalPart('second_voice');
      setIsLooping(true); // Loop active by default for training
      
      // Auto select the first section that has second voice details
      const secWith2ndVoice = sections.find(s => s.has_second_voice);
      if (secWith2ndVoice) {
        setSelectedSection(secWith2ndVoice);
      }
    } else {
      setSelectedVocalPart('unison');
    }
  }, [isSecondVoiceMode, sections]);

  // Filter Tracks
  const playbackTrack = useMemo(() => {
    return tracks.find(t => t.track_type === 'playback');
  }, [tracks]);

  const guideTrack = useMemo(() => {
    return tracks.find(t => t.track_type === 'vocal_guide' && t.vocal_part === selectedVocalPart);
  }, [tracks, selectedVocalPart]);

  // Section Looping times
  const loopStartTime = selectedSection?.start_time_seconds || 0;
  const loopEndTime = selectedSection?.end_time_seconds;

  // Add a study section (Ministers only)
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName) {
      toast.error('Nome do trecho é obrigatório');
      return;
    }

    try {
      const newSec = await createStudySection({
        song_id: song.id,
        name: newSectionName,
        start_time_seconds: parseInt(newSectionStart) || 0,
        end_time_seconds: parseInt(newSectionEnd) || 60,
        lyrics_fragment: newSectionLyrics,
        has_second_voice: newSectionHas2ndVoice,
        second_voice_notes: newSectionHas2ndVoice ? newSection2ndVoiceNotes : undefined,
        order_index: sections.length
      });

      setSections(prev => [...prev, newSec].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
      setSelectedSection(newSec);
      setIsSectionFormOpen(false);
      
      // Reset form
      setNewSectionName('');
      setNewSectionStart('0');
      setNewSectionEnd('60');
      setNewSectionLyrics('');
      setNewSectionHas2ndVoice(false);
      setNewSection2ndVoiceNotes('');
      
      toast.success('Trecho cadastrado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cadastrar trecho');
    }
  };

  // Delete study section
  const handleDeleteSection = async (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir este trecho de estudo?')) return;

    try {
      await deleteStudySection(secId);
      setSections(prev => prev.filter(s => s.id !== secId));
      if (selectedSection?.id === secId) {
        setSelectedSection(null);
      }
      toast.success('Trecho excluído');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir trecho');
    }
  };

  // Delete study audio track
  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Deseja excluir esta faixa de áudio?')) return;

    try {
      await deleteStudyAudioTrack(trackId);
      setTracks(prev => prev.filter(t => t.id !== trackId));
      toast.success('Faixa excluída');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir faixa');
    }
  };

  // Synchronized playback controls for recording
  const handleAudioRefsReady = (playback: HTMLAudioElement | null, guide: HTMLAudioElement | null) => {
    playbackRef.current = playback;
    guideRef.current = guide;
  };

  const handleStartPlaybackForRecording = () => {
    // Seek both elements to the start of the selection before playing
    const seekTime = selectedSection?.start_time_seconds || 0;
    if (playbackRef.current) {
      playbackRef.current.currentTime = seekTime;
    }
    if (guideRef.current) {
      guideRef.current.currentTime = seekTime;
    }
    setCurrentTime(seekTime);
    setIsPlaying(true);
  };

  const handleStopPlaybackForRecording = () => {
    setIsPlaying(false);
  };

  // Save/Submit Recording
  const handleSaveRecording = async (file: File, durationSeconds: number, submit: boolean) => {
    if (!userProfile) return;
    setIsSavingRecording(true);

    try {
      const savedRec = await saveStudyRecording({
        user_id: userProfile.id,
        song_id: song.id,
        section_id: selectedSection?.id,
        vocal_part: selectedVocalPart,
        duration_seconds: durationSeconds
      }, file);

      if (submit) {
        await submitStudyRecording(savedRec.id);
        savedRec.status = 'submitted';
        savedRec.submitted_for_review = true;
        toast.success('Gravação enviada para avaliação com sucesso!');
      } else {
        toast.success('Rascunho salvo!');
      }

      setRecordings(prev => [savedRec, ...prev]);
      setIsRecordingMode(false);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar gravação');
    } finally {
      setIsSavingRecording(false);
    }
  };

  // Submit Draft Recording
  const handleSubmitDraft = async (recId: string) => {
    try {
      await submitStudyRecording(recId);
      setRecordings(prev => prev.map(r => r.id === recId ? { ...r, status: 'submitted', submitted_for_review: true } : r));
      toast.success('Gravação enviada para avaliação!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar gravação');
    }
  };

  // Delete Recording
  const handleDeleteRecording = async (recId: string) => {
    if (!confirm('Deseja excluir esta gravação?')) return;

    try {
      await deleteStudyRecording(recId);
      setRecordings(prev => prev.filter(r => r.id !== recId));
      toast.success('Gravação excluída');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir gravação');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00153d]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div>
          <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#00153d] transition-colors">
            <ArrowLeft size={16} />
            Voltar para o Ambiente de Estudos
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex gap-5 items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00153d] to-blue-800 rounded-3xl flex items-center justify-center text-white shadow-xl">
              <Music size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{song.artist}</p>
              <h2 className="text-3xl font-headline font-black text-[#00153d] tracking-tight">{song.title}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-xl font-bold uppercase">Tom: {song.key}</span>
                {song.bpm && <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-xl font-bold">BPM: {song.bpm}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {song.links.lyrics && (
              <a 
                href={song.links.lyrics} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-slate-600 rounded-2xl text-xs font-bold transition-all whitespace-nowrap"
              >
                Letra Completa <ExternalLink size={14} />
              </a>
            )}
            
            {isMinister && (
              <button
                onClick={() => setIsUploaderOpen(true)}
                className="px-5 py-3 bg-[#00153d] text-white hover:bg-blue-950 rounded-2xl text-xs font-bold shadow-lg shadow-blue-900/10 transition-all whitespace-nowrap"
              >
                Upload de Áudio
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Sections & Voice select */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Second Voice Trainer Toggle */}
          <div className="glass bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 rounded-[2.5rem] border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Treinamento Vocal</span>
                </div>
                <h4 className="text-lg font-headline font-black text-amber-950">Treinar Segunda Voz</h4>
                <p className="text-xs text-amber-900/70 font-medium leading-relaxed">
                  Foque na harmonia! Prioriza o guia vocal de segunda voz e filtra as seções indicadas para treino harmônico.
                </p>
              </div>
              
              <button
                onClick={() => setIsSecondVoiceMode(!isSecondVoiceMode)}
                className={`w-12 h-6 rounded-full transition-all relative outline-none flex items-center ${
                  isSecondVoiceMode ? 'bg-amber-600' : 'bg-slate-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute transition-all shadow-sm ${
                  isSecondVoiceMode ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Vocal Part Selector */}
          {!isSecondVoiceMode && (
            <div className="glass p-6 rounded-[2.5rem] border border-white/50 space-y-4 shadow-sm bg-white/50">
              <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Escolha a voz que vai estudar</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'unison', label: 'Melodia (1ª)' },
                  { value: 'second_voice', label: '2ª Voz' },
                  { value: 'soprano', label: 'Soprano' },
                  { value: 'contralto', label: 'Contralto' },
                  { value: 'tenor', label: 'Tenor' },
                  { value: 'bass', label: 'Baixo' },
                ].map(part => {
                  const hasGuide = tracks.some(t => t.track_type === 'vocal_guide' && t.vocal_part === part.value);
                  const isSelected = selectedVocalPart === part.value;
                  return (
                    <button
                      key={part.value}
                      onClick={() => setSelectedVocalPart(part.value)}
                      className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 scale-[1.02] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-100 hover:border-blue-100'
                      }`}
                    >
                      <span>{part.label}</span>
                      <span className={`text-[8px] mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-400'} font-semibold`}>
                        {hasGuide ? 'Com Guia' : 'Apenas Playback'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Picker (Trechos) */}
          <div className="glass p-6 rounded-[2.5rem] border border-white/50 space-y-4 shadow-sm bg-white/50">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider">Trecho da Música</label>
              {isMinister && (
                <button
                  onClick={() => setIsSectionFormOpen(true)}
                  className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Novo Trecho"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Section list */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar">
              {sections
                .filter(s => !isSecondVoiceMode || s.has_second_voice)
                .map(sec => {
                  const isSelected = selectedSection?.id === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setSelectedSection(sec);
                        if (playbackRef.current) playbackRef.current.currentTime = sec.start_time_seconds;
                        if (guideRef.current) guideRef.current.currentTime = sec.start_time_seconds;
                        setCurrentTime(sec.start_time_seconds);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                        isSelected
                          ? 'bg-[#00153d] text-white border-[#00153d] shadow-md'
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black">{sec.name}</p>
                        <p className={`text-[9px] mt-0.5 font-mono ${isSelected ? 'text-blue-300' : 'text-slate-400'}`}>
                          {sec.start_time_seconds}s - {sec.end_time_seconds}s
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sec.has_second_voice && (
                          <span className={`text-[8px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'} font-extrabold`}>
                            2ª VOZ
                          </span>
                        )}
                        {isMinister && (
                          <button
                            onClick={(e) => handleDeleteSection(sec.id, e)}
                            className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'text-red-400 hover:bg-white/10' : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </button>
                  );
                })}

              {sections.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 italic font-medium">Nenhum trecho de estudo cadastrado.</div>
              )}
            </div>
          </div>

        </div>

        {/* Center/Right Column: Player, Recorder, Lyrics & Submissions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Study player widget */}
          <StudyPlayer
            playbackUrl={playbackTrack?.file_url}
            guideUrl={guideTrack?.file_url}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            duration={duration}
            setDuration={setDuration}
            isLooping={isLooping}
            setIsLooping={setIsLooping}
            startTime={loopStartTime}
            endTime={loopEndTime}
            playbackVolume={playbackVolume}
            setPlaybackVolume={setPlaybackVolume}
            guideVolume={guideVolume}
            setGuideVolume={setGuideVolume}
            onAudioRefsReady={handleAudioRefsReady}
          />

          {/* Section details (Notes and Lyrics fragment) */}
          {selectedSection && (
            <div className="glass p-6 rounded-[2.5rem] border border-white/50 space-y-5 bg-white/70">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-[#00153d] uppercase tracking-wide">Foco de Prática: {selectedSection.name}</h4>
                {selectedSection.has_second_voice && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-black">TREINO SEGUNDA VOZ ATIVADO</span>
                )}
              </div>

              {/* Second voice notes */}
              {selectedSection.has_second_voice && selectedSection.second_voice_notes && (
                <div className="bg-amber-50/70 border border-amber-200/50 p-4 rounded-2xl text-xs leading-relaxed text-amber-900 font-bold space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Dica Vocálica do Líder:</p>
                  <p>{selectedSection.second_voice_notes}</p>
                </div>
              )}

              {/* Lyrics fragment */}
              {selectedSection.lyrics_fragment ? (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Trecho da Letra</p>
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-line text-sm font-semibold leading-loose text-center italic">
                    "{selectedSection.lyrics_fragment}"
                  </div>
                </div>
              ) : (
                <div className="py-2 text-xs text-slate-400 italic">Sem letra associada para este trecho.</div>
              )}
            </div>
          )}

          {/* Recorder Trigger / Recording Client */}
          {!isRecordingMode ? (
            <div className="glass p-8 rounded-[2.5rem] border border-white/50 bg-[#e0f2fe]/40 border-[#bae6fd]/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-lg font-headline font-black text-blue-950 flex items-center gap-2">
                  <Mic size={18} className="text-blue-600" /> Pratique e Grave Sua Voz
                </h4>
                <p className="text-xs text-blue-800/80 font-semibold leading-relaxed max-w-md">
                  Grave sua performance por cima do playback. Depois, ouça como ficou isolada ou mixada e envie para a avaliação do líder!
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsPlaying(false); // pause main player
                  setIsRecordingMode(true);
                }}
                disabled={!playbackTrack}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl font-bold text-xs shadow-md shadow-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 disabled:shadow-none"
              >
                <Mic size={16} />
                Iniciar Gravador
              </button>
            </div>
          ) : (
            <StudyRecorder
              playbackUrl={playbackTrack?.file_url}
              songTitle={song.title}
              vocalPart={selectedVocalPart}
              onSaveRecording={handleSaveRecording}
              isSaving={isSavingRecording}
              onCancel={() => setIsRecordingMode(false)}
              onStartPlayback={handleStartPlaybackForRecording}
              onStopPlayback={handleStopPlaybackForRecording}
            />
          )}

          {/* User Recording History / Leader Reviews */}
          <div className="glass p-6 rounded-[2.5rem] border border-white/50 space-y-4 bg-white/50">
            <h4 className="text-sm font-black text-[#00153d] uppercase tracking-wide">Minhas Gravações para esta música</h4>

            <div className="space-y-3">
              {recordings.map(rec => {
                const statusStyles = {
                  draft: 'bg-slate-100 text-slate-700 border-slate-200',
                  submitted: 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse',
                  reviewed: 'bg-purple-50 text-purple-700 border-purple-100',
                  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  redo_requested: 'bg-rose-50 text-rose-700 border-rose-100'
                }[rec.status];

                const statusLabel = {
                  draft: 'Rascunho',
                  submitted: 'Pendente Avaliação',
                  reviewed: 'Revisado',
                  approved: 'Aprovado',
                  redo_requested: 'Re-gravar'
                }[rec.status];

                return (
                  <div key={rec.id} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5">
                          <p className="text-xs font-black text-slate-800">
                            {rec.vocal_part === 'second_voice' ? 'Segunda Voz' : rec.vocal_part.toUpperCase()}
                          </p>
                          <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 border rounded-full ${statusStyles}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Gravado em: {new Date(rec.created_at || '').toLocaleDateString('pt-BR')} às {new Date(rec.created_at || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {rec.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitDraft(rec.id)}
                            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase transition-all"
                          >
                            Enviar p/ Líder
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecording(rec.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Excluir gravação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Audio Player for user recording */}
                    <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3">
                      <audio src={rec.audio_url} controls className="w-full h-8 accent-blue-600 focus:outline-none" />
                    </div>

                    {/* Show Leader Reviews if exist */}
                    {rec.status !== 'draft' && rec.status !== 'submitted' && (
                      <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-purple-700">
                          <MessageSquare size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider">Feedback do Líder</span>
                        </div>
                        
                        {/* We will write a small utility to fetch review details if needed, 
                            but since reviews are loaded in central state, we can simulate 
                            or query them, or display comments if we fetch them on demand. 
                            For local/Supabase ease, we'll implement a query or fetch reviews */}
                        <ReviewDetails recordingId={rec.id} />
                      </div>
                    )}

                  </div>
                );
              })}

              {recordings.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 italic font-semibold">Você ainda não gravou estudos para esta música.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Admin uploader modal */}
      {isUploaderOpen && (
        <StudyAudioUploader
          songId={song.id}
          onUploadSuccess={(newTrack) => {
            setTracks(prev => [...prev, newTrack]);
            toast.success('Áudio cadastrado!');
          }}
          onClose={() => setIsUploaderOpen(false)}
        />
      )}

      {/* Admin Section Form Modal */}
      {isSectionFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <form 
            onSubmit={handleAddSection}
            className="w-full max-w-lg bg-white rounded-[3rem] shadow-3xl border border-white p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-headline font-black text-[#00153d]">Configurar Novo Trecho</h3>
              <button 
                type="button" 
                onClick={() => setIsSectionFormOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Nome do Trecho</label>
                <input
                  type="text"
                  placeholder="Ex: Refrão Principal, Ponte"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Tempo Inicial (segundos)</label>
                  <input
                    type="number"
                    min="0"
                    value={newSectionStart}
                    onChange={(e) => setNewSectionStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Tempo Final (segundos)</label>
                  <input
                    type="number"
                    min="1"
                    value={newSectionEnd}
                    onChange={(e) => setNewSectionEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Letra deste Trecho (Opcional)</label>
                <textarea
                  placeholder="Coloque o fragmento da letra correspondente a este trecho..."
                  value={newSectionLyrics}
                  onChange={(e) => setNewSectionLyrics(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/30">
                <input
                  type="checkbox"
                  id="has2ndVoice"
                  checked={newSectionHas2ndVoice}
                  onChange={(e) => setNewSectionHas2ndVoice(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 accent-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="has2ndVoice" className="text-xs font-bold text-amber-900 cursor-pointer selection:bg-transparent select-none">
                  Trecho Importante para Treinar Segunda Voz / Vozes
                </label>
              </div>

              {newSectionHas2ndVoice && (
                <div className="space-y-1 animate-in slide-in-from-top-3 duration-200">
                  <label className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Notas específicas para a Segunda Voz</label>
                  <textarea
                    placeholder="Instruções de divisão de vozes, abertura de acordes, etc..."
                    value={newSection2ndVoiceNotes}
                    onChange={(e) => setNewSection2ndVoiceNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-amber-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsSectionFormOpen(false)}
                className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md transition-colors"
              >
                Criar Trecho
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// Inner helper component to load review details asynchronously
import { supabase, isConfigured } from '../../lib/supabase';
function ReviewDetails({ recordingId }: { recordingId: string }) {
  const [review, setReview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReview = async () => {
      try {
        if (!isConfigured) {
          const reviews = JSON.parse(localStorage.getItem('manancial_local_study_recording_reviews') || '[]');
          const rev = reviews.find((r: any) => r.recording_id === recordingId);
          setReview(rev || null);
        } else {
          const { data, error } = await supabase
            .from('study_recording_reviews')
            .select('*, profiles:reviewer_id(name)')
            .eq('recording_id', recordingId)
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) throw error;
          if (data && data.length > 0) {
            setReview({
              ...data[0],
              reviewer_name: data[0].profiles?.name
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void loadReview();
  }, [recordingId]);

  if (loading) return <div className="text-[10px] text-slate-400">Carregando feedback...</div>;
  if (!review) return <div className="text-xs text-slate-500 italic">Nenhum feedback detalhado encontrado.</div>;

  return (
    <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-semibold">
      <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
        <span>Por: {review.reviewer_name || 'Líder'}</span>
        {review.score !== undefined && review.score !== null && (
          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Nota: {review.score}/100</span>
        )}
      </div>
      <p className="bg-white/60 p-3 rounded-lg border border-slate-100">{review.comment}</p>
      
      {/* Mini tag indicators for feedback categories */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {review.pitch_feedback && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[0.25rem] text-[9px]">Afinação: {review.pitch_feedback}</span>}
        {review.timing_feedback && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[0.25rem] text-[9px]">Tempo: {review.timing_feedback}</span>}
        {review.diction_feedback && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[0.25rem] text-[9px]">Dicção: {review.diction_feedback}</span>}
        {review.breathing_feedback && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[0.25rem] text-[9px]">Respiração: {review.breathing_feedback}</span>}
      </div>
    </div>
  );
}
