import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import MobileAppPage from './pages/MobileAppPage';
import CLsPage from './pages/CLsPage';
import CLProfilePage from './pages/CLProfilePage';
import CustomersPage from './pages/CustomersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import FinancePage from './pages/FinancePage';
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
      <Route path="/cls" element={<CLsPage key="cl" staffType="cl" />} />
      <Route path="/cls/:id" element={<CLProfilePage />} />
      <Route path="/spa" element={<CLsPage key="spa" staffType="spa" />} />
      <Route path="/spa/:id" element={<CLProfilePage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/customers/:id" element={<CustomerProfilePage />} />
      <Route path="/clients" element={<Navigate to="/customers" replace />} />
      <Route path="/clients/:id" element={<LegacyCustomerRedirect />} />
      <Route path="/visits" element={<VisitsPage />} />
      <Route path="/finance" element={<FinancePage />} />
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

/** Old /clients/:id links (bookmarks, shared URLs) keep working after the Clients → Customers rename. */
function LegacyCustomerRedirect() {
  const { id } = useParams();
  return <Navigate to={`/customers/${id}`} replace />;
}
