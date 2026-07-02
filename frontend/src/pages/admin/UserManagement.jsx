import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';

const API = import.meta.env.VITE_API_URL || '/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [driverForm, setDriverForm] = useState({ name: '', email: '', phone: '', password: '', licenseNumber: '', role: 'driver' });

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = () => {
    setLoading(true);
    axios.get(`${API}/admin/users${filter ? `?role=${filter}` : ''}`)
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  };

  const toggleStatus = async (id) => {
    const { data } = await axios.patch(`${API}/admin/users/${id}/toggle`);
    setUsers(users.map((u) => u._id === id ? { ...u, isActive: data.user.isActive } : u));
    toast.success(data.message);
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/users`, driverForm);
      toast.success('Driver added!');
      setShowAddDriver(false);
      setDriverForm({ name: '', email: '', phone: '', password: '', licenseNumber: '', role: 'driver' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const roleColors = { admin: 'bg-purple-100 text-purple-700', driver: 'bg-green-100 text-green-700', traveller: 'bg-blue-100 text-blue-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <div className="flex gap-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-40">
              <option value="">All Users</option>
              <option value="traveller">Travellers</option>
              <option value="driver">Drivers</option>
              <option value="admin">Admins</option>
            </select>
            <button onClick={() => setShowAddDriver(!showAddDriver)} className="btn-primary text-sm">
              {showAddDriver ? 'Cancel' : '+ Add Driver'}
            </button>
          </div>
        </div>

        {showAddDriver && (
          <div className="card mb-6">
            <h2 className="font-bold text-lg mb-4">Add New Driver</h2>
            <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Full Name</label>
                <input type="text" placeholder="Driver name" value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Email</label>
                <input type="email" placeholder="Email" value={driverForm.email} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Phone</label>
                <input type="tel" placeholder="Mobile number" value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">License Number</label>
                <input type="text" placeholder="DL number" value={driverForm.licenseNumber} onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium block mb-1">Initial Password</label>
                <input type="password" placeholder="Temporary password" value={driverForm.password} onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })} className="input-field" required />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full">Add Driver</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" /></div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{u.name}</td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3 text-gray-500">{u.phone}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${roleColors[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleStatus(u._id)}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${u.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
