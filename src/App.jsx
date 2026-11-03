import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { Calendar } from './pages/Calendar';
import { Goals } from './pages/Goals';
import { Analytics } from './pages/Analytics';
import { Focus } from './pages/Focus';
import { Journal } from './pages/Journal';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Main Workspace (Direct access for Arya) */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="habits" element={<Habits />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="goals" element={<Goals />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="focus" element={<Focus />} />
                <Route path="journal" element={<Journal />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all redirect to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
