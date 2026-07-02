import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const busIcon = L.divIcon({
  html: '<div style="font-size:28px; line-height:1;">🚌</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  className: '',
});

const locationIcon = (color = 'blue') => L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
});

export default function MapView({ source, destination, stops = [], currentLocation, height = '400px' }) {
  const center = source?.coordinates
    ? [source.coordinates.lat, source.coordinates.lng]
    : [20.5937, 78.9629]; // Center of India

  const routePoints = [];
  if (source?.coordinates) routePoints.push([source.coordinates.lat, source.coordinates.lng]);
  stops.forEach((s) => {
    if (s.coordinates) routePoints.push([s.coordinates.lat, s.coordinates.lng]);
  });
  if (destination?.coordinates) routePoints.push([destination.coordinates.lat, destination.coordinates.lng]);

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-gray-200 shadow">
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {source?.coordinates && (
          <Marker position={[source.coordinates.lat, source.coordinates.lng]} icon={locationIcon('green')}>
            <Popup><strong>Departure:</strong> {source.name}</Popup>
          </Marker>
        )}

        {destination?.coordinates && (
          <Marker position={[destination.coordinates.lat, destination.coordinates.lng]} icon={locationIcon('red')}>
            <Popup><strong>Arrival:</strong> {destination.name}</Popup>
          </Marker>
        )}

        {stops.map((stop, i) => stop.coordinates && (
          <Marker key={i} position={[stop.coordinates.lat, stop.coordinates.lng]} icon={locationIcon('orange')}>
            <Popup>
              <strong>{stop.name}</strong><br />
              {stop.arrivalTime && <span>Arrives: {stop.arrivalTime}</span>}<br />
              {stop.departureTime && <span>Departs: {stop.departureTime}</span>}
            </Popup>
          </Marker>
        ))}

        {currentLocation?.lat && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={busIcon}>
            <Popup>
              <strong>Bus Current Location</strong><br />
              {currentLocation.locationName && <span>{currentLocation.locationName}</span>}
            </Popup>
          </Marker>
        )}

        {routePoints.length > 1 && (
          <Polyline positions={routePoints} color="#2563eb" weight={4} opacity={0.7} dashArray="8 4" />
        )}
      </MapContainer>
    </div>
  );
}
