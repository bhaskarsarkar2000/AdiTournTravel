import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const API = import.meta.env.VITE_API_URL || '/api';

const statusBadge = { confirmed: 'badge-confirmed', pending: 'badge-pending', cancelled: 'badge-cancelled', completed: 'badge-confirmed' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/bookings/my-bookings`)
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await axios.patch(`${API}/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

        {loading && <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" /></div>}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No bookings yet</h2>
            <p className="text-gray-400 mb-6">Start your journey today!</p>
            <a href="/search" className="btn-primary">Search Buses</a>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">
                      {b.schedule?.route?.source?.name || b.boardingPoint} → {b.schedule?.route?.destination?.name || b.droppingPoint}
                    </span>
                    <span className={statusBadge[b.status] || 'badge-pending'}>{b.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Booking ID: <span className="font-mono font-medium">{b.bookingId}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {b.schedule?.journeyDate ? new Date(b.schedule.journeyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                  <p className="text-sm text-gray-500">Seats: <strong>{b.selectedSeats?.join(', ')}</strong></p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">₹{b.totalAmount}</p>
                  <p className="text-xs text-gray-400 capitalize">{b.payment?.status || 'pending'}</p>
                  {b.status === 'confirmed' && (
                    <button onClick={() => handleCancel(b._id)} className="btn-danger text-xs mt-2">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {b.passengers?.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Passengers</p>
                  <div className="flex flex-wrap gap-2">
                    {b.passengers.map((p, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {p.name}, {p.age} — Seat {p.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
