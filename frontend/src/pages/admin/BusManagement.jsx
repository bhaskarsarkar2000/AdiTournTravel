import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import SeatSelector from '../../components/SeatSelector';

const API = import.meta.env.VITE_API_URL || '/api';

const defaultBus = { busName: '', busNumber: '', type: 'AC', totalSeats: 40, seatsPerRow: 4, amenities: [], registrationNumber: '', manufacturer: '', year: '' };

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultBus);
  const [selectedBus, setSelectedBus] = useState(null);
  const [amenityInput, setAmenityInput] = useState('');
  const [driverMap, setDriverMap] = useState({});

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
  }, []);

  const fetchBuses = () => axios.get(`${API}/buses`).then(({ data }) => setBuses(data.buses || [])).finally(() => setLoading(false));
  const fetchDrivers = () => axios.get(`${API}/admin/users?role=driver`).then(({ data }) => { setDrivers(data.users || []); });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/buses`, { ...form, year: form.year ? Number(form.year) : undefined });
      setBuses([data.bus, ...buses]);
      setShowForm(false);
      setForm(defaultBus);
      toast.success('Bus added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add bus');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this bus?')) return;
    await axios.delete(`${API}/buses/${id}`);
    setBuses(buses.filter((b) => b._id !== id));
    toast.success('Bus deactivated');
  };

  const handleAssignDriver = async (busId, driverId) => {
    try {
      await axios.put(`${API}/buses/${busId}/assign-driver`, { driverId });
      toast.success('Driver assigned!');
      fetchBuses();
    } catch {
      toast.error('Failed to assign driver');
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setForm({ ...form, amenities: [...form.amenities, amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Bus Management</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add New Bus'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-lg mb-4">Add New Bus</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Bus Name</label>
                <input type="text" placeholder="e.g. Volvo Express" value={form.busName} onChange={(e) => setForm({ ...form, busName: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Bus Number</label>
                <input type="text" placeholder="e.g. MH12AB1234" value={form.busNumber} onChange={(e) => setForm({ ...form, busNumber: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                  {['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Total Seats</label>
                <input type="number" min="10" max="60" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Seats per Row</label>
                <select value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: Number(e.target.value) })} className="input-field">
                  {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Reg. Number</label>
                <input type="text" placeholder="Registration number" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Manufacturer</label>
                <input type="text" placeholder="e.g. Volvo, Tata" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Year</label>
                <input type="number" placeholder="e.g. 2022" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500 font-medium block mb-1">Amenities</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. WiFi, AC, Charging Points" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} className="input-field flex-1" />
                  <button type="button" onClick={addAmenity} className="btn-secondary px-4">Add</button>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {form.amenities.map((a) => (
                    <span key={a} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {a}
                      <button type="button" onClick={() => setForm({ ...form, amenities: form.amenities.filter((x) => x !== a) })} className="ml-1 text-blue-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="btn-primary">Add Bus</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {buses.map((bus) => (
              <div key={bus._id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{bus.busName}</h3>
                    <p className="text-sm text-gray-500">{bus.busNumber}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${bus.type === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{bus.type}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Total Seats</p>
                    <p className="font-bold">{bus.totalSeats}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Driver</p>
                    <p className="font-medium text-xs truncate">{bus.driver?.name || 'Unassigned'}</p>
                  </div>
                </div>

                {bus.amenities?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {bus.amenities.map((a) => <span key={a} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a}</span>)}
                  </div>
                )}

                <div className="space-y-2">
                  <select
                    className="input-field text-sm"
                    defaultValue={bus.driver?._id || ''}
                    onChange={(e) => e.target.value && handleAssignDriver(bus._id, e.target.value)}
                  >
                    <option value="">Assign Driver...</option>
                    {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedBus(selectedBus?._id === bus._id ? null : bus)} className="btn-secondary text-xs flex-1 py-1.5">
                      {selectedBus?._id === bus._id ? 'Hide Seats' : 'View Seats'}
                    </button>
                    <button onClick={() => handleDelete(bus._id)} className="btn-danger text-xs px-3 py-1.5">Remove</button>
                  </div>
                </div>

                {selectedBus?._id === bus._id && (
                  <div className="mt-4">
                    <SeatSelector seats={bus.seats || []} bookedSeats={[]} selectedSeats={[]} />
                  </div>
                )}
              </div>
            ))}
            {buses.length === 0 && (
              <div className="col-span-3 text-center py-20 text-gray-400">
                <div className="text-5xl mb-3">🚌</div>
                <p>No buses yet. Add your first bus!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
