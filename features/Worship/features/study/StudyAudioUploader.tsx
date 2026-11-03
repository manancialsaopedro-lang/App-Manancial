import React, { useState } from 'react';
import { Upload, X, Music, Mic, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadStudyAudioTrack } from '../../lib/appData';
import { StudyAudioTrack } from '../../types';

interface StudyAudioUploaderProps {
  songId: string;
  onUploadSuccess: (track: StudyAudioTrack) => void;
  onClose: () => void;
}

const VOCAL_PARTS = [
  { value: 'first_voice', label: 'Primeira Voz / Melodia' },
  { value: 'second_voice', label: 'Segunda Voz' },
  { value: 'tenor', label: 'Tenor' },
  { value: 'contralto', label: 'Contralto' },
  { value: 'soprano', label: 'Soprano' },
  { value: 'bass', label: 'Baixo' },
  { value: 'unison', label: 'Uníssono' },
];

export default function StudyAudioUploader({ songId, onUploadSuccess, onClose }: StudyAudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [trackType, setTrackType] = useState<'playback' | 'vocal_guide'>('playback');
  const [vocalPart, setVocalPart] = useState<string>('second_voice');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Por favor, selecione um arquivo de áudio válido (MP3, WAV, M4A, etc.)');
        setFile(null);
        return;
      }
      // Check file size (limit to 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('O arquivo excede o limite máximo de 50MB.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo de áudio primeiro.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const selectedVocalPart = trackType === 'vocal_guide' ? vocalPart : undefined;
      const uploadedTrack = await uploadStudyAudioTrack(
        songId,
        file,
        trackType,
        selectedVocalPart
      );

      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess(uploadedTrack);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao enviar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white/95 rounded-[3rem] shadow-3xl border border-white p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <button 
          onClick={onClose} 
          disabled={isUploading}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Upload size={24} />
          </div>
          <div>
            <h3 className="text-xl font-headline font-black text-[#00153d]">Enviar Faixa de Estudo</h3>
            <p className="text-xs font-semibold text-slate-400">Adicione arquivos de áudio para prática da equipe</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle size={36} className="animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Envio Concluído!</h4>
            <p className="text-sm text-slate-500 max-w-xs">A trilha de áudio foi salva no storage e sincronizada no banco com sucesso.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Track Type selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Tipo de Áudio</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTrackType('playback')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                    trackType === 'playback'
                      ? 'border-[#00153d] bg-blue-50/50 text-[#00153d] scale-[1.02]'
                      : 'border-slate-100 hover:border-blue-100 hover:bg-blue-50/10 text-slate-500'
                  }`}
                >
                  <Music size={18} />
                  Playback Instrumento
                </button>
                <button
                  type="button"
                  onClick={() => setTrackType('vocal_guide')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                    trackType === 'vocal_guide'
                      ? 'border-[#00153d] bg-blue-50/50 text-[#00153d] scale-[1.02]'
                      : 'border-slate-100 hover:border-blue-100 hover:bg-blue-50/10 text-slate-500'
                  }`}
                >
                  <Mic size={18} />
                  Guia Vocal
                </button>
              </div>
            </div>

            {/* Vocal part selection (only if vocal_guide) */}
            {trackType === 'vocal_guide' && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Parte Vocal / Voz</label>
                <select
                  value={vocalPart}
                  onChange={(e) => setVocalPart(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {VOCAL_PARTS.map((part) => (
                    <option key={part.value} value={part.value}>{part.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* File Drag n Drop */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#00153d] uppercase tracking-wider block">Arquivo de Áudio</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-6 hover:bg-slate-50/50 hover:border-blue-300 transition-colors flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <Music size={24} />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[280px]">{file.name}</p>
                    <p className="text-xs text-slate-400 font-semibold">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-slate-700">Clique para selecionar</p>
                    <p className="text-xs text-slate-400 mt-1">Formatos suportados: MP3, WAV, M4A (Max 50MB)</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 text-xs font-semibold">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !file}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Enviar Trilha
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
