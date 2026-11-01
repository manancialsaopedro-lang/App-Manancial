
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store';
import { useAuthSync } from './hooks/useAuthSync';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layouts
import { AppLayout } from './layouts/AppLayout';

// Features - Auth
import { LoginPage } from './features/Auth/LoginPage';
import { AuthConfirmPage } from './features/Auth/AuthConfirmPage';

// Features - Welcome & Portais
import { ChurchWelcomePage } from './features/Church/ChurchWelcomePage';
import { CampWelcomePage } from './features/Camp/CampWelcomePage';
import { CampInfoPage } from './features/Camp/CampInfoPage';
import { CampPastorPaymentsPage } from './features/Camp/CampPastorPaymentsPage';
import { WelcomePage } from './features/Welcome/WelcomePage';

// Features - Gestão da Igreja Manancial
import { ChurchMembersPage } from './features/Church/pages/ChurchMembersPage';
import { ChurchAttendancePage } from './features/Church/pages/ChurchAttendancePage';
import { ChurchWhatsAppPage } from './features/Church/pages/ChurchWhatsAppPage';
import { ChurchReportsPage } from './features/Church/pages/ChurchReportsPage';

// Features - Gymkhana
import { GymDashboard } from './features/Gymkhana/GymDashboard';
import { ScorePage } from './features/Gymkhana/ScorePage';
import { TeamsOverview } from './features/Gymkhana/TeamsOverview';
import { PeopleList } from './features/People/PeopleList';
import { ProofsList } from './features/Proofs/ProofsList';
import { ProofDetail } from './features/Proofs/ProofDetail';
import { ProofRun } from './features/Proofs/ProofRun';
import { ProofJudge } from './features/Proofs/ProofJudge';
import { TeamDetail } from './features/Gymkhana/TeamDetail';
import { MaterialsManager } from './features/Gymkhana/MaterialsManager';
import { ScheduleManager } from './features/Gymkhana/ScheduleManager';

// Features - Org
import { OrgHome } from './features/Org/OrgHome';
import { OrgCashierHub } from './features/Org/OrgCashierHub';
import { OrgDashboard } from './features/Org/OrgDashboard';
import { OrgFinancials } from './features/Org/OrgFinancials';
import { TransactionDetail } from './features/Org/TransactionDetail';
import { OrgCanteen } from './features/Org/OrgCanteen';
import { OrgAnalytics } from './features/Org/OrgAnalytics';
import { OrgCostDetail } from './features/Org/OrgCostDetail';
import { OrgRevenueDetail } from './features/Org/OrgRevenueDetail';
import { OrgDailyClose } from './features/Org/OrgDailyClose';
import { OrgStockEditor } from './features/Org/OrgStockEditor';
import { OrgStockQuickWizard } from './features/Org/OrgStockQuickWizard';
import { OrgPurchaseHistory } from './features/Org/OrgPurchaseHistory';
import { OrgPurchasePersonHistory } from './features/Org/OrgPurchasePersonHistory';

// New Detailed Pages
import { OrgAdherence } from './features/Org/OrgAdherence';
import { OrgReceivables } from './features/Org/OrgReceivables';
import { OrgForecast } from './features/Org/OrgForecast';
import { OrgCollected } from './features/Org/OrgCollected';
import { OfflinePage } from './features/Offline/OfflinePage';

// Features - Member
import { MemberHome } from './features/Member/MemberHome';
import { ChurchMemberHome } from './features/Church/ChurchMemberHome';
import { MemberCompleteRegistrationPage } from './features/Member/MemberCompleteRegistrationPage';

// Features - Visitor Wizard & Landing Page (Aberto / Sem Auth)
import { VisitorWizardPage } from './features/Visitor/VisitorWizardPage';
import { ChurchLandingPage } from './features/Landing/ChurchLandingPage';

// Features - Dev Portal (Gestão Eclesiástica)
import { DevLayout } from './features/DevPortal/layouts/DevLayout';
import { DevChurchInfoPage } from './features/DevPortal/pages/DevChurchInfoPage';
import { DevRequestsPage } from './features/DevPortal/pages/DevRequestsPage';
import { DevNotificationsPage } from './features/DevPortal/pages/DevNotificationsPage';
import { DevGenericPage } from './features/DevPortal/pages/DevGenericPage';
import { DevVisitorsPage } from './features/DevPortal/pages/DevVisitorsPage';

// Dev Toolbar
import { DevToolbar } from './components/DevToolbar';

