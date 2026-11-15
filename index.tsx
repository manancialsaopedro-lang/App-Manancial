import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from './store';
import { DEFAULT_ADMIN_USER } from './store/slices/authSlice';
import { useAuthSync } from './hooks/useAuthSync';
import { useCurrentRole } from './hooks/useCurrentRole';
import { UserRole } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ManancialSplashScreen } from './components/splash/ManancialSplashScreen';

// Intercepta callbacks de Magic Link / Recovery / OAuth do Supabase antes do HashRouter interpretar como rota 404
const interceptSupabaseAuthHash = () => {
  if (typeof window === 'undefined') return;
  const rawHash = window.location.hash || '';
  const rawSearch = window.location.search || '';

  const hasAuthHashTokens =
    rawHash.startsWith('#access_token=') ||
    rawHash.startsWith('#error=') ||
    rawHash.startsWith('#type=') ||
    (rawHash.includes('access_token=') && !rawHash.startsWith('#/auth/confirm')) ||
    (rawHash.includes('error_description=') && !rawHash.startsWith('#/auth/confirm'));

  const hasAuthSearchTokens =
    (rawSearch.includes('code=') ||
      rawSearch.includes('token_hash=') ||
      rawSearch.includes('type=recovery') ||
      rawSearch.includes('type=magiclink')) &&
    !rawHash.startsWith('#/auth/confirm');

  if (hasAuthHashTokens || hasAuthSearchTokens) {
    try {
      const payload = hasAuthHashTokens ? rawHash.slice(1) : rawSearch.slice(1);
      sessionStorage.setItem('manancial_auth_callback_params', payload);
      if (payload.includes('type=recovery')) {
        sessionStorage.setItem('manancial_password_recovery_active', '1');
      }
    } catch {
      // ignore storage errors
    }
    window.location.hash = '#/auth/confirm';
  }
};

interceptSupabaseAuthHash();

const lazyNamed = <T extends React.ComponentType<any>>(
  loader: () => Promise<Record<string, any>>,
  exportName: string
) =>
  React.lazy(async () => {
    const mod = await loader();
    return { default: mod[exportName] as T };
  });

// Layouts
const AppLayout = lazyNamed(() => import('./layouts/AppLayout'), 'AppLayout');
const DevLayout = lazyNamed(() => import('./features/DevPortal/layouts/DevLayout'), 'DevLayout');
const ChurchMemberLayout = lazyNamed(() => import('./features/Church/layouts/ChurchMemberLayout'), 'ChurchMemberLayout');

// Features - Auth
const LoginPage = lazyNamed(() => import('./features/Auth/LoginPage'), 'LoginPage');
const AuthConfirmPage = lazyNamed(() => import('./features/Auth/AuthConfirmPage'), 'AuthConfirmPage');
const MeshGradientPreview = lazyNamed(() => import('./components/ui/mesh-gradient-preview'), 'MeshGradientPreview');

// Features - Welcome & Portais
const CampWelcomePage = lazyNamed(() => import('./features/Camp/CampWelcomePage'), 'CampWelcomePage');
const CampInfoPage = lazyNamed(() => import('./features/Camp/CampInfoPage'), 'CampInfoPage');
const CampPastorPaymentsPage = lazyNamed(() => import('./features/Camp/CampPastorPaymentsPage'), 'CampPastorPaymentsPage');

// Features - Gymkhana
const GymDashboard = lazyNamed(() => import('./features/Gymkhana/GymDashboard'), 'GymDashboard');
const ScorePage = lazyNamed(() => import('./features/Gymkhana/ScorePage'), 'ScorePage');
const TeamsOverview = lazyNamed(() => import('./features/Gymkhana/TeamsOverview'), 'TeamsOverview');
const PeopleList = lazyNamed(() => import('./features/People/PeopleList'), 'PeopleList');
const ProofsList = lazyNamed(() => import('./features/Proofs/ProofsList'), 'ProofsList');
const ProofDetail = lazyNamed(() => import('./features/Proofs/ProofDetail'), 'ProofDetail');
const ProofRun = lazyNamed(() => import('./features/Proofs/ProofRun'), 'ProofRun');
const ProofJudge = lazyNamed(() => import('./features/Proofs/ProofJudge'), 'ProofJudge');
const TeamDetail = lazyNamed(() => import('./features/Gymkhana/TeamDetail'), 'TeamDetail');
const MaterialsManager = lazyNamed(() => import('./features/Gymkhana/MaterialsManager'), 'MaterialsManager');
const ScheduleManager = lazyNamed(() => import('./features/Gymkhana/ScheduleManager'), 'ScheduleManager');

