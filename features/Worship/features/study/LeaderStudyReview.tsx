import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Play, 
  Pause, 
  Volume2, 
  Music, 
  Mic, 
  Star, 
  ArrowLeft,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { StudyRecording, StudyAudioTrack, StudyRecordingReview } from '../../types';
import { 
  fetchPendingStudyRecordingsForReview, 
  saveStudyRecordingReview, 
  fetchStudyAudioTracks 
} from '../../lib/appData';
import { toast } from 'react-hot-toast';

interface LeaderStudyReviewProps {
  onBack: () => void;
  reviewerId: string;
}

const FEEDBACK_LEVELS = [
  { value: 'excelente', label: 'Excelente' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'precisa_melhorar', label: 'Precisa Melhorar' },
];

export default function LeaderStudyReview({ onBack, reviewerId }: LeaderStudyReviewProps) {
  const [recordings, setRecordings] = useState<StudyRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<StudyRecording | null>(null);
  const [playbackTrack, setPlaybackTrack] = useState<StudyAudioTrack | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingPlayback, setIsLoadingPlayback] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playWithPlayback, setPlayWithPlayback] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [playbackVolume, setPlaybackVolume] = useState(0.5);

  // Form state
  const [score, setScore] = useState(80);
  const [status, setStatus] = useState<'approved' | 'redo_requested'>('approved');
  const [comment, setComment] = useState('');
  const [pitch, setPitch] = useState('excelente');
  const [timing, setTiming] = useState('excelente');
  const [diction, setDiction] = useState('excelente');
  const [breathing, setBreathing] = useState('excelente');
  const [harmony, setHarmony] = useState('excelente');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load pending submissions
  const loadList = async () => {
    setIsLoadingList(true);
    try {
      const pending = await fetchPendingStudyRecordingsForReview();
      setRecordings(pending);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar gravações pendentes.');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    void loadList();
  }, []);

  // Fetch playback track when a recording is selected
  useEffect(() => {
    if (!selectedRecording) {
      setPlaybackTrack(null);
      return;
    }

    const loadPlayback = async () => {
      setIsLoadingPlayback(true);
      try {
        const tracks = await fetchStudyAudioTracks(selectedRecording.song_id);
        const pb = tracks.find(t => t.track_type === 'playback');
        setPlaybackTrack(pb || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingPlayback(false);
      }
    };

    setIsPlaying(false);
    setPlayWithPlayback(false);
    setCurrentTime(0);
    setDuration(0);
    void loadPlayback();
  }, [selectedRecording]);

  // Synchronized playback controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!selectedRecording) return;

    if (isPlaying) {
      void voiceAudioRef.current?.play();
      if (playWithPlayback && playbackTrack) {
        void playbackAudioRef.current?.play();
      }
    } else {
      voiceAudioRef.current?.pause();
      playbackAudioRef.current?.pause();
    }
  }, [isPlaying, playWithPlayback, selectedRecording, playbackTrack]);

  // Sync volumes
  useEffect(() => {
    if (voiceAudioRef.current) voiceAudioRef.current.volume = voiceVolume;
  }, [voiceVolume]);

  useEffect(() => {
    if (playbackAudioRef.current) playbackAudioRef.current.volume = playbackVolume;
  }, [playbackVolume]);

  const handleVoiceTimeUpdate = () => {
    if (!voiceAudioRef.current) return;
    const time = voiceAudioRef.current.currentTime;
    setCurrentTime(time);

    // Sync playback
    if (playWithPlayback && playbackAudioRef.current) {
      const diff = Math.abs(playbackAudioRef.current.currentTime - time);
      if (diff > 0.1) {
        playbackAudioRef.current.currentTime = time;
      }
    }
  };

  const handleVoiceLoadedMetadata = () => {
    if (voiceAudioRef.current) {
      setDuration(voiceAudioRef.current.duration);
    }
  };

  const handleVoiceEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (voiceAudioRef.current) voiceAudioRef.current.currentTime = 0;
    if (playbackAudioRef.current) playbackAudioRef.current.currentTime = 0;
  };

  // Submit Review Form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecording) return;
    if (!comment) {
      toast.error('Feedback geral é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveStudyRecordingReview({
        recording_id: selectedRecording.id,
        reviewer_id: reviewerId,
        score,
        status: status === 'approved' ? 'approved' : 'redo_requested',
        comment,
        pitch_feedback: pitch,
        timing_feedback: timing,
        diction_feedback: diction,
        breathing_feedback: breathing,
        harmony_feedback: harmony
      });

      toast.success('Avaliação enviada com sucesso!');
      
      // Remove reviewed recording from list
      setRecordings(prev => prev.filter(r => r.id !== selectedRecording.id));
      setSelectedRecording(null);
      
      // Reset form
      setComment('');
      setScore(80);
      setStatus('approved');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoadingList) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00153d]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      
      {/* Header */}
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-3xl font-headline font-black text-[#00153d] tracking-tight">Avaliação de Estudos</h2>
          <p className="text-xs font-semibold text-slate-400">Analise os estudos enviados pela equipe vocal</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of submissions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-6 rounded-[2.5rem] border border-white/50 bg-white/50 space-y-4">
            <h3 className="text-sm font-black text-[#00153d] uppercase tracking-wider">Gravações Pendentes ({recordings.length})</h3>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
              {recordings.map(rec => {
                const isSelected = selectedRecording?.id === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecording(rec)}
                    className={`w-full p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#00153d] text-white border-[#00153d] shadow-lg'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-500/20 text-blue-200' : 'bg-blue-50 text-blue-700'}`}>
                        {rec.vocal_part === 'second_voice' ? 'Segunda Voz' : rec.vocal_part.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {new Date(rec.created_at || '').toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black truncate max-w-[200px]">{rec.user_name || 'Vocalista'}</h4>
                      <p className={`text-xs ${isSelected ? 'text-blue-200' : 'text-slate-500'} font-semibold truncate max-w-[200px]`}>
                        {rec.song_title || 'Música'}
                      </p>
                    </div>
                  </button>
                );
              })}

              {recordings.length === 0 && (
                <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <CheckCircle size={36} className="text-emerald-500" />
                  <p className="text-xs font-bold uppercase tracking-wider">Tudo em dia!</p>
                  <p className="text-[11px] text-slate-400 font-semibold max-w-[180px]">Não há nenhuma gravação aguardando revisão no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Recording detail and Review Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRecording ? (
            <div className="space-y-6">
              
              {/* Synchronized Player */}
              <div className="bg-[#00153d] text-white rounded-[2.5rem] p-6 shadow-xl border border-white/10 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                
                {/* Audio Nodes */}
                <audio
                  ref={voiceAudioRef}
                  src={selectedRecording.audio_url}
                  onTimeUpdate={handleVoiceTimeUpdate}
                  onLoadedMetadata={handleVoiceLoadedMetadata}
                  onEnded={handleVoiceEnded}
                />
                {playWithPlayback && playbackTrack && (
                  <audio
                    ref={playbackAudioRef}
                    src={playbackTrack.file_url}
                  />
                )}

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-300">Escuta Sincronizada</span>
                    <h3 className="text-2xl font-headline font-black tracking-tight mt-1">{selectedRecording.user_name}</h3>
                    <p className="text-xs text-blue-200 font-semibold mt-0.5">{selectedRecording.song_title} ({selectedRecording.vocal_part === 'second_voice' ? 'Segunda Voz' : selectedRecording.vocal_part.toUpperCase()})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-blue-300 font-mono">Duração</span>
                    <p className="text-lg font-headline font-black">{formatTime(duration)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 relative z-10">
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full" 
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-blue-300/60 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Mixing switch */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-2xl relative z-10">
                  <span className="text-xs font-bold text-blue-200">Escutar voz mixada com o playback?</span>
                  
                  {isLoadingPlayback ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Loader2 size={12} className="animate-spin" /> Carregando Playback...
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!playbackTrack}
                      onClick={() => {
                        setPlayWithPlayback(!playWithPlayback);
                        setIsPlaying(false);
                        if (voiceAudioRef.current) voiceAudioRef.current.currentTime = 0;
                        if (playbackAudioRef.current) playbackAudioRef.current.currentTime = 0;
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
                        playWithPlayback 
                          ? 'bg-cyan-400 text-blue-950 border-cyan-400 shadow-md shadow-cyan-400/20' 
                          : 'bg-white/5 text-blue-200 border-white/10 hover:bg-white/10'
                      } disabled:opacity-30`}
                    >
                      {playWithPlayback ? 'Mix Ativo' : 'Apenas Voz'}
                    </button>
                  )}
                </div>

                {/* Volume Sliders */}
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black text-blue-300/60 uppercase">
                      <span>Volume da Voz</span>
                      <span>{Math.round(voiceVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={voiceVolume}
                      onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className={`space-y-1 transition-all ${playWithPlayback ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <div className="flex justify-between text-[9px] font-black text-blue-300/60 uppercase">
                      <span>Volume do Playback</span>
                      <span>{Math.round(playbackVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={playbackVolume}
                      onChange={(e) => setPlaybackVolume(parseFloat(e.target.value))}
                      disabled={!playWithPlayback}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-2 relative z-10">
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-cyan-400 text-blue-950 flex items-center justify-center hover:bg-cyan-300 active:scale-95 transition-all shadow-md shadow-cyan-400/10"
                  >
                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                  </button>
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleSubmitReview} className="glass p-6 rounded-[2.5rem] border border-white/50 bg-white/50 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <MessageSquare size={18} className="text-blue-600" />
                  <h4 className="text-sm font-black text-[#00153d] uppercase tracking-wider">Ficha de Avaliação Vocal</h4>
                </div>

                {/* Score and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Status selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Parecer Final</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setStatus('approved')}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                          status === 'approved'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 scale-[1.02]'
                            : 'border-slate-100 hover:border-emerald-100 text-slate-500'
                        }`}
                      >
                        <CheckCircle size={16} className={status === 'approved' ? 'text-emerald-600' : 'text-slate-400'} />
                        Aprovado
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('redo_requested')}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                          status === 'redo_requested'
                            ? 'border-rose-500 bg-rose-50/50 text-rose-800 scale-[1.02]'
                            : 'border-slate-100 hover:border-rose-100 text-slate-500'
                        }`}
                      >
                        <XCircle size={16} className={status === 'redo_requested' ? 'text-rose-600' : 'text-slate-400'} />
                        Re-gravar
                      </button>
                    </div>
                  </div>

                  {/* Score rating */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-[#00153d] uppercase tracking-wider">
                      <span>Nota Técnica</span>
                      <span className="text-blue-600 font-mono text-sm">{score}/100</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star size={16} className="text-amber-500 shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Parameters specific feedback */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Critérios Vocais Detalhados</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50/75 p-5 rounded-[2rem] border border-slate-100">
                    {/* Pitch */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Afinação</span>
                      <select value={pitch} onChange={(e) => setPitch(e.target.value)} className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500">
                        {FEEDBACK_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                    
                    {/* Timing */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Tempo / Ritmo</span>
                      <select value={timing} onChange={(e) => setTiming(e.target.value)} className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500">
                        {FEEDBACK_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>

                    {/* Diction */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Dicção / Pronúncia</span>
                      <select value={diction} onChange={(e) => setDiction(e.target.value)} className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500">
                        {FEEDBACK_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>

                    {/* Breathing */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Respiração / Fraseado</span>
                      <select value={breathing} onChange={(e) => setBreathing(e.target.value)} className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500">
                        {FEEDBACK_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>

                    {/* Harmony/2nd voice */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Harmonia / 2ª Voz</span>
                      <select value={harmony} onChange={(e) => setHarmony(e.target.value)} className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500">
                        {FEEDBACK_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Review Text comment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Feedback Geral e Instruções</label>
                  <textarea
                    placeholder="Escreva dicas de postura, posicionamento da voz, respiração ou pontos de melhora nesta música..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecording(null)}
                    disabled={isSubmitting}
                    className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment}
                    className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Enviando Feedback...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} /> Enviar Avaliação
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="py-20 text-center glass rounded-[3rem] border border-white/50 shadow-sm flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Calendar size={48} className="text-slate-200" />
              <h3 className="text-xl font-headline font-black text-[#00153d]">Selecione uma gravação</h3>
              <p className="text-xs text-slate-500 max-w-xs font-semibold leading-relaxed">Selecione uma das gravações vocais pendentes à esquerda para analisar, escutar e enviar o feedback.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
