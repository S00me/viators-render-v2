import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { Plus, Minus, ArrowDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  route?: [number, number][]; // Single route
  routes?: { coordinates: [number, number][]; color: string }[]; // Multiple routes
  center?: [number, number];
  zoom?: number;
  className?: string;
  fitBounds?: boolean;
  basemap?: 'dark' | 'outdoors' | 'topo-dark';
  lineColor?: string;
}

function MapUpdater({ center, zoom, route, routes, fitBounds }: { center: [number, number]; zoom: number; route?: [number, number][]; routes?: { coordinates: [number, number][]; color: string }[]; fitBounds?: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (fitBounds) {
      const bounds = L.latLngBounds([]);
      if (route && route.length > 0) {
        route.forEach(coord => bounds.extend(coord));
      }
      if (routes && routes.length > 0) {
        routes.forEach(r => {
          r.coordinates.forEach(coord => bounds.extend(coord));
        });
      }
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
        return;
      }
    }
    map.setView(center, zoom);
  }, [center, zoom, map, fitBounds, route, routes]);
  return null;
}

function CustomZoomControl() {
  const map = useMap();

  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="p-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
        aria-label="Zoom In"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="p-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
        aria-label="Zoom Out"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}

function ScrollDownButton() {
  const handleScroll = () => {
     window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' });
  };

  return (
    <button 
      onClick={handleScroll}
      className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white shadow-lg hover:bg-white hover:text-black transition-all duration-300"
      aria-label="Scroll Down"
    >
      <ArrowDown size={20} />
    </button>
  );
}

export default function Map({ route, routes, center = [46.5775, 7.9052], zoom = 13, className, fitBounds = false, basemap = 'dark', lineColor = '#8B5CF6' }: MapProps) {
  // Default center: Eiger/Jungfrau region (Swiss Alps) as a placeholder for "high altitude"

  const tileLayer = (basemap === 'outdoors' || basemap === 'topo-dark')
    ? {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }
    : {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      };

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={false} 
      zoomControl={false}
      className={`w-full h-full rounded-xl z-0 ${className}`}
    >
      <TileLayer
        attribution={tileLayer.attribution}
        url={tileLayer.url}
        className={basemap === 'topo-dark' ? 'invert brightness-90 contrast-75 grayscale' : ''}
      />
      
      {route && route.length > 0 && (
        <Polyline 
          positions={route} 
          pathOptions={{ color: lineColor, weight: 4, opacity: 0.8 }} 
        />
      )}

      {routes && routes.map((r, i) => (
        <Polyline 
          key={i}
          positions={r.coordinates} 
          pathOptions={{ color: r.color, weight: 4, opacity: 0.8 }} 
        />
      ))}

      <MapUpdater center={center} zoom={zoom} route={route} routes={routes} fitBounds={fitBounds} />
      <CustomZoomControl />
      <ScrollDownButton />
    </MapContainer>
  );
}
