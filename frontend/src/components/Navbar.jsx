import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = {
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/buses', label: 'Buses' },
      { to: '/admin/routes', label: 'Routes' },
      { to: '/admin/schedules', label: 'Schedules' },
      { to: '/admin/users', label: 'Users' },
    ],
    driver: [{ to: '/driver', label: 'My Dashboard' }],
    traveller: [
      { to: '/search', label: 'Search Buses' },
      { to: '/my-bookings', label: 'My Bookings' },
    ],
  };

  const links = user ? navLinks[user.role] || [] : [];

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🚌</span>
            <span className="text-white font-bold text-xl tracking-tight">AdiTourn<span className="text-yellow-300">Travel</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-blue-100 hover:text-white font-medium transition-colors text-sm">
                {l.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/search" className="text-blue-100 hover:text-white font-medium text-sm">Search Buses</Link>
                <Link to="/login" className="text-blue-100 hover:text-white font-medium text-sm">Login</Link>
                <Link to="/register" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                  Register
                </Link>
              </>
            )}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-blue-200 text-sm">
                  Hi, <span className="text-white font-semibold">{user.name.split(' ')[0]}</span>
                  <span className="ml-1 text-xs bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full font-bold capitalize">{user.role}</span>
                </span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                  Logout
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white py-2 text-sm font-medium">
                {l.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/search" onClick={() => setMenuOpen(false)} className="block text-blue-100 py-2 text-sm">Search Buses</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-blue-100 py-2 text-sm">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-yellow-300 py-2 text-sm font-bold">Register</Link>
              </>
            )}
            {user && (
              <button onClick={handleLogout} className="block text-red-300 py-2 text-sm font-medium">Logout</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
