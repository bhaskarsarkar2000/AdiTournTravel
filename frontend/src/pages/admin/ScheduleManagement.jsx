import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';

const API = import.meta.env.VITE_API_URL || '/api';

const defaultSchedule = { bus: '', route: '', driver: '', journeyDate: '', departureTime: '', arrivalTime: '', fare: '' };

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultSchedule);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/schedules`),
      axios.get(`${API}/buses`),
      axios.get(`${API}/routes`),
      axios.get(`${API}/admin/users?role=driver`),
    ]).then(([s, b, r, d]) => {
      setSchedules(s.data.schedules || []);
      setBuses(b.data.buses || []);
      setRoutes(r.data.routes || []);
      setDrivers(d.data.users || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/schedules`, { ...form, fare: Number(form.fare) });
      setSchedules([data.schedule, ...schedules]);
      setShowForm(false);
      setForm(defaultSchedule);
      toast.success('Schedule created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    await axios.put(`${API}/schedules/${id}`, { status });
    setSchedules(schedules.map((s) => s._id === id ? { ...s, status } : s));
    toast.success('Status updated');
  };

  const statusColors = { scheduled: 'bg-blue-100 text-blue-700', departed: 'bg-yellow-100 text-yellow-700', arrived: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Schedule Management</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Create Schedule'}</button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-lg mb-4">Create New Schedule</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Bus</label>
                <select value={form.bus} onChange={(e) => setForm({ ...form, bus: e.target.value })} className="input-field" required>
                  <option value="">Select Bus</option>
                  {buses.map((b) => <option key={b._id} value={b._id}>{b.busName} ({b.busNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Route</label>
                <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="input-field" required>
                  <option value="">Select Route</option>
                  {routes.map((r) => <option key={r._id} value={r._id}>{r.routeName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Driver</label>
                <select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} className="input-field">
                  <option value="">Select Driver (optional)</option>
                  {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Journey Date</label>
                <input type="date" value={form.journeyDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, journeyDate: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Departure Time</label>
                <input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Arrival Time</label>
                <input type="time" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Fare per Seat (₹)</label>
                <input type="number" min="1" placeholder="e.g. 350" value={form.fare} onChange={(e) => setForm({ ...form, fare: e.target.value })} className="input-field" required />
              </div>
              <div className="flex items-end gap-3">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" /></div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-semibold">Route</th>
                  <th className="pb-3 font-semibold">Bus</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Fare</th>
                  <th className="pb-3 font-semibold">Seats</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <span className="font-medium">{s.route?.source?.name || '—'}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span className="font-medium">{s.route?.destination?.name || '—'}</span>
                    </td>
                    <td className="py-3 text-gray-600">{s.bus?.busName || '—'}</td>
                    <td className="py-3 text-gray-600">{s.journeyDate ? new Date(s.journeyDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="py-3">{s.departureTime} - {s.arrivalTime}</td>
                    <td className="py-3 font-semibold">₹{s.fare}</td>
                    <td className="py-3 text-gray-600">{s.availableSeats}</td>
                    <td className="py-3">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[s.status]}`}
                      >
                        {['scheduled', 'departed', 'arrived', 'cancelled'].map((st) => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No schedules yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
