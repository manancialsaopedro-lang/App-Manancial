
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

// Features - Welcome
import { WelcomePage } from './features/Welcome/WelcomePage';

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

        {/* Rotas Protegidas */}
        <Route path="/" element={<RequireAuth><WelcomePage /></RequireAuth>} />
        
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service worker registrado:', registration.scope);
        })
        .catch((error) => {
          console.error('Falha ao registrar service worker:', error);
        });
      return;
    }

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  });
}