// Features - Org
const OrgHome = lazyNamed(() => import('./features/Org/OrgHome'), 'OrgHome');
const OrgCashierHub = lazyNamed(() => import('./features/Org/OrgCashierHub'), 'OrgCashierHub');
const OrgDashboard = lazyNamed(() => import('./features/Org/OrgDashboard'), 'OrgDashboard');
const TransactionDetail = lazyNamed(() => import('./features/Org/TransactionDetail'), 'TransactionDetail');
const OrgAnalytics = lazyNamed(() => import('./features/Org/OrgAnalytics'), 'OrgAnalytics');
const OrgCostDetail = lazyNamed(() => import('./features/Org/OrgCostDetail'), 'OrgCostDetail');
const OrgRevenueDetail = lazyNamed(() => import('./features/Org/OrgRevenueDetail'), 'OrgRevenueDetail');
const OrgDailyClose = lazyNamed(() => import('./features/Org/OrgDailyClose'), 'OrgDailyClose');
const OrgStockEditor = lazyNamed(() => import('./features/Org/OrgStockEditor'), 'OrgStockEditor');
const OrgStockQuickWizard = lazyNamed(() => import('./features/Org/OrgStockQuickWizard'), 'OrgStockQuickWizard');
const OrgPurchaseHistory = lazyNamed(() => import('./features/Org/OrgPurchaseHistory'), 'OrgPurchaseHistory');
const OrgPurchasePersonHistory = lazyNamed(() => import('./features/Org/OrgPurchasePersonHistory'), 'OrgPurchasePersonHistory');

// New Detailed Pages
const OrgAdherence = lazyNamed(() => import('./features/Org/OrgAdherence'), 'OrgAdherence');
const OrgReceivables = lazyNamed(() => import('./features/Org/OrgReceivables'), 'OrgReceivables');
const OrgForecast = lazyNamed(() => import('./features/Org/OrgForecast'), 'OrgForecast');
const OrgCollected = lazyNamed(() => import('./features/Org/OrgCollected'), 'OrgCollected');
const OfflinePage = lazyNamed(() => import('./features/Offline/OfflinePage'), 'OfflinePage');

// Features - Member
const MemberHome = lazyNamed(() => import('./features/Member/MemberHome'), 'MemberHome');
const ChurchMemberHome = lazyNamed(() => import('./features/Church/ChurchMemberHome'), 'ChurchMemberHome');
const ChurchMemberPastoralPage = lazyNamed(() => import('./features/Church/pages/member/ChurchMemberPastoralPage'), 'ChurchMemberPastoralPage');
const ChurchMemberEventsPage = lazyNamed(() => import('./features/Church/pages/member/ChurchMemberEventsPage'), 'ChurchMemberEventsPage');
const ChurchMemberStudyPage = lazyNamed(() => import('./features/Church/pages/member/ChurchMemberStudyPage'), 'ChurchMemberStudyPage');
const ChurchMemberProfilePage = lazyNamed(() => import('./features/Church/pages/member/ChurchMemberProfilePage'), 'ChurchMemberProfilePage');
const MemberCompleteRegistrationPage = lazyNamed(() => import('./features/Member/MemberCompleteRegistrationPage'), 'MemberCompleteRegistrationPage');

// Features - Visitor Wizard & Landing Page (Aberto / Sem Auth)
const VisitorWizardPage = lazyNamed(() => import('./features/Visitor/VisitorWizardPage'), 'VisitorWizardPage');
const ChurchLandingPage = lazyNamed(() => import('./features/Landing/ChurchLandingPage'), 'ChurchLandingPage');

