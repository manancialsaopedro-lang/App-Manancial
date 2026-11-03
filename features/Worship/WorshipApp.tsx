import React, {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2, LoaderCircle, PlusCircle, RefreshCcw, Settings as SettingsIcon, PanelLeft, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { BackButton } from './components/BackButton';
import Sidebar from './components/Sidebar';
import Dashboard from './features/dashboard/Dashboard';
import SongList from './features/songs/SongList';
import SongDetail from './features/songs/SongDetail';
import Schedule from './features/events/Schedule';
import EventDetail from './features/events/EventDetail';
import TeamList from './features/team/TeamList';
import { TeamMemberProfile } from './features/team/TeamMemberProfile';
import Login from './features/auth/Login';
import Settings from './features/settings/Settings';
import ProfileMenu from './features/settings/ProfileMenu';
import Insights from './features/insights/Insights';
import { OnboardingWizard } from './features/auth/OnboardingWizard';
import NewSongs from './features/songs/NewSongs';
import SongSuggestions from './features/songs/SongSuggestions';
import StudyHub from './features/study/StudyHub';
import EvaluationWizard from './features/evaluations/EvaluationWizard';
import EvaluationsDashboard from './features/evaluations/EvaluationsDashboard';
import { supabase } from './lib/supabase';
import { getProfile, signOut } from './lib/auth';
import {
  appDataSorters,
  createSong,
  createTeamMember,
  deleteSong,
  deleteTeamMember,
  fetchAppData,
  getAppMode,
  getAppModeMessage,
  seedInitialData,
  subscribeToAppData,
  unsubscribeFromAppData,
  updateEvent,
  createEvent,
  deleteEvent,
  updateSong,
  updateTeamMember,
  createRehearsalReport,
  markNotificationAsRead,
  toggleStudySong,
  updateStudySongStatus,
} from './lib/appData';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { Song, TeamMember, WorshipEvent, Profile, RehearsalReport, SongSuggestion, AppNotification, UserSongStudy, TeamEvaluation } from './types';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useCurrentRole } from '../../hooks/useCurrentRole';

// Polyfill for useEffectEvent (experimental in React 19)
function useEvent<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: any[]) => {
    return ref.current(...args);
  }, []) as T;
}

function formatErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel sincronizar os dados com o Supabase.';
}

