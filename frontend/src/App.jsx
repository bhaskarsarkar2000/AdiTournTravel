import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import DriverLogin from './pages/DriverLogin';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import BusManagement from './pages/admin/BusManagement';
import RouteManagement from './pages/admin/RouteManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';
import UserManagement from './pages/admin/UserManagement';

import DriverDashboard from './pages/driver/DriverDashboard';

import SearchBus from './pages/traveller/SearchBus';
import BookingPage from './pages/traveller/BookingPage';
import MyBookings from './pages/traveller/MyBookings';
import TravellerDashboard from './pages/traveller/TravellerDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <AdminLogin />} />
      <Route path="/driver" element={user?.role === 'driver' ? <DriverDashboard /> : <DriverLogin />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      <Route path="/admin/buses" element={<ProtectedRoute roles={['admin']}><BusManagement /></ProtectedRoute>} />
      <Route path="/admin/routes" element={<ProtectedRoute roles={['admin']}><RouteManagement /></ProtectedRoute>} />
      <Route path="/admin/schedules" element={<ProtectedRoute roles={['admin']}><ScheduleManagement /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />

      <Route path="/traveller" element={<ProtectedRoute roles={['traveller']}><TravellerDashboard /></ProtectedRoute>} />
      <Route path="/search" element={<SearchBus />} />
      <Route path="/book/:scheduleId" element={<BookingPage />} />
      <Route path="/my-bookings" element={<ProtectedRoute roles={['traveller']}><MyBookings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
