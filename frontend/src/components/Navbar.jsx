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
      { to: '/admin', label: '📊 Dashboard' },
      { to: '/admin/buses', label: '🚌 Buses' },
      { to: '/admin/routes', label: '🗺️ Routes' },
      { to: '/admin/schedules', label: '⏰ Schedules' },
      { to: '/admin/users', label: '👥 Users' },
    ],
    driver: [{ to: '/driver', label: '🚗 My Dashboard' }],
    traveller: [
      { to: '/search', label: '🔍 Search Buses' },
      { to: '/my-bookings', label: '🎫 My Bookings' },
    ],
  };

  const links = user ? navLinks[user.role] || [] : [];

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 shadow-2xl sticky top-0 z-50 border-b-2 border-indigo-400 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:scale-125 transition-transform duration-300">🚌</span>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight leading-none bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">AdiTourn</span>
              <span className="text-indigo-200 font-bold text-xs tracking-widest">TRAVEL PRO</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link 
                key={l.to} 
                to={l.to} 
                className="text-blue-100 hover:text-white font-semibold transition-all duration-200 text-sm relative group uppercase tracking-wide"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-yellow-300 to-yellow-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/search" className="text-blue-100 hover:text-white font-semibold text-sm transition-colors uppercase tracking-wide">🔍 Search</Link>
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all duration-300 border border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 uppercase tracking-wide"
                >
                  🧳 Traveller
                </Link>
                <Link 
                  to="/admin" 
                  className="text-blue-100 hover:text-white font-semibold text-sm transition-colors uppercase tracking-wide hover:bg-white/10 px-3 py-2 rounded-lg"
                >
                  ⚙️ Admin
                </Link>
                <Link 
                  to="/driver" 
                  className="text-blue-100 hover:text-white font-semibold text-sm transition-colors uppercase tracking-wide hover:bg-white/10 px-3 py-2 rounded-lg"
                >
                  🚗 Driver
                </Link>
              </>
            )}
            {user && (
              <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 via-orange-300 to-red-400 flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-white/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold">{user.name.split(' ')[0]}</span>
                    <span className="text-xs bg-gradient-to-r from-green-300 to-emerald-300 text-green-900 px-3 py-0.5 rounded-full font-bold capitalize shadow-md">{user.role}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm px-5 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-bold uppercase tracking-wide hover:scale-105"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
            <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-in-up">
            {links.map((l) => (
              <Link 
                key={l.to} 
                to={l.to} 
                onClick={() => setMenuOpen(false)} 
                className="block text-blue-100 hover:text-yellow-300 py-2 text-sm font-semibold transition-colors border-l-4 border-transparent hover:border-yellow-300 pl-2"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link 
                  to="/search" 
                  onClick={() => setMenuOpen(false)} 
                  className="block text-blue-100 hover:text-yellow-300 py-2 text-sm font-semibold border-l-4 border-transparent hover:border-yellow-300 pl-2"
                >
                  🔍 Search
                </Link>
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="block text-blue-100 py-2 text-sm font-semibold"
                >
                  🧳 Traveller Login
                </Link>
                
                  
              </>
            )}
            {user && (
              <button 
                onClick={handleLogout} 
                className="block text-red-300 hover:text-red-200 py-2 text-sm font-semibold w-full text-left"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