// Features - Dev Portal (Gestão Eclesiástica)
const DevChurchInfoPage = lazyNamed(() => import('./features/DevPortal/pages/DevChurchInfoPage'), 'DevChurchInfoPage');
const DevRequestsPage = lazyNamed(() => import('./features/DevPortal/pages/DevRequestsPage'), 'DevRequestsPage');
const DevNotificationsPage = lazyNamed(() => import('./features/DevPortal/pages/DevNotificationsPage'), 'DevNotificationsPage');
const DevMembersPage = lazyNamed(() => import('./features/DevPortal/pages/DevMembersPage'), 'DevMembersPage');
const DevAttendancePage = lazyNamed(() => import('./features/DevPortal/pages/DevAttendancePage'), 'DevAttendancePage');
const DevWhatsAppMessagesPage = lazyNamed(() => import('./features/DevPortal/pages/DevWhatsAppMessagesPage'), 'DevWhatsAppMessagesPage');
const DevVisitorsPage = lazyNamed(() => import('./features/DevPortal/pages/DevVisitorsPage'), 'DevVisitorsPage');
const DevReportsPage = lazyNamed(() => import('./features/DevPortal/pages/DevReportsPage'), 'DevReportsPage');
const DevCellsPage = lazyNamed(() => import('./features/DevPortal/pages/DevCellsPage'), 'DevCellsPage');
const DevCoursesPage = lazyNamed(() => import('./features/DevPortal/pages/DevCoursesPage'), 'DevCoursesPage');
const DevEventsPage = lazyNamed(() => import('./features/DevPortal/pages/DevEventsPage'), 'DevEventsPage');

// Features - Ecossistema Hub & Ministério de Louvor
const EcosystemHubPage = lazyNamed(() => import('./features/Hub/EcosystemHubPage'), 'EcosystemHubPage');
const WorshipApp = React.lazy(() => import('./features/Worship/WorshipApp'));
const ChurchCanteenPage = lazyNamed(() => import('./features/Canteen/ChurchCanteenPage'), 'ChurchCanteenPage');
const ChurchFinancialPage = lazyNamed(() => import('./features/Financial/ChurchFinancialPage'), 'ChurchFinancialPage');

// AssistiveTouch Dev (Role & Environment Switcher flutuante estilo iOS - ativo em todas as telas)
import { AssistiveTouchDev } from './components/AssistiveTouchDev';

const RequireAuth = ({
  children,
  redirectTo = '/login',
}: {
  children?: React.ReactNode;
  redirectTo?: string;
}) => {
  const { user, isDevMode, devRole, signIn } = useAppStore();
  const location = useLocation();
  const effectiveRole = devRole || 'admin';

  React.useEffect(() => {
    if (!user && isDevMode) {
      signIn(DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER.name, effectiveRole, undefined, {
        id: DEFAULT_ADMIN_USER.id,
        churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
        isWorshipMember: true,
        isWorshipLeader: true,
      });
    }
  }, [user, isDevMode, effectiveRole, signIn]);

  // Em Modo Construção (isDevMode), NUNCA bloqueia nem redireciona para /login
  if (isDevMode || user) {
    return <>{children}</>;
  }

  return <Navigate to={redirectTo} state={{ from: location }} replace />;
};

const RequireRole = ({
  allowed,
  children,
}: {
  allowed: UserRole[];
  children?: React.ReactNode;
}) => {
  const { activeRole, defaultRoute, isDevMode } = useCurrentRole();
  const location = useLocation();

  // Em Modo Construção ou papel Admin, libera 100% de todas as telas sem exceção
  if (isDevMode || activeRole === 'admin' || allowed.includes(activeRole)) {
    return <>{children}</>;
  }

  const safeTarget = defaultRoute && defaultRoute !== location.pathname ? defaultRoute : '/';
  return <Navigate to={safeTarget} replace />;
};

