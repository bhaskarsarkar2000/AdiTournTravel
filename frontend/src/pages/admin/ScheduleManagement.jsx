import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';

const API = import.meta.env.VITE_API_URL || '/api';

const defaultSchedule = { 
  bus: '', 
  route: '', 
  driver: '', 
  isDaily: false,
  journeyDate: '', 
  daysOfWeek: [],
  departureTime: '', 
  arrivalTime: '', 
  fare: '' 
};

const daysOfWeekList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultSchedule);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

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
      const submitData = { ...form, fare: Number(form.fare) };
      if (editingId) {
        const { data } = await axios.put(`${API}/schedules/${editingId}`, submitData);
        setSchedules(schedules.map((s) => s._id === editingId ? data.schedule : s));
        toast.success('Schedule updated!');
        setEditingId(null);
      } else {
        const { data } = await axios.post(`${API}/schedules`, submitData);
        setSchedules([data.schedule, ...schedules]);
        toast.success('Schedule created!');
      }
      setShowForm(false);
      setForm(defaultSchedule);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDayToggle = (day) => {
    setForm({
      ...form,
      daysOfWeek: form.daysOfWeek.includes(day)
        ? form.daysOfWeek.filter((d) => d !== day)
        : [...form.daysOfWeek, day],
    });
  };

  const handleEdit = (schedule) => {
    setForm({
      bus: schedule.bus?._id || '',
      route: schedule.route?._id || '',
      driver: schedule.driver?._id || '',
      isDaily: schedule.isDaily || false,
      journeyDate: schedule.journeyDate || '',
      daysOfWeek: schedule.daysOfWeek || [],
      departureTime: schedule.departureTime || '',
      arrivalTime: schedule.arrivalTime || '',
      fare: schedule.fare || '',
    });
    setEditingId(schedule._id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setForm(defaultSchedule);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await axios.delete(`${API}/schedules/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
      toast.success('Schedule deleted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleStatusChange = async (id, status) => {
    await axios.put(`${API}/schedules/${id}`, { status });
    setSchedules(schedules.map((s) => s._id === id ? { ...s, status } : s));
    toast.success('Status updated');
  };

  const statusColors = { scheduled: 'bg-blue-100 text-blue-700', departed: 'bg-yellow-100 text-yellow-700', arrived: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-b from-white via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient-animated">📅 Schedule Management</h1>
              <p className="text-gray-600 mt-2">Create and manage bus schedules with daily recurring options</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary shadow-lg hover:shadow-xl">{showForm ? 'Cancel' : '+ Create Schedule'}</button>
          </div>

        {showForm && (
          <div className="glass-card mb-8 bg-gradient-to-br from-white/80 to-blue-50/80 border-2 border-indigo-200">
            <h2 className="font-bold text-2xl mb-6 text-indigo-900">✨ {editingId ? 'Edit Schedule' : 'Create New Schedule'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">🚌 Bus</label>
                  <select value={form.bus} onChange={(e) => setForm({ ...form, bus: e.target.value })} className="input-field font-medium" required>
                    <option value="">Select Bus</option>
                    {buses.map((b) => <option key={b._id} value={b._id}>{b.busName} ({b.busNumber})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">🛣️ Route</label>
                  <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="input-field font-medium" required>
                    <option value="">Select Route</option>
                    {routes.map((r) => <option key={r._id} value={r._id}>{r.routeName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">👨‍✈️ Driver</label>
                  <select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} className="input-field font-medium">
                    <option value="">Select Driver (optional)</option>
                    {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">💰 Fare per Seat (₹)</label>
                  <input type="number" min="1" placeholder="e.g. 350" value={form.fare} onChange={(e) => setForm({ ...form, fare: e.target.value })} className="input-field font-medium" required />
                </div>
              </div>

              {/* Daily Schedule Toggle */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDaily}
                    onChange={(e) => setForm({ ...form, isDaily: e.target.checked, journeyDate: '', daysOfWeek: [] })}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-700">📅 Daily Recurring Schedule</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Enable this for schedules that run on specific days every week</p>
              </div>

              {/* Journey Date or Days of Week */}
              {form.isDaily ? (
                <div>
                  <label className="text-sm text-gray-500 font-medium block mb-3">Select Days of Week</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeekList.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`p-2 rounded-lg border-2 text-center font-semibold text-sm transition-all ${
                          form.daysOfWeek.includes(day)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {form.daysOfWeek.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">Select at least one day</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-500 font-medium block mb-1">Journey Date</label>
                  <input
                    type="date"
                    value={form.journeyDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, journeyDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">🕐 Departure Time</label>
                  <input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="input-field font-medium" required />
                </div>
                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">🕑 Arrival Time</label>
                  <input type="time" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} className="input-field font-medium" required />
                </div>
              </div>

              <div className="flex items-end gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 text-lg font-bold shadow-lg hover:shadow-xl">🚀 {editingId ? 'Update Schedule' : 'Create Schedule'}</button>
                <button type="button" onClick={handleCloseForm} className="btn-secondary flex-1 text-lg font-bold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
            <p className="text-gray-600 mt-4">Loading schedules...</p>
          </div>
        ) : (
          <div className="glass-card bg-gradient-to-br from-white/80 to-blue-50/80 border-2 border-indigo-200 overflow-x-auto rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-indigo-700 border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                  <th className="pb-3 font-bold px-4">Route</th>
                  <th className="pb-3 font-bold px-4">Bus</th>
                  <th className="pb-3 font-bold px-4">Type</th>
                  <th className="pb-3 font-bold px-4">Date / Days</th>
                  <th className="pb-3 font-bold px-4">Time</th>
                  <th className="pb-3 font-bold px-4">Fare</th>
                  <th className="pb-3 font-bold px-4">Seats</th>
                  <th className="pb-3 font-bold px-4">Status</th>
                  <th className="pb-3 font-bold px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-indigo-50/50 transition-all">
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900">{s.route?.source?.name || '—'}</span>
                      <span className="text-indigo-400 mx-1">→</span>
                      <span className="font-bold text-gray-900">{s.route?.destination?.name || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{s.bus?.busName || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.isDaily ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {s.isDaily ? '📅 Daily' : '📆 Once'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {s.isDaily 
                        ? (s.daysOfWeek && s.daysOfWeek.length > 0 
                          ? s.daysOfWeek.map(d => d.slice(0, 3)).join(', ')
                          : '—')
                        : (s.journeyDate ? new Date(s.journeyDate).toLocaleDateString('en-IN') : '—')
                      }
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{s.departureTime} - {s.arrivalTime}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">₹{s.fare}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{s.availableSeats}</td>
                    <td className="py-3 px-4">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-bold border-0 cursor-pointer ${statusColors[s.status]}`}
                      >
                        {['scheduled', 'departed', 'arrived', 'cancelled'].map((st) => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(s)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold transition-all">✏️ Edit</button>
                        <button onClick={() => handleDelete(s._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-all">🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-500 font-medium">No schedules created yet. Click "+ Create Schedule" to add one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
