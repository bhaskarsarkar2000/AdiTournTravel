import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export default function Autocomplete({ value, onChange, placeholder, type = 'source' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch all cities/routes and filter based on input
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/routes`);
        const routes = data.routes || [];
        
        // Extract unique cities based on type (source or destination)
        let cities = new Set();
        routes.forEach(route => {
          if (type === 'source') {
            cities.add(route.source.name);
          } else {
            cities.add(route.destination.name);
          }
        });
        
        // Filter cities that match the input
        const filtered = Array.from(cities)
          .filter(city => city.toLowerCase().includes(value.toLowerCase()))
          .sort();
        
        setSuggestions(filtered);
        setIsOpen(true);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce
    return () => clearTimeout(timer);
  }, [value, type]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsOpen(true)}
          className="input-field w-full"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-3 text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
        >
          {suggestions.map((city, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-800">{city}</div>
              <div className="text-xs text-gray-400">
                {type === 'source' ? '📍 Departure' : '📍 Arrival'}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && value && suggestions.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 text-center text-gray-500 text-sm">
          No cities found
        </div>
      )}
    </div>
  );
}
