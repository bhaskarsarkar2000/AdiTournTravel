import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export default function TravellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ source: '', destination: '', date: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?source=${form.source}&destination=${form.destination}&date=${form.date}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Welcome, {user?.name}! 👋</h1>
          <p className="text-blue-200">Where would you like to go today?</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <form onSubmit={handleSearch} className="card mb-8">
          <h2 className="font-bold text-lg mb-4">Search Buses</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-500 font-medium block mb-1">From</label>
              <input type="text" placeholder="Departure city" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="text-sm text-gray-500 font-medium block mb-1">To</label>
              <input type="text" placeholder="Destination city" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="text-sm text-gray-500 font-medium block mb-1">Date</label>
              <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full">Search 🔍</button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => navigate('/my-bookings')} className="card cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-4xl mb-3">🎫</div>
            <h3 className="font-bold text-lg text-gray-800">My Bookings</h3>
            <p className="text-gray-500 text-sm">View and manage your tickets</p>
          </div>
          <div onClick={() => navigate('/search')} className="card cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-green-50 to-teal-50">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-lg text-gray-800">Browse Routes</h3>
            <p className="text-gray-500 text-sm">Explore all available buses</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
