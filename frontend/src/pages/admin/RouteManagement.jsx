import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import MapView from '../../components/MapView';

const API = import.meta.env.VITE_API_URL || '/api';

const defaultRoute = {
  routeName: '',
  source: { name: '', coordinates: { lat: '', lng: '' } },
  destination: { name: '', coordinates: { lat: '', lng: '' } },
  distance: '',
  estimatedDuration: '',
};

const indianCities = {
  'Mumbai': { lat: 19.076, lng: 72.877 },
  'Pune': { lat: 18.52, lng: 73.856 },
  'Delhi': { lat: 28.704, lng: 77.102 },
  'Jaipur': { lat: 26.912, lng: 75.787 },
  'Bangalore': { lat: 12.971, lng: 77.594 },
  'Mysore': { lat: 12.295, lng: 76.639 },
  'Chennai': { lat: 13.082, lng: 80.27 },
  'Hyderabad': { lat: 17.385, lng: 78.486 },
  'Kolkata': { lat: 22.572, lng: 88.363 },
  'Ahmedabad': { lat: 23.022, lng: 72.571 },
};

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultRoute);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/routes`).then(({ data }) => setRoutes(data.routes || [])).finally(() => setLoading(false));
  }, []);

  const autofillCity = (field, cityName) => {
    const coords = indianCities[cityName];
    if (coords) {
      setForm((f) => ({ ...f, [field]: { name: cityName, coordinates: coords } }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        source: { ...form.source, coordinates: { lat: Number(form.source.coordinates.lat), lng: Number(form.source.coordinates.lng) } },
        destination: { ...form.destination, coordinates: { lat: Number(form.destination.coordinates.lat), lng: Number(form.destination.coordinates.lng) } },
        distance: Number(form.distance),
      };
      const { data } = await axios.post(`${API}/routes`, payload);
      setRoutes([data.route, ...routes]);
      setShowForm(false);
      setForm(defaultRoute);
      toast.success('Route added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add route');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this route?')) return;
    await axios.delete(`${API}/routes/${id}`);
    setRoutes(routes.filter((r) => r._id !== id));
    toast.success('Route deactivated');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Add Route'}</button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-lg mb-4">Add New Route</h2>
            <div className="mb-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              Quick fill: Click a city to auto-fill coordinates —{' '}
              {Object.keys(indianCities).map((c) => (
                <button key={c} type="button" onClick={() => autofillCity('source', c)} className="text-blue-600 hover:underline mr-2">{c}(S)</button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500 font-medium block mb-1">Route Name</label>
                <input type="text" placeholder="e.g. Mumbai - Pune Express" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} className="input-field" required />
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-green-700 mb-3">Source (Departure)</h3>
                <input type="text" placeholder="City Name" value={form.source.name} onChange={(e) => setForm({ ...form, source: { ...form.source, name: e.target.value } })} className="input-field mb-2" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="any" placeholder="Latitude" value={form.source.coordinates.lat} onChange={(e) => setForm({ ...form, source: { ...form.source, coordinates: { ...form.source.coordinates, lat: e.target.value } } })} className="input-field" />
                  <input type="number" step="any" placeholder="Longitude" value={form.source.coordinates.lng} onChange={(e) => setForm({ ...form, source: { ...form.source, coordinates: { ...form.source.coordinates, lng: e.target.value } } })} className="input-field" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Find coordinates at openstreetmap.org</p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <h3 className="font-semibold text-red-700 mb-3">Destination (Arrival)</h3>
                <input type="text" placeholder="City Name" value={form.destination.name} onChange={(e) => setForm({ ...form, destination: { ...form.destination, name: e.target.value } })} className="input-field mb-2" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="any" placeholder="Latitude" value={form.destination.coordinates.lat} onChange={(e) => setForm({ ...form, destination: { ...form.destination, coordinates: { ...form.destination.coordinates, lat: e.target.value } } })} className="input-field" />
                  <input type="number" step="any" placeholder="Longitude" value={form.destination.coordinates.lng} onChange={(e) => setForm({ ...form, destination: { ...form.destination, coordinates: { ...form.destination.coordinates, lng: e.target.value } } })} className="input-field" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Distance (km)</label>
                <input type="number" placeholder="e.g. 148" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Estimated Duration</label>
                <input type="text" placeholder="e.g. 3h 30m" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} className="input-field" />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="btn-primary">Add Route</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {loading && <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></div>}
            {!loading && routes.length === 0 && <div className="card text-center text-gray-400 py-10">No routes yet</div>}
            {routes.map((r) => (
              <div key={r._id} onClick={() => setSelectedRoute(r)} className={`card cursor-pointer hover:shadow-md transition-all ${selectedRoute?._id === r._id ? 'border-blue-500 border-2' : ''}`}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{r.routeName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{r.source?.name} → {r.destination?.name}</p>
                    {r.distance && <p className="text-xs text-gray-400">{r.distance} km • {r.estimatedDuration}</p>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="btn-danger text-xs h-8 px-3">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="sticky top-24">
            <h3 className="font-bold text-gray-700 mb-3">{selectedRoute ? selectedRoute.routeName : 'Select a route to preview on map'}</h3>
            <MapView source={selectedRoute?.source} destination={selectedRoute?.destination} stops={selectedRoute?.stops || []} height="400px" />
          </div>
        </div>
      </div>
    </div>
  );
}
