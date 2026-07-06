import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = import.meta.env.VITE_API_URL || '/api';

export default function Home() {
  const [form, setForm] = useState({ source: '', destination: '', date: '' });
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [activeRoutesWithSchedules, setActiveRoutesWithSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [sourceDropdown, setSourceDropdown] = useState(false);
  const [destDropdown, setDestDropdown] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCities();
    fetchPopularRoutes();
    fetchAllSchedules();
  }, []);

  const fetchCities = async () => {
    try {
      const { data } = await axios.get(`${API}/routes`);
      const allCities = new Set();
      data.routes?.forEach((route) => {
        if (route.source?.name) allCities.add(route.source.name);
        if (route.destination?.name) allCities.add(route.destination.name);
      });
      setCities(Array.from(allCities).sort());
    } catch (error) {
      console.error('Failed to fetch cities', error);
    }
  };

  const fetchPopularRoutes = async () => {
    try {
      const { data } = await axios.get(`${API}/routes/popular`);
      setPopularRoutes(data.routes || []);
    } catch (error) {
      console.error('Failed to fetch popular routes:', error);
      // Fallback routes if API fails
      setPopularRoutes([
        { from: 'Mumbai', to: 'Pune', distance: 150, duration: '3h 30m' },
        { from: 'Delhi', to: 'Jaipur', distance: 250, duration: '5h' },
        { from: 'Bangalore', to: 'Mysore', distance: 140, duration: '3h' },
        { from: 'Chennai', to: 'Pondicherry', distance: 160, duration: '3h' },
        { from: 'Hyderabad', to: 'Vijayawada', distance: 280, duration: '5h 30m' },
        { from: 'Kolkata', to: 'Siliguri', distance: 560, duration: '9h' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchedules = async () => {
    try {
      const { data } = await axios.get(`${API}/schedules`);
      const schedules = data.schedules || [];
      setAllSchedules(schedules);
      
      // Group schedules by route
      const routeMap = {};
      schedules.forEach((schedule) => {
        const routeId = schedule.route?._id;
        if (routeId) {
          if (!routeMap[routeId]) {
            routeMap[routeId] = {
              route: schedule.route,
              schedules: []
            };
          }
          routeMap[routeId].schedules.push(schedule);
        }
      });
      
      // Convert to array and sort by schedules count (descending)
      const routesWithSchedules = Object.values(routeMap).sort(
        (a, b) => b.schedules.length - a.schedules.length
      );
      setActiveRoutesWithSchedules(routesWithSchedules);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      setAllSchedules([]);
      setActiveRoutesWithSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleSourceSelect = (city) => {
    setForm({ ...form, source: city });
    setSourceDropdown(false);
    setSourceFilter('');
  };

  const handleDestSelect = (city) => {
    setForm({ ...form, destination: city });
    setDestDropdown(false);
    setDestFilter('');
  };

  const getFilteredCities = (filter, currentValue) => {
    return cities.filter(
      (city) =>
        city.toLowerCase().includes(filter.toLowerCase()) &&
        city !== currentValue
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.source || !form.destination || !form.date) {
      return toast.error('Please fill all fields');
    }
    if (form.source.toLowerCase() === form.destination.toLowerCase()) {
      return toast.error('From and To cities cannot be the same! Please select different cities.');
    }
    navigate(`/search?source=${form.source}&destination=${form.destination}&date=${form.date}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-400 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center w-full">
          <div className="text-7xl mb-6 animate-float drop-shadow-lg">🚌</div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gradient-animated drop-shadow-xl">
            Travel India<br /><span className="text-transparent bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text">Smarter & Cheaper</span>
          </h1>
          <p className="text-indigo-100 text-lg md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-lg font-light">
            🎫 Book bus tickets across India | 💺 Choose your seat | 📍 Track your bus live | 🔒 Pay securely
          </p>

          {/* Search Box with Dropdowns */}
          <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-5xl mx-auto border border-white/30 hover:shadow-3xl transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Source City Dropdown */}
              <div className="text-left relative">
                <label className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-2">📍 From</label>
                <div
                  className="input-field bg-white cursor-pointer flex items-center justify-between"
                  onClick={() => setSourceDropdown(!sourceDropdown)}
                >
                  <input
                    type="text"
                    placeholder="Departure City"
                    value={sourceFilter || form.source}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    onFocus={() => setSourceDropdown(true)}
                    className="w-full bg-transparent outline-none"
                  />
                  <span className="text-gray-400">▼</span>
                </div>
                {sourceDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {getFilteredCities(sourceFilter, form.source).length > 0 ? (
                      getFilteredCities(sourceFilter, form.source).map((city) => (
                        <div
                          key={city}
                          onClick={() => handleSourceSelect(city)}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-700 font-medium"
                        >
                          {city}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">No cities found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Destination City Dropdown */}
              <div className="text-left relative">
                <label className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-2">🏁 To</label>
                <div
                  className="input-field bg-white cursor-pointer flex items-center justify-between"
                  onClick={() => setDestDropdown(!destDropdown)}
                >
                  <input
                    type="text"
                    placeholder="Arrival City"
                    value={destFilter || form.destination}
                    onChange={(e) => setDestFilter(e.target.value)}
                    onFocus={() => setDestDropdown(true)}
                    className="w-full bg-transparent outline-none"
                  />
                  <span className="text-gray-400">▼</span>
                </div>
                {destDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {getFilteredCities(destFilter, form.destination).length > 0 ? (
                      getFilteredCities(destFilter, form.destination).map((city) => (
                        <div
                          key={city}
                          onClick={() => handleDestSelect(city)}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-700 font-medium"
                        >
                          {city}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">No cities found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Date Input */}
              <div className="text-left">
                <label className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-2">📅 Date</label>
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-field font-medium"
                  required
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full text-base font-bold shadow-xl hover:shadow-2xl">
                  🔍 Search Buses
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* All Available Schedules */}
      <section className="py-20 px-4 bg-gradient-to-b from-indigo-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gradient-animated">✨ Available Buses Today</h2>
            <p className="text-gray-600 text-lg font-medium">Book your next journey with real-time seat availability</p>
          </div>
          
          {schedulesLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
              <p className="text-gray-600 mt-6 text-lg font-medium">Loading available buses...</p>
            </div>
          ) : allSchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSchedules.map((schedule) => (
                <div key={schedule._id} className="featured-card bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative z-0">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{schedule.bus?.busName}</h3>
                      <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-green-900 text-xs px-3 py-1 rounded-full font-bold shadow-md">
                        ✅ {schedule.availableSeats} seats
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 font-semibold">{schedule.bus?.busNumber} • {schedule.bus?.type}</p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4 mb-4 border border-indigo-100">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-center flex-1">
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">From</p>
                        <p className="text-lg font-bold text-gray-900">{schedule.route?.source?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600 mt-1 font-semibold">{schedule.departureTime}</p>
                      </div>
                      <div className="text-2xl text-indigo-400">→</div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">To</p>
                        <p className="text-lg font-bold text-gray-900">{schedule.route?.destination?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600 mt-1 font-semibold">{schedule.arrivalTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t-2 border-indigo-200 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Duration</p>
                      <p className="text-sm font-bold text-gray-900">⏱️ {schedule.route?.estimatedDuration || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold">Price per seat</p>
                      <p className="text-2xl font-bold text-gradient-animated">₹{schedule.fare}</p>
                    </div>
                  </div>

                  {schedule.isDaily && (
                    <div className="mb-3 text-xs text-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                      📅 Runs Daily
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/book/${schedule._id}`);
                    }}
                    className="btn-primary w-full text-sm font-bold shadow-lg hover:shadow-xl transition-all mt-auto relative z-10 cursor-pointer"
                  >
                    🎫 Book Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/60 rounded-2xl border-2 border-dashed border-indigo-300">
              <div className="text-6xl mb-4">🚍</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No buses available today</h3>
              <p className="text-gray-500 mb-6">Check back later or search for a specific route</p>
              <button
                onClick={() => navigate('/search')}
                className="btn-primary inline-block"
              >
                🔍 Search for Buses
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose AdiTourn?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🗺️', title: 'Live Bus Tracking', desc: 'Know exactly where your bus is on the map, with departure and arrival times in real-time.' },
              { icon: '💺', title: 'Choose Your Seat', desc: 'Visual seat selector — pick window, aisle, front or back. Your comfort, your choice.' },
              { icon: '💳', title: 'Secure Payments', desc: 'Pay via UPI, Cards, or Wallets through Razorpay — trusted by millions across India.' },
              { icon: '🔒', title: 'Safe & Verified', desc: 'All drivers and buses are verified by admin. Travel with peace of mind.' },
              { icon: '📱', title: 'Easy to Use', desc: 'Designed for everyone — even non-technical users can book a ticket in under 2 minutes.' },
              { icon: '💰', title: 'Lowest Fares', desc: 'We pass on savings to you. No hidden charges. Price you see is price you pay.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to travel?</h2>
        <p className="text-blue-200 mb-8 text-lg">Join thousands of travellers booking smarter every day.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/register" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-3 rounded-xl text-lg transition-colors">
            Register Free
          </a>
          <a href="/search" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-3 rounded-xl text-lg transition-colors">
            Search Buses
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
