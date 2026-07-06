import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import MapView from '../../components/MapView';
import InteractiveMapView from '../../components/InteractiveMapView';

const API = import.meta.env.VITE_API_URL || '/api';

const defaultRoute = {
  routeName: '',
  sourceId: '',
  destinationId: '',
  startingStoppages: [],
  endingStoppages: [],
  distance: '',
  estimatedDuration: '',
};

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [cities, setCities] = useState([]);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showCityForm, setShowCityForm] = useState(false);
  const [form, setForm] = useState(defaultRoute);
  const [cityForm, setCityForm] = useState({ name: '', coordinates: { lat: '', lng: '' }, description: '' });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive map states
  const [showCityMap, setShowCityMap] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [showStoppageMap, setShowStoppageMap] = useState(null); // null or { type: 'starting'|'ending', index: number }

  useEffect(() => {
    fetchCities();
    fetchRoutes();
  }, []);

  const fetchCities = async () => {
    try {
      const { data } = await axios.get(`${API}/cities`);
      setCities(data.cities || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const { data } = await axios.get(`${API}/routes`);
      setRoutes(data.routes || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      if (!cityForm.name || !cityForm.coordinates.lat || !cityForm.coordinates.lng) {
        return toast.error('City name and coordinates are required');
      }

      const payload = {
        name: cityForm.name,
        coordinates: {
          lat: Number(cityForm.coordinates.lat),
          lng: Number(cityForm.coordinates.lng),
        },
        description: cityForm.description,
      };

      const { data } = await axios.post(`${API}/cities`, payload);
      setCities([data.city, ...cities]);
      setCityForm({ name: '', coordinates: { lat: '', lng: '' }, description: '' });
      setShowCityForm(false);
      toast.success('City added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add city');
    }
  };

  const handleDeleteCity = async (id) => {
    if (!confirm('Delete this city?')) return;
    try {
      await axios.delete(`${API}/cities/${id}`);
      setCities(cities.filter((c) => c._id !== id));
      toast.success('City deleted');
    } catch (err) {
      toast.error('Failed to delete city');
    }
  };

  const handleSubmitRoute = async (e) => {
    e.preventDefault();
    try {
      const sourceCity = cities.find((c) => c._id === form.sourceId);
      const destCity = cities.find((c) => c._id === form.destinationId);

      if (!sourceCity || !destCity) {
        return toast.error('Please select source and destination');
      }

      const payload = {
        routeName: form.routeName,
        source: {
          cityId: sourceCity._id,
          name: sourceCity.name,
          coordinates: sourceCity.coordinates,
        },
        destination: {
          cityId: destCity._id,
          name: destCity.name,
          coordinates: destCity.coordinates,
        },
        startingStoppages: form.startingStoppages.map(s => ({
          name: s.name,
          coordinates: { lat: Number(s.coordinates.lat) || null, lng: Number(s.coordinates.lng) || null },
          departureTime: s.departureTime || null,
        })).filter(s => s.name),
        endingStoppages: form.endingStoppages.map(s => ({
          name: s.name,
          coordinates: { lat: Number(s.coordinates.lat) || null, lng: Number(s.coordinates.lng) || null },
          arrivalTime: s.arrivalTime || null,
        })).filter(s => s.name),
        distance: Number(form.distance),
        estimatedDuration: form.estimatedDuration,
      };

      const { data } = await axios.post(`${API}/routes`, payload);
      setRoutes([data.route, ...routes]);
      setShowRouteForm(false);
      setForm(defaultRoute);
      toast.success('Route added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add route');
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm('Deactivate this route?')) return;
    try {
      await axios.delete(`${API}/routes/${id}`);
      setRoutes(routes.filter((r) => r._id !== id));
      toast.success('Route deactivated');
    } catch (err) {
      toast.error('Failed to delete route');
    }
  };

  const handleCityMapSelect = (location) => {
    setCityForm({
      ...cityForm,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
    });
    setShowCityMap(false);
    toast.success('Coordinates set from map!');
  };

  const handleStoppageMapSelect = (location) => {
    if (showStoppageMap.type === 'starting') {
      updateStartingStoppage(showStoppageMap.index, 'coordinates', {
        lat: location.lat,
        lng: location.lng,
      });
    } else {
      updateEndingStoppage(showStoppageMap.index, 'coordinates', {
        lat: location.lat,
        lng: location.lng,
      });
    }
    setShowStoppageMap(null);
    toast.success('Coordinates set from map!');
  };

  const addStartingStoppage = () => {
    setForm((f) => ({
      ...f,
      startingStoppages: [...f.startingStoppages, { name: '', coordinates: { lat: '', lng: '' }, departureTime: '' }],
    }));
  };

  const removeStartingStoppage = (idx) => {
    setForm((f) => ({
      ...f,
      startingStoppages: f.startingStoppages.filter((_, i) => i !== idx),
    }));
  };

  const updateStartingStoppage = (idx, field, value) => {
    setForm((f) => {
      const updated = [...f.startingStoppages];
      if (field === 'coordinates') {
        updated[idx].coordinates = { ...updated[idx].coordinates, ...value };
      } else {
        updated[idx][field] = value;
      }
      return { ...f, startingStoppages: updated };
    });
  };

  const addEndingStoppage = () => {
    setForm((f) => ({
      ...f,
      endingStoppages: [...f.endingStoppages, { name: '', coordinates: { lat: '', lng: '' }, arrivalTime: '' }],
    }));
  };

  const removeEndingStoppage = (idx) => {
    setForm((f) => ({
      ...f,
      endingStoppages: f.endingStoppages.filter((_, i) => i !== idx),
    }));
  };

  const updateEndingStoppage = (idx, field, value) => {
    setForm((f) => {
      const updated = [...f.endingStoppages];
      if (field === 'coordinates') {
        updated[idx].coordinates = { ...updated[idx].coordinates, ...value };
      } else {
        updated[idx][field] = value;
      }
      return { ...f, endingStoppages: updated };
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-b from-white via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* City Management Section */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold text-gradient-animated">🏙️ City Management</h2>
                <p className="text-gray-600 mt-2">Manage your network of cities and locations</p>
              </div>
              <button onClick={() => setShowCityForm(!showCityForm)} className="btn-primary shadow-lg hover:shadow-xl">{showCityForm ? 'Cancel' : '+ Add City'}</button>
            </div>

            {showCityForm && (
              <div className="glass-card mb-8 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-2 border-gradient-to-r from-blue-200 to-indigo-200">
                <h3 className="font-bold text-xl mb-6 text-indigo-900">Add New City</h3>
              
              {!showCityMap ? (
                <form onSubmit={handleAddCity} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">📍 City Name</label>
                    <input type="text" placeholder="e.g. Mumbai" value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} className="input-field" required />
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 font-medium block mb-1">Latitude</label>
                    <div className="flex gap-2">
                      <input type="number" step="any" placeholder="e.g. 19.076" value={cityForm.coordinates.lat} onChange={(e) => setCityForm({ ...cityForm, coordinates: { ...cityForm.coordinates, lat: e.target.value } })} className="input-field flex-1" />
                      <button type="button" onClick={() => setShowCityMap(true)} title="Select from map" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors">🗺️</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 font-medium block mb-1">Longitude</label>
                    <input type="number" step="any" placeholder="e.g. 72.877" value={cityForm.coordinates.lng} onChange={(e) => setCityForm({ ...cityForm, coordinates: { ...cityForm.coordinates, lng: e.target.value } })} className="input-field" disabled />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 font-medium block mb-1">Description (Optional)</label>
                    <input type="text" placeholder="e.g. Financial capital of India" value={cityForm.description} onChange={(e) => setCityForm({ ...cityForm, description: e.target.value })} className="input-field" />
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <button type="submit" className="btn-primary">Add City</button>
                    <button type="button" onClick={() => setShowCityForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="mb-4 relative" style={{ height: '400px' }}>
                    <InteractiveMapView 
                      selectedLocation={cityForm.coordinates.lat ? { lat: Number(cityForm.coordinates.lat), lng: Number(cityForm.coordinates.lng) } : null}
                      onLocationSelect={handleCityMapSelect}
                      height="400px"
                    />
                  </div>
                  <button type="button" onClick={() => setShowCityMap(false)} className="btn-secondary w-full">Close Map</button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <div key={city._id} className="featured-card bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-gradient-to-r from-blue-200 to-indigo-200 hover:from-blue-300 hover:to-indigo-300">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl text-gray-900">{city.name}</h3>
                  <span className="text-xl">📍</span>
                </div>
                <p className="text-sm font-semibold text-indigo-600 mb-2">Coordinates</p>
                <p className="text-xs text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded mb-3">{city.coordinates.lat.toFixed(4)}°, {city.coordinates.lng.toFixed(4)}°</p>
                {city.description && <p className="text-sm text-gray-600 mb-4 italic">{city.description}</p>}
                <button onClick={() => handleDeleteCity(city._id)} className="btn-danger text-xs mt-auto w-full font-bold">🗑️ Delete City</button>
              </div>
            ))}
          </div>
        </div>
        </div>

        <div className="my-12 h-1 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 rounded-full"></div>

        {/* Route Management Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gradient-animated">🛣️ Route Management</h2>
              <p className="text-gray-600 mt-2">Create and manage your bus routes with multiple stoppages</p>
            </div>
            <button onClick={() => setShowRouteForm(!showRouteForm)} className="btn-primary shadow-lg hover:shadow-xl">{showRouteForm ? 'Cancel' : '+ Add Route'}</button>
          </div>

          {showRouteForm && (
            <div className="glass-card mb-8 bg-gradient-to-br from-white/80 to-blue-50/80 border-2 border-gradient-to-r from-blue-200 to-indigo-200">
              <h3 className="font-bold text-2xl mb-6 text-indigo-900">✨ Create New Route</h3>
              <form onSubmit={handleSubmitRoute} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">✍️ Route Name</label>
                  <input type="text" placeholder="e.g. Mumbai - Pune Express" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} className="input-field font-medium" required />
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 hover:border-green-300 transition-all">
                  <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">📍 Source (Departure)</h3>
                  <select value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: e.target.value })} className="input-field mb-3 font-medium" required>
                    <option value="">Select a city</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {form.sourceId && cities.find((c) => c._id === form.sourceId) && (
                    <p className="text-xs text-green-700 font-mono bg-white/50 px-3 py-2 rounded font-bold">{cities.find((c) => c._id === form.sourceId).coordinates.lat.toFixed(4)}°, {cities.find((c) => c._id === form.sourceId).coordinates.lng.toFixed(4)}°</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200 hover:border-red-300 transition-all">
                  <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">🏁 Destination (Arrival)</h3>
                  <select value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: e.target.value })} className="input-field mb-3 font-medium" required>
                    <option value="">Select a city</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {form.destinationId && cities.find((c) => c._id === form.destinationId) && (
                    <p className="text-xs text-red-700 font-mono bg-white/50 px-3 py-2 rounded font-bold">{cities.find((c) => c._id === form.destinationId).coordinates.lat.toFixed(4)}°, {cities.find((c) => c._id === form.destinationId).coordinates.lng.toFixed(4)}°</p>
                  )}
                </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-yellow-700">🚏 Starting Stoppages (Optional)</h3>
                    <button type="button" onClick={addStartingStoppage} className="bg-yellow-200 hover:bg-yellow-300 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors">+ Add</button>
                  </div>

                  {form.startingStoppages.length === 0 && <p className="text-xs text-gray-400 mb-2">No starting stoppages added yet</p>}

                  <div className="space-y-3">
                    {form.startingStoppages.map((stoppage, idx) => (
                      showStoppageMap?.type === 'starting' && showStoppageMap?.index === idx ? (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-yellow-700">Starting Stop #{idx + 1}</span>
                            <button type="button" onClick={() => setShowStoppageMap(null)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                          </div>
                          <div className="mb-3 relative" style={{ height: '300px' }}>
                            <InteractiveMapView 
                              selectedLocation={stoppage.coordinates.lat ? { lat: Number(stoppage.coordinates.lat), lng: Number(stoppage.coordinates.lng) } : null}
                              onLocationSelect={handleStoppageMapSelect}
                              height="300px"
                            />
                          </div>
                          <button type="button" onClick={() => setShowStoppageMap(null)} className="btn-secondary w-full text-sm">Close Map</button>
                        </div>
                      ) : (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-yellow-700">Starting Stop #{idx + 1}</span>
                            <button type="button" onClick={() => removeStartingStoppage(idx)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                          </div>
                          <input type="text" placeholder="Stoppage Name" value={stoppage.name} onChange={(e) => updateStartingStoppage(idx, 'name', e.target.value)} className="input-field mb-2 text-sm" />
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex gap-1">
                              <input type="number" step="any" placeholder="Latitude" value={stoppage.coordinates.lat} onChange={(e) => updateStartingStoppage(idx, 'coordinates', { lat: e.target.value })} className="input-field text-sm flex-1" />
                              <button type="button" onClick={() => setShowStoppageMap({ type: 'starting', index: idx })} title="Select from map" className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition-colors">🗺️</button>
                            </div>
                            <input type="number" step="any" placeholder="Longitude" value={stoppage.coordinates.lng} onChange={(e) => updateStartingStoppage(idx, 'coordinates', { lng: e.target.value })} className="input-field text-sm" disabled />
                          </div>
                          <input type="time" value={stoppage.departureTime} onChange={(e) => updateStartingStoppage(idx, 'departureTime', e.target.value)} className="input-field text-sm" />
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-purple-700">🚏 Ending Stoppages (Optional)</h3>
                    <button type="button" onClick={addEndingStoppage} className="bg-purple-200 hover:bg-purple-300 text-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors">+ Add</button>
                  </div>

                  {form.endingStoppages.length === 0 && <p className="text-xs text-gray-400 mb-2">No ending stoppages added yet</p>}

                  <div className="space-y-3">
                    {form.endingStoppages.map((stoppage, idx) => (
                      showStoppageMap?.type === 'ending' && showStoppageMap?.index === idx ? (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-purple-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-purple-700">Ending Stop #{idx + 1}</span>
                            <button type="button" onClick={() => setShowStoppageMap(null)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                          </div>
                          <div className="mb-3 relative" style={{ height: '300px' }}>
                            <InteractiveMapView 
                              selectedLocation={stoppage.coordinates.lat ? { lat: Number(stoppage.coordinates.lat), lng: Number(stoppage.coordinates.lng) } : null}
                              onLocationSelect={handleStoppageMapSelect}
                              height="300px"
                            />
                          </div>
                          <button type="button" onClick={() => setShowStoppageMap(null)} className="btn-secondary w-full text-sm">Close Map</button>
                        </div>
                      ) : (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-purple-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-purple-700">Ending Stop #{idx + 1}</span>
                            <button type="button" onClick={() => removeEndingStoppage(idx)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                          </div>
                          <input type="text" placeholder="Stoppage Name" value={stoppage.name} onChange={(e) => updateEndingStoppage(idx, 'name', e.target.value)} className="input-field mb-2 text-sm" />
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex gap-1">
                              <input type="number" step="any" placeholder="Latitude" value={stoppage.coordinates.lat} onChange={(e) => updateEndingStoppage(idx, 'coordinates', { lat: e.target.value })} className="input-field text-sm flex-1" />
                              <button type="button" onClick={() => setShowStoppageMap({ type: 'ending', index: idx })} title="Select from map" className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors">🗺️</button>
                            </div>
                            <input type="number" step="any" placeholder="Longitude" value={stoppage.coordinates.lng} onChange={(e) => updateEndingStoppage(idx, 'coordinates', { lng: e.target.value })} className="input-field text-sm" disabled />
                          </div>
                          <input type="time" value={stoppage.arrivalTime} onChange={(e) => updateEndingStoppage(idx, 'arrivalTime', e.target.value)} className="input-field text-sm" />
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">📏 Distance (km)</label>
                  <input type="number" placeholder="e.g. 148" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="input-field font-medium" />
                </div>

                <div>
                  <label className="text-sm text-indigo-700 font-bold uppercase tracking-widest block mb-2">⏱️ Estimated Duration</label>
                  <input type="text" placeholder="e.g. 3h 30m" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} className="input-field font-medium" />
                </div>

                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1 text-lg font-bold shadow-lg hover:shadow-xl">🚀 Add Route</button>
                  <button type="button" onClick={() => setShowRouteForm(false)} className="btn-secondary flex-1 text-lg font-bold">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6">📋 Routes List</h3>
              {loading && <div className="text-center py-16"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div><p className="text-gray-600 mt-4">Loading routes...</p></div>}
              {!loading && routes.length === 0 && <div className="featured-card bg-gradient-to-br from-gray-50 to-blue-50 text-center text-gray-600 py-16 border-2 border-dashed border-gray-300">No routes created yet. Add one to get started! 🚀</div>}
              {routes.map((r) => (
                <div key={r._id} onClick={() => setSelectedRoute(r)} className={`featured-card cursor-pointer transition-all ${selectedRoute?._id === r._id ? 'border-indigo-500 border-2 shadow-xl ring-2 ring-indigo-300' : 'border-2 border-gray-200 hover:border-indigo-300'} bg-gradient-to-br from-white via-blue-50 to-indigo-50 group`}>
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-700 transition-colors">{r.routeName}</h3>
                      <p className="text-sm font-semibold text-indigo-600 mt-2">{r.source?.name} ➜ {r.destination?.name}</p>
                      {r.distance && <p className="text-xs text-gray-600 mt-2 font-medium">📏 {r.distance} km  •  ⏱️ {r.estimatedDuration}</p>}
                      
                      {/* Starting Stoppages */}
                      {r.startingStoppages && r.startingStoppages.length > 0 && (
                        <div className="mt-3 bg-yellow-50 rounded-lg p-2">
                          <p className="text-xs font-bold text-yellow-700 mb-1">🚏 Boarding Points:</p>
                          {r.startingStoppages.map((s, idx) => (
                            <p key={idx} className="text-xs text-yellow-700 ml-1 font-medium">• {s.name} {s.departureTime && `⏰ ${s.departureTime}`}</p>
                          ))}
                        </div>
                      )}
                      
                      {/* Ending Stoppages */}
                      {r.endingStoppages && r.endingStoppages.length > 0 && (
                        <div className="mt-2 bg-purple-50 rounded-lg p-2">
                          <p className="text-xs font-bold text-purple-700 mb-1">🚏 Drop-off Points:</p>
                          {r.endingStoppages.map((s, idx) => (
                            <p key={idx} className="text-xs text-purple-700 ml-1 font-medium">• {s.name} {s.arrivalTime && `⏰ ${s.arrivalTime}`}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRoute(r._id); }} className="btn-danger text-sm px-4 py-2 h-auto font-bold self-start">🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky top-24">
              <div className="glass-card bg-gradient-to-br from-white/80 to-blue-50/80 border-2 border-indigo-200 rounded-2xl overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                  <h3 className="font-bold text-lg">🗺️ Route Map Preview</h3>
                  <p className="text-sm text-indigo-100 mt-1">{selectedRoute ? selectedRoute.routeName : 'Select a route to see the map'}</p>
                </div>
                <div className="p-4">
                  <MapView source={selectedRoute?.source} destination={selectedRoute?.destination} stops={selectedRoute?.stops || []} height="400px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
