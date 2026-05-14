import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Teams from './pages/Teams';
import Scoring from './pages/Scoring';
import Attendance from './pages/Attendance';
import Tournaments from './pages/Tournaments';
import Standings from './pages/Standings';
import Schedule from './pages/Schedule';
import MatchDetail from './pages/MatchDetail';
import TeamDetail from './pages/TeamDetail';
import PlayerDetail from './pages/PlayerDetail';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import Pipeline from './pages/Pipeline';
import UserManagement from './pages/UserManagement';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { seedInitialData } from './lib/seed';

export default function App() {
  React.useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id" element={<PlayerDetail />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              <Route path="/scoring" element={<Scoring />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/matches/:id" element={<MatchDetail />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
