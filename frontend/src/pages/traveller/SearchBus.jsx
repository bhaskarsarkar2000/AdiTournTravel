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
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [sourceDropdown, setSourceDropdown] = useState(false);
  const [destDropdown, setDestDropdown] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');

  // Fetch all schedules on mount
  useEffect(() => {
    fetchAllSchedules();
    fetchCities();
  }, []);

  // Filter schedules when form changes
  useEffect(() => {
    filterSchedules();
  }, [form, schedules]);

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

  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/schedules`);
      setSchedules(data.schedules || []);
    } catch (error) {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const filterSchedules = () => {
    let filtered = schedules;

    // Check if from and to are the same
    if (form.source && form.destination && form.source.toLowerCase() === form.destination.toLowerCase()) {
      setFilteredSchedules([]);
      return;
    }

    // Filter by source
    if (form.source) {
      filtered = filtered.filter((s) =>
        s.route?.source?.name?.toLowerCase().includes(form.source.toLowerCase())
      );
    }

    // Filter by destination
    if (form.destination) {
      filtered = filtered.filter((s) =>
        s.route?.destination?.name?.toLowerCase().includes(form.destination.toLowerCase())
      );
    }

    // Filter by date
    if (form.date) {
      filtered = filtered.filter((s) => {
        if (s.isDaily) return true; // Daily buses always match
        return s.journeyDate === form.date;
      });
    }

    setFilteredSchedules(filtered);
    setSelectedSchedule(null);
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

  const busTypeColor = {
    AC: 'bg-blue-100 text-blue-700',
    'Non-AC': 'bg-gray-100 text-gray-700',
    Sleeper: 'bg-purple-100 text-purple-700',
    'Semi-Sleeper': 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-8 px-4">
        <form onSubmit={(e) => e.preventDefault()} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Source City Dropdown */}
          <div className="relative">
            <div
              className="input-field bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setSourceDropdown(!sourceDropdown)}
            >
              <input
                type="text"
                placeholder="From (City)"
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
          <div className="relative">
            <div
              className="input-field bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setDestDropdown(!destDropdown)}
            >
              <input
                type="text"
                placeholder="To (City)"
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
          <input
            type="date"
            value={form.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field"
          />

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={() => setForm({ source: '', destination: '', date: new Date().toISOString().split('T')[0] })}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading buses...</p>
          </div>        ) : form.source && form.destination && form.source.toLowerCase() === form.destination.toLowerCase() ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Invalid Search</h2>
            <p className="text-gray-500 mb-6">From and To cities cannot be the same. Please select different cities.</p>
            <button
              onClick={() => setForm({ source: '', destination: '', date: new Date().toISOString().split('T')[0] })}
              className="btn-primary inline-block"
            >
              Clear Filters
            </button>
          </div>        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No buses found</h2>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">
                📋 {filteredSchedules.length} buses available
                {form.source && (
                  <>
                    {' '}from <span className="text-blue-600">{form.source}</span>
                  </>
                )}
                {form.destination && (
                  <>
                    {' '}to <span className="text-blue-600">{form.destination}</span>
                  </>
                )}
              </h2>

              {filteredSchedules.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelectedSchedule(s)}
                  className={`card cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 ${
                    selectedSchedule?._id === s._id ? 'border-blue-500 border-2' : ''
                  }`}
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{s.bus?.busName || 'Bus'}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            busTypeColor[s.bus?.type] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {s.bus?.type}
                        </span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/book/${s._id}`);
                        }}
                        className="btn-primary mt-2 text-sm py-1.5 px-4"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  {s.bus?.amenities?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {s.bus.amenities.map((a) => (
                        <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="font-bold text-gray-700 mb-3">
                  {selectedSchedule ? '🗺️ Route Map' : 'Select a bus to view route'}
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
                    <span className="font-semibold text-blue-700">📍 Live Location:</span>{' '}
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
