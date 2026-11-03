import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  Save, 
  Trash2, 
  Headphones, 
  AlertCircle, 
  Volume2, 
  Music,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StudyRecorderProps {
  playbackUrl?: string;
  songTitle: string;
  vocalPart: string;
  onSaveRecording: (file: File, durationSeconds: number, submit: boolean) => Promise<void>;
  isSaving: boolean;
  onCancel: () => void;
  // Callback to play/pause parent audio in sync during recording
  onStartPlayback?: () => void;
  onStopPlayback?: () => void;
}

export default function StudyRecorder({
  playbackUrl,
  songTitle,
  vocalPart,
  onSaveRecording,
  isSaving,
  onCancel,
  onStartPlayback,
  onStopPlayback
}: StudyRecorderProps) {
  // Recording State
  const [permission, setPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'countdown' | 'recording' | 'finished'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // Result Playback State
  const [isPlayingResult, setIsPlayingResult] = useState(false);
  const [playWithPlayback, setPlayWithPlayback] = useState(false);
  const [resultTime, setResultTime] = useState(0);
  const [resultDuration, setResultDuration] = useState(0);
  const [recordingVolume, setRecordingVolume] = useState(0.8);
  const [playbackVolume, setPlaybackVolume] = useState(0.5);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Audio Refs for listening to results
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up streams and object URLs
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [stream, recordedUrl]);

  // Request Mic Permission
  const requestPermission = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      setStream(audioStream);
      setPermission(true);
      setRecordingState('idle');
    } catch (err) {
      console.error(err);
      setPermission(false);
      toast.error("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  // Start countdown process
  const startRecordingFlow = () => {
    if (!permission || !stream) {
      requestPermission();
      return;
    }
    setRecordingState('countdown');
    setCountdown(3);
  };

  // Handle countdown timer
  useEffect(() => {
    if (recordingState !== 'countdown') return;

    if (countdown > 0) {
      const timeout = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timeout);
    } else {
      startRecording();
    }
  }, [countdown, recordingState]);

  // Start MediaRecorder and synchronise playback
  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    setRecordingDuration(0);
    setRecordingState('recording');

    // Get supported mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setRecordingState('finished');
        
        // Stop playback
        if (onStopPlayback) onStopPlayback();
      };

      // Synchronised start
      if (onStartPlayback) onStartPlayback();
      mediaRecorder.start();

      // Start duration counter
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Erro ao iniciar gravador:", err);
      toast.error("Falha ao iniciar a gravação.");
      setRecordingState('idle');
      if (onStopPlayback) onStopPlayback();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle result playback controls
  const togglePlayResult = () => {
    setIsPlayingResult(!isPlayingResult);
  };

  useEffect(() => {
    if (recordingState !== 'finished') return;

    if (isPlayingResult) {
      void voiceAudioRef.current?.play();
      if (playWithPlayback && playbackUrl) {
        void playbackAudioRef.current?.play();
      }
    } else {
      voiceAudioRef.current?.pause();
      playbackAudioRef.current?.pause();
    }
  }, [isPlayingResult, playWithPlayback, recordingState, playbackUrl]);

  // Sync result playback volume
  useEffect(() => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.volume = recordingVolume;
    }
  }, [recordingVolume]);

  useEffect(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.volume = playbackVolume;
    }
  }, [playbackVolume]);

  // Synchronise playback time of voice and background tracks
  const handleVoiceTimeUpdate = () => {
    if (!voiceAudioRef.current) return;
    const time = voiceAudioRef.current.currentTime;
    setResultTime(time);

    // Minor adjustment to sync background if it drifts
    if (playWithPlayback && playbackAudioRef.current) {
      const diff = Math.abs(playbackAudioRef.current.currentTime - time);
      if (diff > 0.1) {
        playbackAudioRef.current.currentTime = time;
      }
    }
  };

  const handleVoiceLoadedMetadata = () => {
    if (voiceAudioRef.current) {
      setResultDuration(voiceAudioRef.current.duration);
    }
  };

  const handleVoiceEnded = () => {
    setIsPlayingResult(false);
    setResultTime(0);
    if (voiceAudioRef.current) voiceAudioRef.current.currentTime = 0;
    if (playbackAudioRef.current) playbackAudioRef.current.currentTime = 0;
  };

  // Save/Submit Recording
  const handleSave = async (submit: boolean) => {
    if (!recordedBlob) return;
    const extension = recordedBlob.type.includes('mp4') ? 'm4a' : 'webm';
    const file = new File([recordedBlob], `gravacao_${vocalPart}_${Date.now()}.${extension}`, {
      type: recordedBlob.type
    });
    
    const duration = Math.round(resultDuration) || recordingDuration;
    await onSaveRecording(file, duration, submit);
  };

  // Format seconds to text (00:00)
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render content based on states
  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-[3rem] p-8 shadow-inner relative overflow-hidden">
      
      {/* Visual background elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
      
      {/* 1. Request Permission State */}
      {permission === null && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner animate-pulse">
            <Mic size={32} />
          </div>
          <div className="space-y-2 max-w-sm">
            <h4 className="text-xl font-headline font-black text-[#00153d]">Gravação Vocal</h4>
            <p className="text-sm text-slate-500 font-medium">Precisamos acessar seu microfone para gravar sua voz. Garanta que está em um ambiente silencioso.</p>
          </div>
          
          {/* Headphones Warning */}
          <div className="flex items-start gap-3 bg-blue-50/75 border border-blue-100 rounded-2xl p-4 max-w-sm text-left">
            <Headphones size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-blue-900 uppercase tracking-wider">Aviso Importante</p>
              <p className="text-[11px] text-blue-700/80 font-medium mt-0.5 leading-relaxed">
                Use fones de ouvido durante a gravação para evitar que o som do playback vaze no microfone.
              </p>
            </div>
          </div>

          <button
            onClick={requestPermission}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            Permitir Microfone
          </button>
        </div>
      )}

      {/* 2. Permission Denied State */}
      {permission === false && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2 max-w-xs">
            <h4 className="text-lg font-bold text-slate-800">Acesso Negado</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Não foi possível acessar o microfone. Verifique as permissões do navegador para continuar.
            </p>
          </div>
          <button
            onClick={requestPermission}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-300 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* 3. Idle / Ready State */}
      {permission === true && recordingState === 'idle' && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Estudo Sincronizado</p>
            <h4 className="text-2xl font-headline font-black text-[#00153d]">Pronto para gravar</h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{vocalPart.replace('_', ' ')}</p>
          </div>

          {/* Headphones Warning */}
          <div className="flex items-center gap-3 bg-blue-50/75 border border-blue-100 rounded-2xl px-5 py-4 max-w-sm text-left">
            <Headphones size={20} className="text-blue-600 shrink-0" />
            <span className="text-xs text-blue-800 font-bold leading-tight">Recomendado usar fones de ouvido para gravação limpa.</span>
          </div>

          <button
            onClick={startRecordingFlow}
            className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-400 border-8 border-white shadow-2xl flex items-center justify-center text-white active:scale-95 transition-all group relative"
          >
            <span className="absolute -inset-2 rounded-full border border-red-500/30 animate-ping" />
            <Mic size={32} className="group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-xs font-bold text-slate-400">Clique para iniciar a contagem</span>
        </div>
      )}

      {/* 4. Countdown State */}
      {recordingState === 'countdown' && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-6xl font-headline font-black shadow-2xl border-4 border-white animate-pulse">
            {countdown}
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-6">Prepare-se para cantar...</p>
        </div>
      )}

      {/* 5. Recording State */}
      {recordingState === 'recording' && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">Gravando Voz</span>
            </div>
            <h4 className="text-4xl font-mono font-black text-[#00153d] tracking-tight">{formatTime(recordingDuration)}</h4>
          </div>

          {/* Sound Wave Micro-Animation */}
          <div className="flex items-center justify-center gap-1.5 h-16 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-red-600 to-orange-400 rounded-full transition-all duration-300"
                style={{
                  height: `${Math.max(10, Math.random() * 60)}%`,
                  animation: `bounce 1s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>

          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-white hover:bg-slate-50 border-4 border-slate-200 shadow-xl flex items-center justify-center text-red-600 active:scale-95 transition-all"
            title="Parar Gravação"
          >
            <Square size={24} fill="currentColor" />
          </button>
        </div>
      )}

      {/* 6. Finished/Result State */}
      {recordingState === 'finished' && (
        <div className="space-y-6">
          {/* Audio nodes for result playback */}
          {recordedUrl && (
            <audio
              ref={voiceAudioRef}
              src={recordedUrl}
              onTimeUpdate={handleVoiceTimeUpdate}
              onLoadedMetadata={handleVoiceLoadedMetadata}
              onEnded={handleVoiceEnded}
            />
          )}
          {playWithPlayback && playbackUrl && (
            <audio
              ref={playbackAudioRef}
              src={playbackUrl}
            />
          )}

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">Gravação Pronta</span>
              <h4 className="text-xl font-headline font-black text-[#00153d] mt-2 truncate max-w-[280px]">{songTitle}</h4>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{vocalPart.replace('_', ' ')}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-400">Duração</span>
              <p className="text-lg font-headline font-black text-[#00153d]">{formatTime(resultDuration || recordingDuration)}</p>
            </div>
          </div>

          {/* Result Player UI */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-4">
            
            {/* Play progress */}
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ width: `${(resultTime / (resultDuration || 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                <span>{formatTime(resultTime)}</span>
                <span>{formatTime(resultDuration)}</span>
              </div>
            </div>

            {/* Playback mode switcher */}
            <div className="flex items-center justify-between border-t border-b border-slate-50 py-3">
              <div className="flex items-center gap-2">
                <HelpCircle size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Ouvir junto com o playback instrumental?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPlayWithPlayback(!playWithPlayback);
                  // stop audio to prevent desync
                  setIsPlayingResult(false);
                  if (voiceAudioRef.current) voiceAudioRef.current.currentTime = 0;
                  if (playbackAudioRef.current) playbackAudioRef.current.currentTime = 0;
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
                  playWithPlayback 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/10' 
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {playWithPlayback ? <Music size={12} /> : <Mic size={12} />}
                {playWithPlayback ? 'Sim (Mixado)' : 'Não (Voz Solo)'}
              </button>
            </div>

            {/* Mixer Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vocal volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                  <span>Minha Voz</span>
                  <span>{Math.round(recordingVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={recordingVolume}
                  onChange={(e) => setRecordingVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>

              {/* Playback volume (only if enabled) */}
              <div className={`space-y-1 transition-opacity ${playWithPlayback ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                  <span>Playback Instrumental</span>
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
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Play control button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={togglePlayResult}
                className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-md"
              >
                {isPlayingResult ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                // reset to record again
                setRecordingState('idle');
                setRecordedBlob(null);
                setRecordedUrl(null);
                setIsPlayingResult(false);
              }}
              disabled={isSaving}
              className="flex-1 min-w-[120px] py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Regravar
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex-1 min-w-[120px] py-4 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-2xl font-bold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-amber-200/50 disabled:opacity-50"
            >
              <Save size={14} />
              Salvar Rascunho
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex-[2] min-w-[180px] py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/15 disabled:opacity-50"
            >
              <Send size={14} />
              Enviar para Avaliação
            </button>

            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-4 text-slate-400 hover:text-red-500 rounded-2xl hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-50"
              title="Descartar Gravação"
            >
              <Trash2 size={16} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