const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { user, authReady } = useAppStore();
  const location = useLocation();

  if (!authReady) {
    return <div className="p-6 text-gray-500">Carregando…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Wrapper component to use hooks
const App = () => {
  // Activate Auth Listener
  useAuthSync();

  return (
    <HashRouter>
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

        {/* Portal de Gestão Principal (Estilo Basiléia) - Abre como Primeira Tela do App */}
        <Route path="/" element={<DevLayout />}>
          <Route index element={<DevChurchInfoPage />} />
          <Route path="igreja" element={<DevChurchInfoPage />} />
          <Route path="solicitacoes" element={<DevRequestsPage />} />
          <Route path="notificacoes" element={<DevNotificationsPage />} />
        </Route>

        {/* Gestão Antiga de Membros & Presença */}
        <Route path="/gestao/membros" element={<RequireAuth><ChurchMembersPage /></RequireAuth>} />
        <Route path="/gestao/presenca" element={<RequireAuth><ChurchAttendancePage /></RequireAuth>} />
        <Route path="/gestao/mensagens" element={<RequireAuth><ChurchWhatsAppPage /></RequireAuth>} />
        <Route path="/gestao/relatorios" element={<RequireAuth><ChurchReportsPage /></RequireAuth>} />

        {/* Submódulo Acampamento Manancial (Preservado e Isolado) */}
        <Route path="/acampamento" element={<RequireAuth><CampWelcomePage /></RequireAuth>} />
        <Route path="/acampamento/home" element={<RequireAuth><CampWelcomePage /></RequireAuth>} />
        <Route path="/acampamento/informacoes" element={<RequireAuth><CampInfoPage /></RequireAuth>} />
        <Route path="/acampamento/pagamentos" element={<RequireAuth><CampPastorPaymentsPage /></RequireAuth>} />
        <Route path="/gestao/acampamento" element={<Navigate to="/acampamento/pagamentos" replace />} />
        
        {/* Módulo Organização */}
        <Route path="/org" element={<RequireAuth><AppLayout sector="org" /></RequireAuth>}>
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
          
          <Route path="financials" element={<OrgFinancials />} />
          <Route path="financials/:id" element={<TransactionDetail />} />
          
          <Route path="canteen" element={<OrgCanteen />} />
          <Route path="canteen/stock/new" element={<OrgStockQuickWizard />} />
          <Route path="canteen/stock" element={<OrgStockEditor />} />
          <Route path="history" element={<OrgPurchaseHistory />} />
          <Route path="history/:personId" element={<OrgPurchasePersonHistory />} />
          <Route path="closing" element={<OrgDailyClose />} />
          
          <Route path="purchases" element={<Navigate to="financials" />} />
        </Route>

        {/* Módulo Gincana */}
        <Route path="/gincana" element={<RequireAuth><AppLayout sector="gincana" /></RequireAuth>}>
          <Route index element={<Navigate to="dash" />} />
          <Route path="dash" element={<GymDashboard />} />
          
          <Route path="placar" element={<ScorePage />} />
          <Route path="equipes-geral" element={<TeamsOverview />} />

          <Route path="list" element={<PeopleList mode="gincana" />} />
          <Route path="equipes/:teamId" element={<TeamDetail />} />
          
          <Route path="materiais" element={<MaterialsManager />} />
          
          <Route path="proofs">
            <Route index element={<ProofsList />} />
            <Route path=":proofId" element={<ProofDetail />} />
            <Route path=":proofId/executar" element={<ProofRun />} />
            <Route path=":proofId/julgar" element={<ProofJudge />} />
            <Route path=":proofId/pontuacao" element={<Navigate to="../executar" relative="path" />} />
          </Route>
          
          <Route path="time" element={<ScheduleManager />} />
        </Route>

        {/* Espaço do Membro da Igreja (App Principal) */}
        <Route path="/igreja/membro" element={<RequireAuth><ChurchMemberHome /></RequireAuth>} />

        {/* Sub-App: Membro / Participante no Acampamento */}
        <Route path="/membro" element={<RequireAuth><AppLayout sector="membro" /></RequireAuth>}>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<MemberHome />} />
          <Route path="cronograma" element={<ScheduleManager />} />
          <Route path="placar" element={<ScorePage />} />
        </Route>

        {/* Novo Portal de Gestão Eclesiástica & Dev (Estilo Basiléia com cores Manancial) */}
        <Route path="/dev" element={<RequireAuth><DevLayout /></RequireAuth>}>
          <Route index element={<Navigate to="igreja" replace />} />
          <Route path="igreja" element={<DevChurchInfoPage />} />
          <Route path="solicitacoes" element={<DevRequestsPage />} />
          <Route path="notificacoes" element={<DevNotificationsPage />} />
          
          {/* Subpáginas com empty state coerente */}
          <Route path="membros" element={<DevGenericPage title="Gestão de Membros" description="Módulo de cadastro eclesiástico com ficha completa em desenvolvimento." />} />
          <Route path="membros/visitantes" element={<DevVisitorsPage />} />
          <Route path="membros/:sub" element={<DevGenericPage title="Ficha de Membro" description="Visualização detalhada e histórico eclesiástico do participante." />} />
          <Route path="celulas" element={<DevGenericPage title="Células & Grupos Familiares" description="Gerenciamento de líderes, encontros semanais e relatórios de célula." />} />
          <Route path="cursos" element={<DevGenericPage title="Cursos & Treinamentos" description="Turmas de batismo, discipulado e escola ministerial." />} />
          <Route path="eventos" element={<DevGenericPage title="Eventos & Cultos Especiais" description="Calendário anual de conferências e programações da igreja." />} />
          <Route path="tags" element={<DevGenericPage title="Tags & Segmentações" description="Segmentação de membros por dons, ministérios e faixas etárias." />} />
          <Route path="logs" element={<DevGenericPage title="Histórico & Auditoria" description="Logs de operações administrativas e registros do sistema." />} />
          <Route path="ajuda" element={<DevGenericPage title="Central de Ajuda" description="Guias de uso e suporte ao administrador da igreja." />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <DevToolbar />
    </HashRouter>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

if (window.location.hash && window.location.hash !== '#/') {
    // Keep hash logic if needed
}

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
    // Em desenvolvimento (localhost), desregistra qualquer service worker ativo para não interceptar o Vite
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}
