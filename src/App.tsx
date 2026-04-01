import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './providers';
import { Toaster } from 'sonner';

import Home from './pages/Home';
import Login from './pages/Login';
import Setup from './pages/Setup';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Receive from './pages/Receive';
import Returns from './pages/Returns';
import Services from './pages/Services';
import Schedule from './pages/Schedule';
import Contractors from './pages/Contractors';
import Employees from './pages/Employees';
import Payments from './pages/Payments';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="receive" element={<Receive />} />
            <Route path="returns" element={<Returns />} />
            <Route path="services" element={<Services />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="contractors" element={<Contractors />} />
            <Route path="employees" element={<Employees />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" closeButton />
    </Providers>
  );
}
