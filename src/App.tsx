import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';

import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { CalendarPage } from './pages/CalendarPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ChatsPage } from './pages/ChatsPage';
import { FinancesPage } from './pages/FinancesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPageSimple as AdminPage } from './pages/AdminPageSimple';

const queryClient = new QueryClient();

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider locale={ruRU}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/calendar" replace />} />
              <Route path="calendar" element={<ChatsPage />} />
              <Route path="products" element={<Navigate to="/resources" replace />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="chats" element={<ChatsPage />} />
              <Route path="finances" element={<FinancesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;