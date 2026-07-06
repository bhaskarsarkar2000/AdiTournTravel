import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function DriverLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password, 'driver');
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/driver');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🚗</div>
            <h1 className="text-3xl font-bold text-gray-800">Driver Portal</h1>
            <p className="text-gray-500 mt-1">Access your driver dashboard</p>
          </div>

          <div className="card shadow-xl border-l-4 border-green-600">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Driver Email</label>
                <input
                  type="email"
                  placeholder="driver@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                {loading ? 'Signing in...' : 'Sign in as Driver'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">← Back to Traveller Login</Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <span className="font-bold">🚌 Driver Portal</span><br/>
              Manage your assigned routes, schedules, and track your bus location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
