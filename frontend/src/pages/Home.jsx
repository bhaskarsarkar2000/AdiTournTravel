import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const popularRoutes = [
  { from: 'Mumbai', to: 'Pune', duration: '3h 30m', price: 250 },
  { from: 'Delhi', to: 'Jaipur', duration: '5h', price: 350 },
  { from: 'Bangalore', to: 'Mysore', duration: '3h', price: 200 },
  { from: 'Chennai', to: 'Pondicherry', duration: '3h', price: 180 },
  { from: 'Hyderabad', to: 'Vijayawada', duration: '5h 30m', price: 320 },
  { from: 'Kolkata', to: 'Siliguri', duration: '9h', price: 500 },
];

export default function Home() {
  const [form, setForm] = useState({ source: '', destination: '', date: '' });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.source || !form.destination || !form.date) return;
    navigate(`/search?source=${form.source}&destination=${form.destination}&date=${form.date}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🚌</div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Travel India<br /><span className="text-yellow-300">Smarter & Cheaper</span>
          </h1>
          <p className="text-blue-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Book bus tickets across India. Choose your seat, track your bus live, pay securely.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-left">
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">From</label>
                <input
                  type="text"
                  placeholder="Departure City"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="text-left">
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">To</label>
                <input
                  type="text"
                  placeholder="Arrival City"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="text-left">
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full text-base">
                  Search Buses 🔍
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🚌', val: '500+', label: 'Buses' },
            { icon: '🗺️', val: '200+', label: 'Routes' },
            { icon: '😊', val: '1L+', label: 'Happy Travellers' },
            { icon: '🏙️', val: '50+', label: 'Cities' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold text-blue-700">{s.val}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Popular Routes</h2>
        <p className="text-gray-500 text-center mb-10">Most booked journeys across India</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularRoutes.map((r) => (
            <div
              key={`${r.from}-${r.to}`}
              onClick={() => navigate(`/search?source=${r.from}&destination=${r.to}&date=${new Date().toISOString().split('T')[0]}`)}
              className="card hover:shadow-xl cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">From</p>
                  <p className="text-xl font-bold text-gray-800">{r.from}</p>
                </div>
                <div className="text-2xl group-hover:animate-bounce">→</div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase">To</p>
                  <p className="text-xl font-bold text-gray-800">{r.to}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">⏱ {r.duration}</span>
                <span className="text-blue-600 font-bold text-lg">from ₹{r.price}</span>
              </div>
            </div>
          ))}
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
