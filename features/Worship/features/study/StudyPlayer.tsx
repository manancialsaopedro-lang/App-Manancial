import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Repeat, 
  SkipBack, 
  SkipForward, 
  Info
} from 'lucide-react';

interface StudyPlayerProps {
  playbackUrl?: string;
  guideUrl?: string;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  isLooping: boolean;
  setIsLooping: (looping: boolean) => void;
  startTime?: number; // for section study
  endTime?: number; // for section study
  playbackVolume: number;
  setPlaybackVolume: (volume: number) => void;
  guideVolume: number;
  setGuideVolume: (volume: number) => void;
  onAudioRefsReady?: (playbackRef: HTMLAudioElement | null, guideRef: HTMLAudioElement | null) => void;
}

export default function StudyPlayer({
  playbackUrl,
  guideUrl,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  duration,
  setDuration,
  isLooping,
  setIsLooping,
  startTime = 0,
  endTime,
  playbackVolume,
  setPlaybackVolume,
  guideVolume,
  setGuideVolume,
  onAudioRefsReady
}: StudyPlayerProps) {
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const guideAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaybackMuted, setIsPlaybackMuted] = useState(false);
  const [isGuideMuted, setIsGuideMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Expose refs to parent if needed (e.g. for synchronized recording start)
  useEffect(() => {
    if (onAudioRefsReady) {
      onAudioRefsReady(playbackAudioRef.current, guideAudioRef.current);
    }
    return () => {
      if (onAudioRefsReady) {
        onAudioRefsReady(null, null);
      }
    };
  }, [onAudioRefsReady]);

  // Sync isPlaying state to actual HTML elements
  useEffect(() => {
    const playAudio = async () => {
      try {
        const promises = [];
        if (isPlaying) {
          setIsBuffering(true);
          // Play playback track if url exists
          if (playbackAudioRef.current && playbackUrl) {
            promises.push(playbackAudioRef.current.play());
          }
          // Play guide track if url exists
          if (guideAudioRef.current && guideUrl) {
            promises.push(guideAudioRef.current.play());
          }
          await Promise.all(promises);
          setIsBuffering(false);
        } else {
          if (playbackAudioRef.current) playbackAudioRef.current.pause();
          if (guideAudioRef.current) guideAudioRef.current.pause();
        }
      } catch (err) {
        console.error("Erro ao reproduzir áudio:", err);
        setIsPlaying(false);
        setIsBuffering(false);
      }
    };
    void playAudio();
  }, [isPlaying, playbackUrl, guideUrl, setIsPlaying]);

  // Sync volumes and mute states
  useEffect(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.volume = isPlaybackMuted ? 0 : playbackVolume;
    }
  }, [playbackVolume, isPlaybackMuted]);

  useEffect(() => {
    if (guideAudioRef.current) {
      guideAudioRef.current.volume = isGuideMuted ? 0 : guideVolume;
    }
  }, [guideVolume, isGuideMuted]);

  // Reset audio elements on url change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (playbackAudioRef.current) {
      playbackAudioRef.current.load();
    }
    if (guideAudioRef.current) {
      guideAudioRef.current.load();
    }
  }, [playbackUrl, guideUrl]);

  // Sync currentTime when it's updated from the slide progress bar
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    
    if (playbackAudioRef.current) {
      playbackAudioRef.current.currentTime = targetTime;
    }
    if (guideAudioRef.current) {
      guideAudioRef.current.currentTime = targetTime;
    }
  };

  // Sync playback time update to parent state
  const handleTimeUpdate = () => {
    if (!playbackAudioRef.current) return;
    const time = playbackAudioRef.current.currentTime;
    
    // Looping logic
    const limitEnd = endTime !== undefined && endTime > 0 ? endTime : duration;
    const startOffset = startTime !== undefined ? startTime : 0;
    
    if (isLooping && time >= limitEnd) {
      playbackAudioRef.current.currentTime = startOffset;
      if (guideAudioRef.current) {
        guideAudioRef.current.currentTime = startOffset;
      }
      setCurrentTime(startOffset);
      
      // Auto replay if playing
      if (isPlaying) {
        playbackAudioRef.current.play().catch(console.error);
        if (guideAudioRef.current && guideUrl) {
          guideAudioRef.current.play().catch(console.error);
        }
      }
    } else {
      setCurrentTime(time);
    }
  };

  // Handle meta data load to update song duration
  const handleLoadedMetadata = () => {
    if (playbackAudioRef.current) {
      setDuration(playbackAudioRef.current.duration);
    } else if (guideAudioRef.current) {
      setDuration(guideAudioRef.current.duration);
    }
  };

  // Track ended logic
  const handleAudioEnded = () => {
    if (isLooping) {
      const startOffset = startTime !== undefined ? startTime : 0;
      if (playbackAudioRef.current) playbackAudioRef.current.currentTime = startOffset;
      if (guideAudioRef.current) guideAudioRef.current.currentTime = startOffset;
      setCurrentTime(startOffset);
      if (isPlaying) {
        playbackAudioRef.current?.play().catch(console.error);
        if (guideAudioRef.current && guideUrl) {
          guideAudioRef.current.play().catch(console.error);
        }
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      if (playbackAudioRef.current) playbackAudioRef.current.currentTime = 0;
      if (guideAudioRef.current) guideAudioRef.current.currentTime = 0;
    }
  };

  // Quick seek function (-5s / +5s)
  const handleSeek = (direction: 'back' | 'forward') => {
    let targetTime = currentTime;
    if (direction === 'back') {
      targetTime = Math.max(startTime, currentTime - 5);
    } else {
      const limitEnd = endTime !== undefined && endTime > 0 ? endTime : duration;
      targetTime = Math.min(limitEnd, currentTime + 5);
    }

    setCurrentTime(targetTime);
    if (playbackAudioRef.current) playbackAudioRef.current.currentTime = targetTime;
    if (guideAudioRef.current) guideAudioRef.current.currentTime = targetTime;
  };

  // Format time (00:00)
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '00:00';
    const minutes = Math.floor(timeInSecs / 60);
    const seconds = Math.floor(timeInSecs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#00153d] to-blue-950 text-white rounded-[2.5rem] p-6 shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Hidden Audio Elements */}
      {playbackUrl && (
        <audio
          ref={playbackAudioRef}
          src={playbackUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          preload="auto"
        />
      )}
      {guideUrl && (
        <audio
          ref={guideAudioRef}
          src={guideUrl}
          onLoadedMetadata={!playbackUrl ? handleLoadedMetadata : undefined}
          onEnded={!playbackUrl ? handleAudioEnded : undefined}
          preload="auto"
        />
      )}

      {/* Main Player UI */}
      <div className="space-y-6">
        
        {/* Track info & Loop Alert */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
              {playbackUrl && guideUrl ? 'Mix: Playback + Guia Vocal' : playbackUrl ? 'Apenas Playback' : guideUrl ? 'Apenas Guia Vocal' : 'Selecione uma faixa acima'}
            </span>
          </div>
          {endTime !== undefined && endTime > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-900/40 text-blue-200 px-3 py-1 rounded-full border border-blue-800/50 text-[10px] font-bold">
              <Info size={12} className="text-cyan-400" />
              Trecho: {formatTime(startTime)} até {formatTime(endTime)}
            </div>
          )}
        </div>

        {/* Progress bar and time labels */}
        <div className="space-y-2">
          <input
            type="range"
            min={startTime}
            max={endTime !== undefined && endTime > 0 ? endTime : (duration || 100)}
            value={currentTime}
            onChange={handleProgressChange}
            disabled={!playbackUrl && !guideUrl}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #22d3ee ${((currentTime - startTime) / ((endTime !== undefined && endTime > 0 ? endTime : duration || 100) - startTime)) * 100}%, rgba(255,255,255,0.2) 0%)`
            }}
          />
          <div className="flex justify-between text-xs font-semibold text-blue-200/70 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(endTime !== undefined && endTime > 0 ? endTime : duration)}</span>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Left: Volume Mixing */}
          <div className="space-y-3 order-2 md:order-1">
            {/* Playback Volume */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPlaybackMuted(!isPlaybackMuted)} 
                className="text-blue-300 hover:text-white transition-colors"
                title="Mutar Playback"
              >
                {isPlaybackMuted || playbackVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between text-[9px] font-black uppercase text-blue-300/60 mb-0.5">
                  <span>Playback</span>
                  <span>{isPlaybackMuted ? 'MUTE' : `${Math.round(playbackVolume * 100)}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={playbackVolume}
                  onChange={(e) => setPlaybackVolume(parseFloat(e.target.value))}
                  disabled={!playbackUrl}
                  className="h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none disabled:opacity-30"
                />
              </div>
            </div>

            {/* Vocal Guide Volume */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsGuideMuted(!isGuideMuted)} 
                className="text-blue-300 hover:text-white transition-colors"
                title="Mutar Guia Vocal"
              >
                {isGuideMuted || guideVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between text-[9px] font-black uppercase text-blue-300/60 mb-0.5">
                  <span>Guia Vocal</span>
                  <span>{isGuideMuted ? 'MUTE' : `${Math.round(guideVolume * 100)}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={guideVolume}
                  onChange={(e) => setGuideVolume(parseFloat(e.target.value))}
                  disabled={!guideUrl}
                  className="h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none disabled:opacity-30"
                />
              </div>
            </div>
          </div>

          {/* Center: Play / Pause / Rewind */}
          <div className="flex items-center justify-center gap-5 order-1 md:order-2">
            <button
              onClick={() => handleSeek('back')}
              disabled={!playbackUrl && !guideUrl}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-blue-200 hover:text-white active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Voltar 5 segundos"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={(!playbackUrl && !guideUrl) || isBuffering}
              className="w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center text-blue-950 active:scale-95 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-4 border-blue-950 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button
              onClick={() => handleSeek('forward')}
              disabled={!playbackUrl && !guideUrl}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-blue-200 hover:text-white active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Avançar 5 segundos"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Right: Loop Actions */}
          <div className="flex items-center justify-center md:justify-end gap-3 order-3">
            <button
              onClick={() => {
                if (playbackAudioRef.current) playbackAudioRef.current.currentTime = startTime;
                if (guideAudioRef.current) guideAudioRef.current.currentTime = startTime;
                setCurrentTime(startTime);
              }}
              disabled={!playbackUrl && !guideUrl}
              className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-blue-200 hover:text-white rounded-2xl active:scale-95 transition-all border border-white/5 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold"
              title="Reiniciar Trecho"
            >
              <RotateCcw size={14} />
              Reiniciar
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              disabled={!playbackUrl && !guideUrl}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl active:scale-95 transition-all border text-xs font-bold ${
                isLooping
                  ? 'bg-cyan-400 text-blue-950 border-cyan-400 font-extrabold shadow-md shadow-cyan-400/20'
                  : 'bg-white/5 text-blue-200 hover:text-white border-white/5 hover:bg-white/10'
              } disabled:opacity-30 disabled:pointer-events-none`}
              title="Repetir Trecho"
            >
              <Repeat size={14} />
              Looping
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
