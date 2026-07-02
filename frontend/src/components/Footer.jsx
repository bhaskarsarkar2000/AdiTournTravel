import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🚌</span>
            <span className="text-white font-bold text-lg">AdiTourn<span className="text-yellow-400">Travel</span></span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Connecting India, one journey at a time. Affordable, safe and comfortable travel.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/search" className="hover:text-white transition-colors">Search Buses</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span>📞</span> +91 98765 43210</li>
            <li className="flex items-center gap-2"><span>✉️</span> support@aditourn.in</li>
            <li className="flex items-center gap-2"><span>🕐</span> 24/7 Customer Care</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} AdiTourn Travel. All rights reserved. | Made with ❤️ for India
      </div>
    </footer>
  );
}
