import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const selectedIcon = L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: '',
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return null;
}

export default function InteractiveMapView({ selectedLocation, onLocationSelect, height = '400px' }) {
  const center = selectedLocation?.lat 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [20.5937, 78.9629]; // Center of India

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-blue-400 shadow-lg" style={{ height }}>
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler onLocationSelect={onLocationSelect} />

        {selectedLocation?.lat && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
            <Popup>
              <strong>Selected Location</strong><br />
              Lat: {selectedLocation.lat.toFixed(4)}<br />
              Lng: {selectedLocation.lng.toFixed(4)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="absolute bottom-0 left-0 right-0 bg-blue-100 border-t border-blue-300 px-3 py-2 text-xs text-blue-700 z-10 font-medium">
        📍 Click on the map to select a location
      </div>
    </div>
  );
}
