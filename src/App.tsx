import { Routes, Route } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import MobileAppPage from './pages/MobileAppPage';
import CLsPage from './pages/CLsPage';
import CLProfilePage from './pages/CLProfilePage';
import ClientsPage from './pages/ClientsPage';
import MapPage from './pages/MapPage';
import SchedulePage from './pages/SchedulePage';
import ReportsPage from './pages/ReportsPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/mobile-app" element={<MobileAppPage />} />
      <Route path="/cls" element={<CLsPage />} />
      <Route path="/cls/:id" element={<CLProfilePage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
