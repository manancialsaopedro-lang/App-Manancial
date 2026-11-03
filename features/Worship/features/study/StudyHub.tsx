import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Calendar, 
  ExternalLink, 
  Youtube, 
  FileText, 
  Mic2, 
  Clock, 
  ChevronRight, 
  Play,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  Sliders,
  Award,
  ListCollapse,
  Volume2
} from 'lucide-react';
import { Song, WorshipEvent, Profile, UserSongStudy, StudyAudioTrack } from '../../types';
import { BackButton } from '../../components/BackButton';
import { formatDashboardDate } from '../../lib/dateUtils';
import { isLeadership } from '../../lib/permissions';
import { fetchAllStudyAudioTracks } from '../../lib/appData';
import StudySongDetail from './StudySongDetail';
import LeaderStudyReview from './LeaderStudyReview';

interface StudyHubProps {
  songs: Song[];
  events: WorshipEvent[];
  userProfile: Profile | null;
  userSongStudy: UserSongStudy[];
  onToggleStudySong: (songId: string) => Promise<void>;
  onUpdateStudyStatus: (studyId: string, isCompleted: boolean) => Promise<void>;
  onSelectSong: (id: string) => void;
  onBack: () => void;
}

type TabType = 'events' | 'repertoire';

export default function StudyHub({ 
  songs, 
  events, 
  userProfile, 
  userSongStudy, 
  onToggleStudySong, 
  onUpdateStudyStatus,
  onSelectSong,
  onBack 
}: StudyHubProps) {
  // Navigation State
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // Library State
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [allTracks, setAllTracks] = useState<StudyAudioTrack[]>([]);

  // Load all tracks on mount to check which songs have playbacks/guides
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const tracksList = await fetchAllStudyAudioTracks();
        setAllTracks(tracksList);
      } catch (err) {
        console.error("Erro ao carregar trilhas para biblioteca:", err);
      }
    };
    void loadTracks();
  }, [selectedSong, isReviewMode]); // reload when returning from detail/review

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.date + 'T' + e.time) >= new Date())
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
      .slice(0, 5);
  }, [events]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    upcomingEvents.length > 0 ? upcomingEvents[0].id : null
  );

  const selectedEvent = useMemo(() => {
    return upcomingEvents.find(e => e.id === selectedEventId) || null;
  }, [upcomingEvents, selectedEventId]);

  const eventSongsList = useMemo(() => {
    if (!selectedEvent) return [];
    const songIds = [
      ...(selectedEvent.songs || []),
      ...(selectedEvent.offeringSongs || []),
      ...(selectedEvent.outroSongs || [])
    ];
    return songs.filter(s => songIds.includes(s.id));
  }, [selectedEvent, songs]);

  // All Songs filtered by Search
  const filteredAllSongs = useMemo(() => {
    if (!searchQuery) return songs;
    const query = searchQuery.toLowerCase().trim();
    return songs.filter(s => 
      s.title.toLowerCase().includes(query) || 
      s.artist.toLowerCase().includes(query) || 
      s.key.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const isStudying = (songId: string) => userSongStudy.find(s => s.song_id === songId);
  const isLeader = isLeadership(userProfile);

  // Helper to check what study assets a song has
  const getStudyStatus = (songId: string) => {
    const songTracks = allTracks.filter(t => t.song_id === songId);
    const hasPlayback = songTracks.some(t => t.track_type === 'playback');
    const has2ndVoice = songTracks.some(t => t.track_type === 'vocal_guide' && t.vocal_part === 'second_voice');
    const guideCount = songTracks.filter(t => t.track_type === 'vocal_guide').length;
    
    return { hasPlayback, has2ndVoice, guideCount };
  };

  // If in Review Mode (Leader Review panel)
  if (isReviewMode && userProfile) {
    return (
      <LeaderStudyReview
        reviewerId={userProfile.id}
        onBack={() => setIsReviewMode(false)}
      />
    );
  }

  // If a song is selected (Study song details page)
  if (selectedSong) {
    return (
      <StudySongDetail
        song={selectedSong}
        userProfile={userProfile}
        isMinister={isLeader}
        onBack={() => setSelectedSong(null)}
      />
    );
  }

  return (
    <div className="space-y-10 pb-32">
      <header className="space-y-6">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
           className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <BackButton onClick={onBack} />
            <div className="mt-4 flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00153d] to-blue-800 rounded-3xl flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                 <BookOpen size={32} className="relative z-10" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Prática & Louvor</p>
                <h2 className="text-4xl font-headline font-extrabold text-[#00153d] tracking-tight">Ambiente de Estudo</h2>
              </div>
            </div>
          </div>

          {/* Leader Review button */}
          {isLeader && (
            <button
              onClick={() => setIsReviewMode(true)}
              className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-2 shrink-0 md:self-end"
            >
              <Award size={16} />
              Avaliar Gravações
            </button>
          )}
        </motion.div>

        {/* Tab switchers: Upcoming Events vs All Repertoire */}
        <div className="flex border-b border-slate-100 pb-1">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'events'
                ? 'border-[#00153d] text-[#00153d]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Músicas dos Próximos Cultos
          </button>
          <button
            onClick={() => setActiveTab('repertoire')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'repertoire'
                ? 'border-[#00153d] text-[#00153d]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Todo o Repertório
          </button>
        </div>

        {/* Events Sub-Selector (Only on Events Tab) */}
        {activeTab === 'events' && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            {upcomingEvents.map((event) => {
               const dateInfo = formatDashboardDate(event.date);
               const isActive = selectedEventId === event.id;
               return (
                 <button
                   key={event.id}
                   onClick={() => setSelectedEventId(event.id)}
                   className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] font-bold text-sm whitespace-nowrap transition-all border shrink-0 ${
                     isActive 
                       ? 'bg-[#00153d] text-white border-[#00153d] shadow-xl shadow-blue-900/20 scale-105' 
                       : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                   }`}
                 >
                   <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center ${isActive ? 'bg-white/20' : 'bg-slate-50'}`}>
                      <span className="text-[8px] uppercase font-black opacity-60 leading-none">{dateInfo.month.slice(0, 3)}</span>
                      <span className={`text-lg font-black leading-none ${isActive ? 'text-white' : 'text-[#00153d]'}`}>{dateInfo.day}</span>
                   </div>
                   <div className="text-left">
                     <p className={`text-[10px] font-black uppercase tracking-wider opacity-60 ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                       {event.type === 'service' ? 'Culto' : 'Ensaio'}
                     </p>
                     <p className="text-sm font-bold truncate max-w-[120px]">{event.title}</p>
                   </div>
                 </button>
               );
            })}
            {upcomingEvents.length === 0 && (
              <div className="text-slate-400 italic py-4">Nenhum evento agendado para estudo.</div>
            )}
          </div>
        )}

        {/* Search bar (Only on Repertoire Tab) */}
        {activeTab === 'repertoire' && (
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar música por título, artista ou tom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:border-blue-500 focus:shadow-md transition-all"
            />
          </div>
        )}
      </header>

      {/* Grid of Songs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
        
        {/* Render Tab Contents */}
        {activeTab === 'events' ? (
          eventSongsList.map((song, index) => {
            const study = isStudying(song.id);
            const { hasPlayback, has2ndVoice, guideCount } = getStudyStatus(song.id);
            return (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`group glass p-8 rounded-[3rem] border transition-all duration-500 relative overflow-hidden ${
                  study?.is_completed ? 'bg-emerald-50/30 border-emerald-100/50' : 'border-white/50 hover:bg-white hover:shadow-2xl'
                }`}
              >
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-lg border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                      {song.cover_url ? (
                        <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                          <Music size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2 py-1">
                      <div className="flex justify-between items-start">
                         <h4 className="text-xl font-headline font-black text-[#00153d] group-hover:text-blue-700 transition-colors cursor-pointer" onClick={() => setSelectedSong(song)}>
                           {song.title}
                         </h4>
                         {study?.is_completed && <CheckCircle2 size={24} className="text-emerald-500 animate-in zoom-in" />}
                      </div>
                      <p className="text-slate-500 font-medium">{song.artist}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                         <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">
                           Banda: {song.key}
                         </div>
                         
                         {/* Playback Indicator Badge */}
                         {hasPlayback ? (
                           <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                             <Volume2 size={10} /> Playback
                           </div>
                         ) : (
                           song.vocalUrl && (
                             <div className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-xl text-[10px] font-black uppercase">
                               Vocal Link
                             </div>
                           )
                         )}

                         {/* Second voice indicator */}
                         {has2ndVoice && (
                           <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-1">
                             <Sparkles size={10} /> 2ª Voz
                           </div>
                         )}

                         {guideCount > 0 && (
                           <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-xl text-[9px] font-bold">
                             {guideCount} guias
                           </div>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                       onClick={() => setSelectedSong(song)}
                       className="flex items-center justify-center gap-2 p-4 bg-[#00153d] text-white rounded-2xl hover:bg-blue-950 transition-all font-bold text-xs shadow-md shadow-blue-900/10 active:scale-98"
                    >
                       <Mic2 size={14} />
                       Estudar & Gravar
                    </button>
                    
                    <button 
                       onClick={() => study ? onUpdateStudyStatus(study.id, !study.is_completed) : onToggleStudySong(song.id)}
                       className={`flex items-center justify-center gap-2 p-4 rounded-2xl transition-all border font-bold text-xs active:scale-98 ${
                         study?.is_completed 
                           ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
                           : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                       }`}
                    >
                       {study?.is_completed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                       {study?.is_completed ? 'Concluído' : 'Concluir Estudo'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          filteredAllSongs.map((song, index) => {
            const study = isStudying(song.id);
            const { hasPlayback, has2ndVoice, guideCount } = getStudyStatus(song.id);
            return (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`group glass p-8 rounded-[3rem] border transition-all duration-500 relative overflow-hidden ${
                  study?.is_completed ? 'bg-emerald-50/30 border-emerald-100/50' : 'border-white/50 hover:bg-white hover:shadow-2xl'
                }`}
              >
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-lg border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                      {song.cover_url ? (
                        <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                          <Music size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2 py-1">
                      <div className="flex justify-between items-start">
                         <h4 className="text-xl font-headline font-black text-[#00153d] group-hover:text-blue-700 transition-colors cursor-pointer" onClick={() => setSelectedSong(song)}>
                           {song.title}
                         </h4>
                         {study?.is_completed && <CheckCircle2 size={24} className="text-emerald-500 animate-in zoom-in" />}
                      </div>
                      <p className="text-slate-500 font-medium">{song.artist}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                         <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">
                           Banda: {song.key}
                         </div>
                         
                         {hasPlayback && (
                           <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                             <Volume2 size={10} /> Playback
                           </div>
                         )}

                         {has2ndVoice && (
                           <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-1">
                             <Sparkles size={10} /> 2ª Voz
                           </div>
                         )}

                         {guideCount > 0 && (
                           <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-xl text-[9px] font-bold">
                             {guideCount} guias
                           </div>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                       onClick={() => setSelectedSong(song)}
                       className="flex items-center justify-center gap-2 p-4 bg-[#00153d] text-white rounded-2xl hover:bg-blue-950 transition-all font-bold text-xs shadow-md shadow-blue-900/10 active:scale-98"
                    >
                       <Mic2 size={14} />
                       Estudar & Gravar
                    </button>
                    
                    <button 
                       onClick={() => study ? onUpdateStudyStatus(study.id, !study.is_completed) : onToggleStudySong(song.id)}
                       className={`flex items-center justify-center gap-2 p-4 rounded-2xl transition-all border font-bold text-xs active:scale-98 ${
                         study?.is_completed 
                           ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
                           : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                       }`}
                    >
                       {study?.is_completed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                       {study?.is_completed ? 'Concluído' : 'Concluir Estudo'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Empty States */}
        {activeTab === 'events' && eventSongsList.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-slate-200">
            <Music size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum louvor escalado para este evento</p>
          </div>
        )}

        {activeTab === 'repertoire' && filteredAllSongs.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-slate-200">
            <Search size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma música encontrada para "{searchQuery}"</p>
          </div>
        )}

      </div>
    </div>
  );
}
