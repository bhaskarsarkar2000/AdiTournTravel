import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MapView from '../../components/MapView';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '/api';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [locationForm, setLocationForm] = useState({ lat: '', lng: '', locationName: '' });
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    axios.get(`${API}/schedules/driver/my-schedules`)
      .then(({ data }) => setSchedules(data.schedules || []))
      .catch(() => toast.error('Failed to load schedules'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setUpdatingLocation(true);
    try {
      await axios.put(`${API}/schedules/${selectedSchedule._id}/location`, {
        lat: Number(locationForm.lat),
        lng: Number(locationForm.lng),
        locationName: locationForm.locationName,
      });
      toast.success('Location updated!');
    } catch {
      toast.error('Failed to update location');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
        toast.success('Location fetched!');
      },
      () => toast.error('Could not get location')
    );
  };

  const statusColor = { scheduled: 'bg-blue-100 text-blue-700', departed: 'bg-yellow-100 text-yellow-700', arrived: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-green-700 to-teal-800 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Driver Dashboard 🚌</h1>
          <p className="text-green-200">Welcome, {user?.name}! Manage your trips here.</p>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="font-bold text-xl text-gray-800 mb-4">My Assigned Trips</h2>
            {loading && <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" /></div>}
            {!loading && schedules.length === 0 && (
              <div className="card text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📋</div>
                <p className="font-medium">No trips assigned yet</p>
                <p className="text-sm mt-1">Contact your admin to get assigned to routes</p>
              </div>
            )}
            <div className="space-y-4">
              {schedules.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelectedSchedule(s)}
                  className={`card cursor-pointer hover:shadow-md transition-all ${selectedSchedule?._id === s._id ? 'border-green-500 border-2' : ''}`}
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {s.route?.source?.name || '—'} → {s.route?.destination?.name || '—'}
                      </h3>
                      <p className="text-sm text-gray-500">{s.bus?.busName} • {s.bus?.busNumber}</p>
                      <p className="text-sm text-gray-500">
                        {s.journeyDate ? new Date(s.journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}
                        {' '} | {s.departureTime} → {s.arrivalTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusColor[s.status]}`}>{s.status}</span>
                      <p className="text-xs text-gray-400 mt-2">
                        {s.availableSeats} seats left / {s.bus?.totalSeats} total
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-700 mb-3">Update My Location</h3>
              {!selectedSchedule ? (
                <p className="text-gray-400 text-sm">Select a trip first</p>
              ) : (
                <form onSubmit={handleUpdateLocation} className="space-y-3">
                  <p className="text-xs text-blue-600 font-medium">Trip: {selectedSchedule.route?.source?.name} → {selectedSchedule.route?.destination?.name}</p>
                  <button type="button" onClick={useMyLocation} className="btn-secondary w-full text-sm py-2">
                    📍 Use My Current Location
                  </button>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Latitude</label>
                    <input type="number" step="any" placeholder="e.g. 18.5204" value={locationForm.lat} onChange={(e) => setLocationForm({ ...locationForm, lat: e.target.value })} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Longitude</label>
                    <input type="number" step="any" placeholder="e.g. 73.8567" value={locationForm.lng} onChange={(e) => setLocationForm({ ...locationForm, lng: e.target.value })} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Location Name</label>
                    <input type="text" placeholder="e.g. Near Pune Station" value={locationForm.locationName} onChange={(e) => setLocationForm({ ...locationForm, locationName: e.target.value })} className="input-field text-sm" />
                  </div>
                  <button type="submit" disabled={updatingLocation || !locationForm.lat || !locationForm.lng} className="btn-primary w-full text-sm">
                    {updatingLocation ? 'Updating...' : 'Update Location'}
                  </button>
                </form>
              )}
            </div>

            {selectedSchedule && (
              <MapView
                source={selectedSchedule.route?.source}
                destination={selectedSchedule.route?.destination}
                stops={selectedSchedule.route?.stops || []}
                currentLocation={selectedSchedule.currentLocation}
                height="300px"
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
