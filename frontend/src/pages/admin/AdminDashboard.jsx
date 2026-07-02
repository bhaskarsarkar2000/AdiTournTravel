import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const API = import.meta.env.VITE_API_URL || '/api';

const statCards = [
  { key: 'totalUsers', label: 'Travellers', icon: '🧳', color: 'bg-blue-500' },
  { key: 'totalDrivers', label: 'Drivers', icon: '🚌', color: 'bg-green-500' },
  { key: 'totalBuses', label: 'Active Buses', icon: '🚍', color: 'bg-purple-500' },
  { key: 'totalBookings', label: 'Bookings', icon: '🎫', color: 'bg-orange-500' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/admin/dashboard`)
      .then(({ data }) => {
        setStats(data.stats || {});
        setRecentBookings(data.recentBookings || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const navCards = [
    { to: '/admin/buses', icon: '🚌', label: 'Manage Buses', desc: 'Add, edit, configure seat layout' },
    { to: '/admin/routes', icon: '🗺️', label: 'Manage Routes', desc: 'Create and edit travel routes' },
    { to: '/admin/schedules', icon: '📅', label: 'Schedules', desc: 'Set departure times and fares' },
    { to: '/admin/users', icon: '👥', label: 'Users & Drivers', desc: 'Manage accounts' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((s) => (
                <div key={s.key} className="card">
                  <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>{s.icon}</div>
                  <p className="text-3xl font-bold text-gray-800">{stats[s.key] ?? '—'}</p>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="card mb-8 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-4xl font-bold text-green-600">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {navCards.map((c) => (
                <div key={c.to} onClick={() => navigate(c.to)} className="card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="text-4xl mb-2">{c.icon}</div>
                  <h3 className="font-bold text-gray-800">{c.label}</h3>
                  <p className="text-gray-500 text-xs mt-1">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="font-bold text-lg mb-4">Recent Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-semibold">Booking ID</th>
                      <th className="pb-2 font-semibold">Traveller</th>
                      <th className="pb-2 font-semibold">Route</th>
                      <th className="pb-2 font-semibold">Amount</th>
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs">{b.bookingId}</td>
                        <td className="py-3">{b.traveller?.name || '—'}</td>
                        <td className="py-3">
                          {b.schedule?.route?.source?.name || '—'} → {b.schedule?.route?.destination?.name || '—'}
                        </td>
                        <td className="py-3 font-semibold">₹{b.totalAmount}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentBookings.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">No bookings yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
