import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';
import CursorGlow from './components/CursorGlow';

// Public pages
import Home          from './pages/Home';
import AdminLogin    from './pages/AdminLogin';
import StationLogin  from './pages/StationLogin';
import Notifications from './pages/Notifications';
import Profile       from './pages/Profile';
import History       from './pages/History';

// Admin pages
import AdminLayout   from './pages/admin/AdminLayout';
import Dashboard     from './pages/admin/Dashboard';
import StationsPage  from './pages/admin/StationsPage';
import QueuesPage    from './pages/admin/QueuesPage';
import UsersPage     from './pages/admin/UsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ConfigPage    from './pages/admin/ConfigPage';

// Station admin
import StationAdmin  from './pages/StationAdmin';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/"              element={<Home />} />
        <Route path="/admin-login"   element={<AdminLogin />} />
        <Route path="/station-login" element={<StationLogin />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile"       element={<Profile />} />
        <Route path="/history"       element={<History />} />

        {/* Admin (nested) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index          element={<Dashboard />} />
          <Route path="stations" element={<StationsPage />} />
          <Route path="queues"   element={<QueuesPage />} />
          <Route path="users"    element={<UsersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="config"   element={<ConfigPage />} />
        </Route>

        {/* Station */}
        <Route path="/station-admin" element={<StationAdmin />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          {/* Background layers */}
          <div className="bg-grid" aria-hidden="true" />
          <div className="bg-orb bg-orb--blue" aria-hidden="true" />
          <div className="bg-orb bg-orb--cyan" aria-hidden="true" />
          <div className="bg-orb bg-orb--emerald" aria-hidden="true" />
          {/* Cursor glow effect */}
          <CursorGlow />
          <AnimatedRoutes />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