const RequireLouvor = ({ children }: { children?: React.ReactNode }) => {
  const { canAccessLouvor, activeRole, isDevMode, defaultRoute } = useCurrentRole();
  const location = useLocation();

  if (isDevMode || activeRole === 'admin' || canAccessLouvor) {
    return <>{children}</>;
  }

  const safeTarget =
    defaultRoute &&
    !defaultRoute.startsWith('/app') &&
    !defaultRoute.startsWith('/louvor') &&
    defaultRoute !== location.pathname
      ? defaultRoute
      : '/igreja/membro';
  return <Navigate to={safeTarget} replace />;
};

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { defaultRoute } = useCurrentRole();
  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center shadow-xl space-y-5">
        <div className="text-5xl font-black text-cyan-600 dark:text-cyan-400">404</div>
        <div className="space-y-2">
          <h1 className="text-xl font-black">Página não encontrada</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            O endereço acessado não existe ou foi movido dentro do ecossistema Manancial.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => navigate(user ? defaultRoute : '/hub')}
            className="flex-1 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors"
          >
            Ir para o Painel
          </button>
        </div>
      </div>
    </div>
  );
};

const RootRoute = () => {
  const { isDarkMode, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  return (
    <ManancialSplashScreen
      standalone
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      onEnterLanding={() => navigate('/landing')}
      onEnterAuth={() => navigate('/login')}
      onEnterAdmin={() => navigate('/igreja')}
    />
  );
};

const LouvorAliasRedirect = () => {
  const location = useLocation();
  const mappedPath = location.pathname.replace(/^\/louvor(?=\/|$)/, '/app') || '/app/dashboard';
  const targetPath = mappedPath === '/app' ? '/app/dashboard' : mappedPath;
  return <Navigate to={`${targetPath}${location.search}`} replace />;
};

// Wrapper component to use hooks
const App = () => {
  // Activate Auth Listener
  useAuthSync();
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  React.useEffect(() => {
    const onHashChange = () => interceptSupabaseAuthHash();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <HashRouter>
      <React.Suspense fallback={<ManancialSplashScreen standalone isDarkMode={isDarkMode} />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/confirm" element={<AuthConfirmPage />} />
          <Route path="/offline" element={<OfflinePage />} />

          {/* Rotas Públicas Abertas (Landing Page / Wizard de Visitantes / Finalização de Cadastro) */}
          <Route path="/landing" element={<ChurchLandingPage />} />
          <Route path="/visitante" element={<VisitorWizardPage />} />
          <Route path="/boas-vindas" element={<Navigate to="/visitante" replace />} />
          <Route path="/completar-cadastro" element={<MemberCompleteRegistrationPage />} />
          <Route path="/cadastro-membro" element={<MemberCompleteRegistrationPage />} />
          <Route path="/mesh-gradient" element={<MeshGradientPreview />} />
          <Route path="/preview/mesh-gradient" element={<MeshGradientPreview />} />

          {/* Rota Raiz: Pré-Page fluida */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/hub" element={<RequireAuth><EcosystemHubPage /></RequireAuth>} />

          {/* Portal de Gestão Principal (Pastores & Liderança) */}
          <Route
            element={
              <RequireAuth>
                <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'equipe_pastoral']}>
                  <DevLayout />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route path="/igreja" element={<DevChurchInfoPage />} />
            <Route path="/solicitacoes" element={<DevRequestsPage />} />
            <Route path="/notificacoes" element={<DevNotificationsPage />} />
            <Route path="/membros" element={<DevMembersPage />} />
            <Route path="/presenca" element={<DevAttendancePage />} />
            <Route path="/mensagens" element={<DevWhatsAppMessagesPage />} />
            <Route path="/relatorios" element={<DevReportsPage />} />
            <Route path="/celulas" element={<DevCellsPage />} />
            <Route path="/cursos" element={<DevCoursesPage />} />
            <Route path="/eventos" element={<DevEventsPage />} />
            <Route path="/visitantes" element={<DevVisitorsPage />} />
            <Route path="/membros/lista" element={<Navigate to="/membros" replace />} />
            <Route path="/membros/visitantes" element={<Navigate to="/visitantes" replace />} />
          </Route>

          {/* Ministério de Louvor Manancial */}
          <Route path="/louvor/login" element={<WorshipApp />} />
          <Route path="/app/login" element={<WorshipApp />} />
          <Route
            path="/louvor/*"
            element={
              <RequireAuth redirectTo="/louvor/login">
                <RequireLouvor>
                  <LouvorAliasRedirect />
                </RequireLouvor>
              </RequireAuth>
            }
          />
          <Route
            path="/app/*"
            element={
              <RequireAuth redirectTo="/louvor/login">
                <RequireLouvor>
                  <WorshipApp />
                </RequireLouvor>
              </RequireAuth>
            }
          />

          {/* Novo Módulo Oficial: Cantina & Caixa da Igreja (Multi-evento) */}
          <Route
            path="/cantina"
            element={
              <RequireAuth>
                <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'organizacao', 'editor']}>
                  <ChurchCanteenPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route path="/caixa" element={<Navigate to="/cantina" replace />} />

          {/* Novo Módulo Oficial: Financeiro & Tesouraria Manancial */}
          <Route
            path="/financeiro"
            element={
              <RequireAuth>
                <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'organizacao', 'editor']}>
                  <ChurchFinancialPage />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* Redirecionamentos de conveniência */}
          <Route path="/gestao" element={<Navigate to="/igreja" replace />} />
          <Route path="/gestao/membros" element={<Navigate to="/membros" replace />} />
          <Route path="/gestao/presenca" element={<Navigate to="/presenca" replace />} />
          <Route path="/gestao/mensagens" element={<Navigate to="/mensagens" replace />} />
          <Route path="/gestao/relatorios" element={<Navigate to="/relatorios" replace />} />

          {/* Submódulo Acampamento Manancial */}
          <Route path="/retiro" element={<Navigate to="/acampamento" replace />} />
          <Route path="/acampamento" element={<CampWelcomePage />} />
          <Route path="/acampamento/home" element={<CampWelcomePage />} />
          <Route path="/acampamento/informacoes" element={<CampInfoPage />} />
          <Route
            path="/acampamento/pagamentos"
            element={
              <RequireAuth>
                <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'organizacao', 'editor']}>
                  <CampPastorPaymentsPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route path="/gestao/acampamento" element={<Navigate to="/acampamento/pagamentos" replace />} />

          {/* Módulo Organização */}
          <Route
            path="/org"
            element={
              <RequireAuth>
                <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'organizacao', 'editor']}>
                  <AppLayout sector="org" />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="home" />} />

            <Route path="home" element={<OrgHome />} />
            <Route path="cashier-hub" element={<OrgCashierHub />} />

            <Route path="dash" element={<OrgDashboard />} />
            <Route path="analytics" element={<OrgAnalytics />} />
            <Route path="analytics/costs" element={<OrgCostDetail />} />
            <Route path="analytics/revenue" element={<OrgRevenueDetail />} />

            <Route path="list" element={<PeopleList mode="org" />} />

            <Route path="adherence" element={<OrgAdherence />} />
            <Route path="receivables" element={<OrgReceivables />} />
            <Route path="forecast" element={<OrgForecast />} />
            <Route path="collected" element={<OrgCollected />} />

            <Route path="financials" element={<ChurchFinancialPage />} />
            <Route path="financials/:id" element={<TransactionDetail />} />

            <Route path="canteen" element={<ChurchCanteenPage />} />
            <Route path="canteen/stock/new" element={<OrgStockQuickWizard />} />
            <Route path="canteen/stock" element={<OrgStockEditor />} />
            <Route path="history" element={<OrgPurchaseHistory />} />
            <Route path="history/:personId" element={<OrgPurchasePersonHistory />} />
            <Route path="closing" element={<OrgDailyClose />} />

            <Route path="purchases" element={<Navigate to="financials" />} />
          </Route>

          {/* Módulo Gincana */}
          <Route path="/gincana" element={<AppLayout sector="gincana" />}>
            <Route index element={<Navigate to="placar" />} />
            <Route
              path="dash"
              element={
                <RequireAuth>
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana', 'lider_equipe']}>
                    <GymDashboard />
                  </RequireRole>
                </RequireAuth>
              }
            />

            <Route path="placar" element={<ScorePage />} />
            <Route
              path="equipes-geral"
              element={
                <RequireAuth>
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana', 'lider_equipe']}>
                    <TeamsOverview />
                  </RequireRole>
                </RequireAuth>
              }
            />

            <Route
              path="list"
              element={
                <RequireAuth>
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana', 'lider_equipe']}>
                    <PeopleList mode="gincana" />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="equipes/:teamId"
              element={
                <RequireAuth>
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana', 'lider_equipe']}>
                    <TeamDetail />
                  </RequireRole>
                </RequireAuth>
              }
            />

            <Route
              path="materiais"
              element={
                <RequireAuth>
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana', 'lider_equipe']}>
                    <MaterialsManager />
                  </RequireRole>
                </RequireAuth>
              }
            />

            <Route
              path="proofs"
              element={
                <RequireAuth>
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana', 'lider_equipe']}>
                    <Outlet />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route index element={<ProofsList />} />
              <Route path=":proofId" element={<ProofDetail />} />
              <Route
                path=":proofId/executar"
                element={
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana']}>
                    <ProofRun />
                  </RequireRole>
                }
              />
              <Route
                path=":proofId/julgar"
                element={
                  <RequireRole allowed={['pastoral', 'admin', 'primeiro_pastor', 'segundo_pastor', 'gincana']}>
                    <ProofJudge />
                  </RequireRole>
                }
              />
              <Route path=":proofId/pontuacao" element={<Navigate to="../executar" relative="path" />} />
            </Route>

            <Route path="time" element={<ScheduleManager />} />
          </Route>

          {/* Espaço do Membro da Igreja */}
          <Route path="/igreja/membro" element={<RequireAuth><ChurchMemberLayout /></RequireAuth>}>
            <Route index element={<ChurchMemberHome />} />
            <Route path="atendimento" element={<ChurchMemberPastoralPage />} />
            <Route path="eventos" element={<ChurchMemberEventsPage />} />
            <Route path="ensino" element={<ChurchMemberStudyPage />} />
            <Route path="perfil" element={<ChurchMemberProfilePage />} />
          </Route>

          {/* Sub-App: Membro / Participante no Acampamento */}
          <Route path="/membro" element={<RequireAuth><AppLayout sector="membro" /></RequireAuth>}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<MemberHome />} />
            <Route path="cronograma" element={<ScheduleManager />} />
            <Route path="placar" element={<ScorePage />} />
          </Route>

          {/* Redirecionamentos legados /dev/* */}
          <Route path="/dev" element={<Navigate to="/igreja" replace />} />
          <Route path="/dev/igreja" element={<Navigate to="/igreja" replace />} />
          <Route path="/dev/solicitacoes" element={<Navigate to="/solicitacoes" replace />} />
          <Route path="/dev/notificacoes" element={<Navigate to="/notificacoes" replace />} />
          <Route path="/dev/membros" element={<Navigate to="/membros" replace />} />
          <Route path="/dev/membros/lista" element={<Navigate to="/membros" replace />} />
          <Route path="/dev/membros/visitantes" element={<Navigate to="/visitantes" replace />} />
          <Route path="/dev/membros/:sub" element={<Navigate to="/membros" replace />} />
          <Route path="/dev/celulas" element={<Navigate to="/celulas" replace />} />
          <Route path="/dev/cursos" element={<Navigate to="/cursos" replace />} />
          <Route path="/dev/eventos" element={<Navigate to="/eventos" replace />} />
          <Route path="/dev/relatorios" element={<Navigate to="/relatorios" replace />} />
          <Route path="/dev/tags" element={<Navigate to="/membros" replace />} />
          <Route path="/dev/logs" element={<Navigate to="/relatorios" replace />} />
          <Route path="/dev/ajuda" element={<Navigate to="/igreja" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
      <AssistiveTouchDev />
    </HashRouter>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service worker registrado:', registration.scope);
        })
        .catch((error) => {
          console.error('Falha ao registrar service worker:', error);
        });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}
