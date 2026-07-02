import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MapView from '../../components/MapView';

const API = import.meta.env.VITE_API_URL || '/api';

export default function SearchBus() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    source: params.get('source') || '',
    destination: params.get('destination') || '',
    date: params.get('date') || new Date().toISOString().split('T')[0],
  });
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    if (params.get('source') && params.get('destination') && params.get('date')) {
      search();
    }
  }, []);

  const search = async (e) => {
    e?.preventDefault();
    if (!form.source || !form.destination || !form.date) return toast.error('Fill all fields');
    setLoading(true);
    setSearched(true);
    setSelectedSchedule(null);
    try {
      const { data } = await axios.get(`${API}/schedules/search`, { params: form });
      setSchedules(data.schedules || []);
    } catch {
      toast.error('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const busTypeColor = {
    AC: 'bg-blue-100 text-blue-700',
    'Non-AC': 'bg-gray-100 text-gray-700',
    Sleeper: 'bg-purple-100 text-purple-700',
    'Semi-Sleeper': 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-8 px-4">
        <form onSubmit={search} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-3">
          <input type="text" placeholder="From (City)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input-field" required />
          <input type="text" placeholder="To (City)" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="input-field" required />
          <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Searching...' : 'Search 🔍'}
          </button>
        </form>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {!searched && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Search for buses above</h2>
            <p className="text-gray-400">Enter your departure city, destination and travel date</p>
          </div>
        )}

        {searched && !loading && schedules.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No buses found</h2>
            <p className="text-gray-400">Try a different date or route</p>
          </div>
        )}

        {schedules.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">
                {schedules.length} buses found from <span className="text-blue-600">{form.source}</span> to <span className="text-blue-600">{form.destination}</span>
              </h2>
              {schedules.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelectedSchedule(s)}
                  className={`card cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 ${selectedSchedule?._id === s._id ? 'border-blue-500 border-2' : ''}`}
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{s.bus?.busName || 'Bus'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${busTypeColor[s.bus?.type] || 'bg-gray-100 text-gray-700'}`}>{s.bus?.type}</span>
                      </div>
                      <p className="text-xs text-gray-400">{s.bus?.busNumber}</p>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{s.departureTime}</p>
                        <p className="text-xs text-gray-500">{s.route?.source?.name}</p>
                      </div>
                      <div className="text-center text-gray-400">
                        <div className="text-xs">{s.route?.estimatedDuration}</div>
                        <div className="border-t border-dashed border-gray-300 w-16 my-1" />
                        <div className="text-xs">→</div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{s.arrivalTime}</p>
                        <p className="text-xs text-gray-500">{s.route?.destination?.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₹{s.fare}</p>
                      <p className="text-xs text-gray-500">{s.availableSeats} seats left</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/book/${s._id}`); }}
                        className="btn-primary mt-2 text-sm py-1.5 px-4"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  {s.bus?.amenities?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {s.bus.amenities.map((a) => (
                        <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="font-bold text-gray-700 mb-3">
                  {selectedSchedule ? 'Route Map' : 'Select a bus to view route'}
                </h3>
                <MapView
                  source={selectedSchedule?.route?.source}
                  destination={selectedSchedule?.route?.destination}
                  stops={selectedSchedule?.route?.stops || []}
                  currentLocation={selectedSchedule?.currentLocation}
                  height="450px"
                />
                {selectedSchedule?.currentLocation?.locationName && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm">
                    <span className="font-semibold text-blue-700">Live Location:</span>{' '}
                    <span className="text-gray-700">{selectedSchedule.currentLocation.locationName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