function PullToRefreshIndicator({
  distance,
  status,
}: {
  distance: number;
  status: 'idle' | 'pulling' | 'ready' | 'refreshing' | 'done';
}) {
  if (status === 'idle') {
    return null;
  }

  const labelByStatus = {
    pulling: 'Puxe para atualizar',
    ready: 'Solte para atualizar',
    refreshing: 'Atualizando...',
    done: 'Atualizado',
  };

  const icon =
    status === 'done' ? (
      <CheckCircle2 size={18} className="text-emerald-600" />
    ) : status === 'refreshing' ? (
      <LoaderCircle size={18} className="animate-spin text-blue-600" />
    ) : (
      <RefreshCcw size={18} className="text-blue-600" />
    );

  const translateY = Math.min(distance, 72) - 56;

  return (
    <div
      className="safe-pull-indicator fixed left-1/2 z-[120] md:hidden pointer-events-none transition-transform duration-150"
      style={{ transform: `translate3d(-50%, ${translateY}px, 0)` }}
      aria-live="polite"
    >
      <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-[#00153d] shadow-xl ring-1 ring-blue-100/80 backdrop-blur-xl">
        {icon}
        <span>{labelByStatus[status]}</span>
      </div>
    </div>
  );
}

interface EventDetailRouteProps {
  events: WorshipEvent[];
  songs: Song[];
  team: TeamMember[];
  navigate: ReturnType<typeof useNavigate>;
  onUpdateEvent: (event: WorshipEvent) => Promise<void>;
  onUpdateSong: (song: Song) => Promise<void>;
  onCreateSong: (song: Omit<Song, 'id'>) => Promise<Song>;
  onDeleteEvent: (id: string) => Promise<void>;
  isMinister: boolean;
  canDeleteEvent: boolean;
  effectiveProfile: Profile | null;
  isSidebarHidden: boolean;
  userSongStudy: UserSongStudy[];
  onToggleStudySong: (songId: string) => Promise<void>;
  onRefreshBlockChange: (blocked: boolean) => void;
}

function EventDetailRoute({
  events,
  songs,
  team,
  navigate,
  onUpdateEvent,
  onUpdateSong,
  onCreateSong,
  onDeleteEvent,
  isMinister,
  canDeleteEvent,
  effectiveProfile,
  isSidebarHidden,
  userSongStudy,
  onToggleStudySong,
  onRefreshBlockChange,
}: EventDetailRouteProps) {
  const { eventId } = useParams();
  const event = useMemo(() => events.find(e => e.id === eventId) ?? null, [events, eventId]);
  if (!event) return <Navigate to="/app/events" replace />;

  return (
    <EventDetail
      event={event}
      events={events}
      songs={songs}
      team={team}
      onBack={() => navigate('/app/schedule')}
      onUpdate={onUpdateEvent}
      onUpdateSong={onUpdateSong}
      onCreateSong={onCreateSong}
      onSelectSong={(id) => navigate(`/app/repertoire/${id}`)}
      onSelectEvent={(id) => navigate(`/app/events/${id}`)}
      onDeleteEvent={() => onDeleteEvent(event.id)}
      canEdit={isMinister}
      canDeleteEvent={canDeleteEvent}
      userProfile={effectiveProfile}
      isSidebarHidden={isSidebarHidden}
      userSongStudy={userSongStudy}
      onToggleStudySong={onToggleStudySong}
      onRefreshBlockChange={onRefreshBlockChange}
    />
  );
}

interface SongDetailRouteProps {
  songs: Song[];
  events: WorshipEvent[];
  navigate: ReturnType<typeof useNavigate>;
  onUpdateSong: (song: Song) => Promise<void>;
  isMinister: boolean;
}

function SongDetailRoute({ songs, events, navigate, onUpdateSong, isMinister }: SongDetailRouteProps) {
  const { songId } = useParams();
  const song = useMemo(() => songs.find(s => s.id === songId) ?? null, [songs, songId]);
  if (!song) return <Navigate to="/app/repertoire" replace />;

  return (
    <SongDetail
      song={song}
      events={events}
      onBack={() => navigate(-1)}
      onUpdateSong={onUpdateSong}
      canEdit={isMinister}
    />
  );
}

export default function App() {
  const appMode = getAppMode();
  const appModeMessage = getAppModeMessage();
  const isLocalMode = appMode === 'local';
  
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailView = location.pathname.split('/').length > 3; // ex: /app/events/123

  const [songs, setSongs] = useState<Song[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [events, setEvents] = useState<WorshipEvent[]>([]);
  const [rehearsalReports, setRehearsalReports] = useState<RehearsalReport[]>([]);
  const [songSuggestions, setSongSuggestions] = useState<SongSuggestion[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userSongStudy, setUserSongStudy] = useState<UserSongStudy[]>([]);
  const [teamEvaluations, setTeamEvaluations] = useState<TeamEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isPullRefreshBlocked, setIsPullRefreshBlocked] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loggedWorshipMember, setLoggedWorshipMember] = useState<TeamMember | null>(() => {
    try {
      const raw = localStorage.getItem('louvor_logged_member');
      return raw ? (JSON.parse(raw) as TeamMember) : null;
    } catch {
      return null;
    }
  });
  
  const { activeRole: ecosystemRole, simulatedPerson: simulatedMember } = useCurrentRole();

  // Atualiza dinamicamente título, manifest e ícone de atalho para "Louvor App"
  useEffect(() => {
    document.title = 'Louvor App';
    localStorage.setItem('manancial_app_context', 'louvor');
    const appName = document.getElementById('app-name-meta');
    if (appName) appName.setAttribute('content', 'Louvor App');
    const appleTitle = document.getElementById('apple-title-meta');
    if (appleTitle) appleTitle.setAttribute('content', 'Louvor App');
    const themeMeta = document.getElementById('theme-color-meta');
    if (themeMeta) themeMeta.setAttribute('content', '#00153d');
    const manifest = document.getElementById('app-manifest');
    if (manifest) manifest.setAttribute('href', '/manifest-louvor.webmanifest');
    const fav192 = document.getElementById('favicon-192');
    if (fav192) fav192.setAttribute('href', '/icons/louvor-icon-192.png');
    const fav512 = document.getElementById('favicon-512');
    if (fav512) fav512.setAttribute('href', '/icons/louvor-icon-512.png');
    const ap1 = document.getElementById('apple-icon-1');
    if (ap1) ap1.setAttribute('href', '/icons/louvor-icon-180.png');
    const ap2 = document.getElementById('apple-icon-2');
    if (ap2) ap2.setAttribute('href', '/icons/louvor-icon-180.png');
    const ap3 = document.getElementById('apple-icon-3');
    if (ap3) ap3.setAttribute('href', '/icons/louvor-icon-192.png');
  }, []);

  const seededRef = useRef(false);
  const localProfile = useMemo<Profile>(() => {
    if (loggedWorshipMember) {
      const isLeader = !!loggedWorshipMember.isLeader;
      return {
        id: loggedWorshipMember.id,
        name: loggedWorshipMember.name,
        role: isLeader ? 'minister' : 'musician',
        onboarding_completed: true,
        functional_role: isLeader
          ? 'minister'
          : loggedWorshipMember.category === 'Vocais'
          ? 'vocal'
          : 'instrumentalist',
        instrument: loggedWorshipMember.role,
        avatar_url: loggedWorshipMember.avatar,
      };
    }

    const isLeadership = ecosystemRole === 'pastoral' || ecosystemRole === 'organizacao';
    const resolvedName = simulatedMember?.name || 'Caio Augusto';
    const resolvedId = simulatedMember?.id || 'caio-admin';
    return {
      id: resolvedId,
      name: resolvedName,
      role: isLeadership ? 'minister' : 'musician',
      onboarding_completed: true,
      functional_role: isLeadership ? 'minister' : 'vocal',
    };
  }, [loggedWorshipMember, ecosystemRole, simulatedMember]);

  const handleLouvorSignOut = useCallback(async () => {
    localStorage.removeItem('louvor_logged_member');
    setLoggedWorshipMember(null);
    setProfile(null);
    await signOut();
    navigate('/louvor/login', { replace: true });
  }, [navigate]);

  const isFetchingRef = useRef(false);
  const pendingFetchRef = useRef(false);
  const activeFetchPromiseRef = useRef<Promise<void> | null>(null);

  const applyAppData = useEvent((data: {
    songs: Song[];
    team: TeamMember[];
    events: WorshipEvent[];
    rehearsalReports: RehearsalReport[];
    songSuggestions: SongSuggestion[];
    notifications: AppNotification[];
    userSongStudy: UserSongStudy[];
    teamEvaluations: TeamEvaluation[];
  }) => {
    startTransition(() => {
      setSongs(data.songs);
      setTeam(data.team);
      setEvents(data.events);
      setRehearsalReports(data.rehearsalReports || []);
      setSongSuggestions(data.songSuggestions || []);
      setNotifications(data.notifications || []);
      setUserSongStudy(data.userSongStudy || []);
      setTeamEvaluations(data.teamEvaluations || []);
    });
  });

  const loadData = useEvent(
    async ({ withLoading = false, allowSeed = false }: { withLoading?: boolean; allowSeed?: boolean } = {}) => {
      if (isFetchingRef.current) {
        pendingFetchRef.current = true;
        await activeFetchPromiseRef.current;
        return;
      }

      isFetchingRef.current = true;

      const fetchPromise = (async () => {
        try {
          if (withLoading) {
            setIsLoading(true);
          }

          setErrorMessage(null);

          let data = await fetchAppData();

          if (
            allowSeed &&
            !seededRef.current &&
            data.songs.length === 0 &&
            data.team.length === 0 &&
            data.events.length === 0
          ) {
            seededRef.current = true;
            data = await seedInitialData();
          }

          applyAppData(data);
        } catch (error) {
          setErrorMessage(formatErrorMessage(error));
        } finally {
          isFetchingRef.current = false;
          if (withLoading) {
            setIsLoading(false);
          }
          if (pendingFetchRef.current) {
            pendingFetchRef.current = false;
            await loadData();
          }
        }
      })();

      activeFetchPromiseRef.current = fetchPromise;

      try {
        await fetchPromise;
      } finally {
        if (activeFetchPromiseRef.current === fetchPromise) {
          activeFetchPromiseRef.current = null;
        }
      }
    }
  );

  const handlePullRefresh = useEvent(async () => {
    await loadData({ withLoading: false });
  });

  const handleBlockedPullRefresh = useEvent(() => {
    toast('Salve ou descarte as alterações antes de atualizar.', {
      icon: '!',
    });
  });

  // Auth Effect
  useEffect(() => {
    if (isLocalMode) {
      setUser(null);
      setProfile(localProfile);
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        setIsAuthLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await getProfile(session.user.id);

          if (!isMounted) {
            return;
          }

          setProfile(userProfile);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setProfile(null);
        setErrorMessage(formatErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!isMounted) {
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          const userProfile = await getProfile(session.user.id);

          if (!isMounted) {
            return;
          }

          setProfile(userProfile);
          if (_event === 'SIGNED_IN') {
            void loadData({ withLoading: true });
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(formatErrorMessage(error));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isLocalMode, loadData, localProfile]);

  useEffect(() => {
    void loadData({ withLoading: true, allowSeed: true });

    let debounceTimer: ReturnType<typeof setTimeout>;
    const channel = subscribeToAppData(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void loadData();
      }, 2000); // 2 second debounce to ensure DB operations (like delete-insert) complete
    });

    return () => {
      clearTimeout(debounceTimer);
      unsubscribeFromAppData(channel);
    };
  }, [loadData]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLocalMode) {
      if (user && profile && !profile.onboarding_completed && !location.pathname.endsWith('/onboarding') && !location.pathname.endsWith('/login')) {
        navigate('/app/onboarding', { replace: true });
      } else if (user && profile?.onboarding_completed && (location.pathname.endsWith('/onboarding') || location.pathname === '/louvor' || location.pathname === '/app')) {
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [user, profile, isAuthLoading, isLocalMode, location.pathname, navigate]);

  const handleCreateSong = async (song: Omit<Song, 'id'>) => {
    try {
      setErrorMessage(null);
      const createdSong = await createSong(song);
      setSongs((previous) => appDataSorters.songs([...previous, createdSong]));
      return createdSong;
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleUpdateSong = async (song: Song) => {
    try {
      setErrorMessage(null);
      const updatedSong = await updateSong(song);
      setSongs((previous) =>
        appDataSorters.songs(previous.map((currentSong) => (currentSong.id === updatedSong.id ? updatedSong : currentSong)))
      );
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      setErrorMessage(null);
      await deleteSong(id);
      setSongs((previous) => previous.filter((song) => song.id !== id));
      setEvents((previous) =>
        previous.map((event) => ({
          ...event,
          songs: event.songs.filter((songId) => songId !== id),
          outroSongs: (event.outroSongs ?? []).filter((songId) => songId !== id),
        }))
      );
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleCreateMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      setErrorMessage(null);
      const createdMember = await createTeamMember(member);
      setTeam((previous) => appDataSorters.team([...previous, createdMember]));
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleUpdateMember = async (member: TeamMember) => {
    try {
      setErrorMessage(null);
      const updatedMember = await updateTeamMember(member);
      setTeam((previous) =>
        appDataSorters.team(previous.map((currentMember) => (currentMember.id === updatedMember.id ? updatedMember : currentMember)))
      );
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      setErrorMessage(null);
      const memberToRemove = team.find((member) => member.id === id);

      if (!memberToRemove) {
        return;
      }

      const updatedEvents = await Promise.all(
        events.map(async (event) => {
          const isAssigned =
            event.team.vocal.includes(memberToRemove.name) ||
            Object.values(event.team.instruments).includes(memberToRemove.name);

          if (!isAssigned) {
            return event;
          }

          const nextEvent: WorshipEvent = {
            ...event,
            attendance: Object.fromEntries(
              Object.entries(event.attendance || {}).filter(([key]) => key !== memberToRemove.name)
            ),
            team: {
              vocal: event.team.vocal.filter((name) => name !== memberToRemove.name),
              instruments: Object.fromEntries(
                Object.entries(event.team.instruments).filter(([, name]) => name !== memberToRemove.name)
              ),
            },
          };

          return updateEvent(nextEvent);
        })
      );

      await deleteTeamMember(id);
      setTeam((previous) => previous.filter((member) => member.id !== id));
      setEvents(appDataSorters.events(updatedEvents));
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleUpdateEvent = async (event: WorshipEvent) => {
    try {
      setErrorMessage(null);
      const updatedEvent = await updateEvent(event);
      setEvents((previous) =>
        appDataSorters.events(previous.map((currentEvent) => (currentEvent.id === updatedEvent.id ? updatedEvent : currentEvent)))
      );
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleCreateEvent = async (event: Omit<WorshipEvent, 'id'>) => {
    try {
      setErrorMessage(null);
      const createdEvent = await createEvent(event);
      setEvents((previous) => appDataSorters.events([...previous, createdEvent]));
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleCreateRehearsalReport = async (report: Omit<RehearsalReport, 'id'>) => {
    try {
      setErrorMessage(null);
      const createdReport = await createRehearsalReport(report);
      setRehearsalReports(prev => [createdReport, ...prev]);
      
      // Reload app data to update song rehearsal counts
      void loadData();
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const handleToggleStudySong = async (songId: string) => {
    try {
      const targetUserId = user?.id || (profile ?? localProfile).id;
      if (!targetUserId) return;
      await toggleStudySong(targetUserId, songId);
      // Trigger a quick reload for immediate feedback
      void loadData();
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
    }
  };

  const handleUpdateStudyStatus = async (studyId: string, isCompleted: boolean) => {
    try {
      await updateStudySongStatus(studyId, isCompleted);
      // Trigger a quick reload for immediate feedback
      void loadData();
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      setErrorMessage(null);
      await deleteEvent(id);
      setEvents((previous) => previous.filter((event) => event.id !== id));
      
      // Only navigate away if we are currently viewing the event that was deleted
      if (window.location.pathname.includes(`/app/events/${id}`)) {
        navigate('/app/schedule');
      }
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
      throw error;
    }
  };

  const effectiveProfile = profile ?? localProfile;
  const isMinister = effectiveProfile?.role === 'minister' || effectiveProfile?.role === 'pastor';
  const canDeleteEvent = isMinister || ['Caio', 'Caio Augusto', 'Caio Augusto ', 'Silvia', 'Pastor Sidney', 'Pr Sidney'].includes(effectiveProfile?.name || '');

  const renderContent = () => {
    return (
      <Routes>
        <Route
          index
          element={
            loggedWorshipMember || user ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <Navigate to="/louvor/login" replace />
            )
          }
        />
        
        <Route
          path="login"
          element={
            <Login
              team={team}
              onLogin={(selectedMember) => {
                if (selectedMember) {
                  setLoggedWorshipMember(selectedMember);
                }
                void loadData({ withLoading: false });
                navigate('/app/dashboard', { replace: true });
              }}
            />
          }
        />
        <Route path="onboarding" element={profile ? <OnboardingWizard profile={profile} onComplete={setProfile} /> : <Navigate to="/app/dashboard" replace />} />
        
        <Route path="avaliacao" element={<EvaluationWizard />} />
        
        <Route path="dashboard" element={
          <Dashboard
            setActiveTab={(id) => navigate(`/app/${id}`)}
            songs={songs}
            team={team}
            events={events}
            rehearsalReports={rehearsalReports}
            notificationsData={notifications}
            onSelectEvent={(id) => navigate(`/app/events/${id}`)}
            onSelectSong={(id) => navigate(`/app/repertoire/${id}`)}
            onCreateRehearsalReport={handleCreateRehearsalReport}
            onMarkNotificationAsRead={async (notifId) => {
               const targetUserId = user?.id || effectiveProfile?.id;
               if (targetUserId) await markNotificationAsRead(targetUserId, notifId);
            }}
            userProfile={effectiveProfile}
            userSongStudy={userSongStudy}
            onToggleStudySong={handleToggleStudySong}
            onUpdateStudyStatus={handleUpdateStudyStatus}
          />
        } />
        
        <Route path="repertoire" element={
          <SongList
            songs={songs}
            events={events}
            onCreateSong={handleCreateSong}
            onUpdateSong={handleUpdateSong}
            onDeleteSong={handleDeleteSong}
            onSelectSong={(id) => navigate(`/app/repertoire/${id}`)}
            canEdit={isMinister}
            onBack={() => navigate('/app/dashboard')}
          />
        } />
        
        <Route path="repertoire/:songId" element={
          <SongDetailRoute
            songs={songs}
            events={events}
            navigate={navigate}
            onUpdateSong={handleUpdateSong}
            isMinister={isMinister}
          />
        } />
        
        <Route path="schedule" element={
          <Schedule 
            events={events} 
            songs={songs} 
            onSelectEvent={(id) => navigate(`/app/events/${id}`)}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            canEdit={isMinister}
            canDeleteEvent={canDeleteEvent}
            onBack={() => navigate('/app/dashboard')}
          />
        } />
        
        <Route path="events/:eventId" element={
          <EventDetailRoute
            events={events}
            songs={songs}
            team={team}
            navigate={navigate}
            onUpdateEvent={handleUpdateEvent}
            onUpdateSong={handleUpdateSong}
            onCreateSong={handleCreateSong}
            onDeleteEvent={handleDeleteEvent}
            isMinister={isMinister}
            canDeleteEvent={canDeleteEvent}
            effectiveProfile={effectiveProfile}
            isSidebarHidden={isSidebarHidden}
            userSongStudy={userSongStudy}
            onToggleStudySong={handleToggleStudySong}
            onRefreshBlockChange={setIsPullRefreshBlocked}
          />
        } />
        
        <Route path="team" element={
          <TeamList
            team={team}
            onCreateMember={handleCreateMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            canEdit={isMinister}
            onBack={() => navigate('/app/dashboard')}
          />
        } />
        
        <Route path="team/:id" element={
          <TeamMemberProfile 
            team={team}
            songs={songs}
            userSongStudy={userSongStudy}
          />
        } />
        
        <Route path="new-songs" element={
          <NewSongs
            songs={songs}
            events={events}
            suggestions={songSuggestions}
            userProfile={effectiveProfile}
            onSelectSong={(id) => navigate(`/app/repertoire/${id}`)}
            onBack={() => navigate('/app/dashboard')}
            onGoToStudy={() => navigate('/app/study')}
            onSuggestionCreated={(createdSuggestion) => {
              setSongSuggestions((previous) => [
                createdSuggestion,
                ...previous.filter((suggestion) => suggestion.id !== createdSuggestion.id),
              ]);
            }}
            onCreateSong={handleCreateSong}
          />
        } />

        <Route path="suggestions" element={
          <SongSuggestions
            suggestions={songSuggestions}
            userProfile={effectiveProfile}
            onBack={() => navigate('/app/dashboard')}
            onCreateSong={handleCreateSong}
            onSuggestionCreated={(createdSuggestion) => {
              setSongSuggestions((previous) => [
                createdSuggestion,
                ...previous.filter((suggestion) => suggestion.id !== createdSuggestion.id),
              ]);
            }}
            onSuggestionUpdated={(id, updates) => {
              setSongSuggestions((previous) =>
                previous.map((suggestion) =>
                  suggestion.id === id ? { ...suggestion, ...updates } : suggestion
                )
              );
            }}
          />
        } />
        
        <Route path="insights" element={
          <Insights
            songs={songs}
            team={team}
            events={events}
            onBack={() => navigate('/app/dashboard')}
          />
        } />
        
        <Route path="profile" element={
          <ProfileMenu 
            onBack={() => navigate('/app/dashboard')}
          />
        } />
        
        <Route path="settings" element={
          <Settings 
            profile={effectiveProfile} 
            email={user?.email} 
            onUpdateProfile={setProfile} 
            onBack={() => navigate('/app/profile')}
            onSignOut={handleLouvorSignOut}
          />
        } />
        
        <Route path="study" element={
          <StudyHub
            songs={songs}
            events={events}
            userProfile={effectiveProfile}
            userSongStudy={userSongStudy}
            onToggleStudySong={handleToggleStudySong}
            onUpdateStudyStatus={handleUpdateStudyStatus}
            onSelectSong={(id) => navigate(`/app/repertoire/${id}`)}
            onBack={() => navigate('/app/dashboard')}
          />
        } />
        
        <Route path="avaliacoes" element={
          <EvaluationsDashboard
            evaluations={teamEvaluations}
            team={team}
            onBack={() => navigate('/app/dashboard')}
            canEdit={isMinister}
          />
        } />
        
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    );
  };

  const isAuthRoute =
    location.pathname.endsWith('/login') ||
    location.pathname.endsWith('/onboarding') ||
    location.pathname.endsWith('/avaliacao') ||
    (location.pathname === '/louvor' && !loggedWorshipMember && !user);
  const pullToRefresh = usePullToRefresh({
    enabled: !isAuthRoute && !isLoading && !isAuthLoading,
    canRefresh: !isPullRefreshBlocked,
    onRefresh: handlePullRefresh,
    onBlockedRefresh: handleBlockedPullRefresh,
  });

  if (isAuthLoading && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8fc]">
        <LoaderCircle size={48} className="animate-spin text-[#00153d]" />
      </div>
    );
  }

  return (
    <div className="app-viewport min-h-screen manancial-gradient relative overflow-x-hidden">
      <PullToRefreshIndicator distance={pullToRefresh.distance} status={pullToRefresh.status} />

      {/* Background Decorative Ripples */}
      <div className="fixed top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600 rounded-full blur-[150px]" />
      </div>

      {!isAuthRoute && (
        <Sidebar 
          onSignOut={handleLouvorSignOut}
          userProfile={effectiveProfile}
          isSidebarHidden={isSidebarHidden}
          setIsSidebarHidden={setIsSidebarHidden}
          showMobileNav={!isDetailView}
        />
      )}

      {isSidebarHidden && !isAuthRoute && (
        <button 
          onClick={() => setIsSidebarHidden(false)}
          className="fixed left-4 top-1/2 -translate-y-1/2 glass p-4 rounded-3xl shadow-2xl text-blue-600 hover:pl-8 transition-all z-50 md:flex hidden group border border-white/40 active:scale-95"
          title="Mostrar Menu"
        >
          <PanelLeft size={24} className="group-hover:scale-120 transition-transform" />
        </button>
      )}

      <main className={`app-main-shell relative z-10 transition-all duration-500 ease-in-out ${
        isAuthRoute
          ? 'app-main-shell--auth w-full'
          : isSidebarHidden
            ? 'w-full max-w-[1600px] mx-auto'
            : 'app-main-shell--with-sidebar max-w-7xl mx-auto'
      }`}>
        {errorMessage && (
          <div className="mb-8 flex flex-col gap-6 rounded-[2.5rem] bg-red-500/5 backdrop-blur-xl border border-red-200/30 px-8 py-7 text-red-900 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
            <div className="flex items-start gap-4 relative">
              <div className="mt-0.5 rounded-2xl bg-white p-3 text-red-600 shadow-sm border border-red-100">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60">Erro de Conexão</p>
                <p className="text-lg font-headline font-extrabold text-red-950">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => void loadData({ withLoading: true })}
              className="inline-flex w-full md:w-auto items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold text-red-700 shadow-md hover:bg-red-50 hover:shadow-lg transition-all active:scale-[0.98] relative overflow-hidden"
            >
              <RefreshCcw size={18} className="animate-spin-slow" />
              Reconectar Agora
            </button>
          </div>
        )}

        {isLoading && !isAuthRoute ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="glass rounded-[4rem] px-12 py-16 shadow-2xl flex flex-col items-center gap-8 text-center max-w-md border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              <div className="w-20 h-20 rounded-[2rem] bg-[#00153d] text-white flex items-center justify-center shadow-2xl animate-float relative z-10 overflow-hidden p-0.5">
                <img src="/louvor-icon.png" alt="Louvor App" className="w-full h-full object-cover rounded-[1.8rem]" />
              </div>
              <div className="space-y-3 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60">Louvor App</p>
                <h2 className="text-3xl font-headline font-extrabold text-[#00153d] tracking-tight">Sincronizando...</h2>
                <p className="text-slate-500 font-medium leading-relaxed">Carregando escalas e repertório do Ministério de Louvor.</p>
              </div>
              {/* Subtle loading bar */}
              <div className="w-48 h-1 bg-blue-100 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  className="h-full bg-blue-600"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        )}
      </main>

    </div>
  );
}
