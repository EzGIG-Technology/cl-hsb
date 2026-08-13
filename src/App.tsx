import { Routes, Route } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import MobileAppPage from './pages/MobileAppPage';
import CLsPage from './pages/CLsPage';
import CLProfilePage from './pages/CLProfilePage';
import ClientsPage from './pages/ClientsPage';
import ClientProfilePage from './pages/ClientProfilePage';
import MapPage from './pages/MapPage';
import SchedulePage from './pages/SchedulePage';
import ReportsPage from './pages/ReportsPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import BookingsPage from './pages/BookingsPage';
import VisitsPage from './pages/VisitsPage';
import PayrollPage from './pages/PayrollPage';
import DisputesPage from './pages/DisputesPage';
import PackagesPage from './pages/PackagesPage';
import PackageDetailPage from './pages/PackageDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/mobile-app" element={<MobileAppPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/cls" element={<CLsPage />} />
      <Route path="/cls/:id" element={<CLProfilePage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/clients/:id" element={<ClientProfilePage />} />
      <Route path="/visits" element={<VisitsPage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/disputes" element={<DisputesPage />} />
      <Route path="/packages" element={<PackagesPage />} />
      <Route path="/packages/:id" element={<PackageDetailPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
