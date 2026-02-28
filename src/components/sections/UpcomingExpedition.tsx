import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mountain, Ruler, Clock, Home, MapPin, AlertTriangle } from 'lucide-react';
import Map from '@/components/map/Map';
import { parseTrack } from '@/lib/gpx';
import { Link } from 'react-router-dom';
import { ElevationBackground } from '@/components/ui/ElevationBackground';

interface UpcomingData {
  title: string;
  description: string;
  elevation: string;
  distance: string;
  duration: string;
  shelter: string;
  region: string;
  highlights: string[];
  route_gpx: string | null;
  center_lat: number;
  center_lng: number;
  zoom: number;
  image: string | null;
}

export function UpcomingExpedition() {
  const [activeTab, setActiveTab] = useState<'map' | 'details'>('map');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<UpcomingData | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [center, setCenter] = useState<[number, number]>([46.0000, 7.7300]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/upcoming');
        const json = await res.json();
        setData(json);
        setCenter([json.center_lat, json.center_lng]);

        if (json.route_gpx) {
          try {
            const coordinates = await parseTrack(json.route_gpx);
            setRoute(coordinates);
            if (coordinates.length > 0) {
              setCenter(coordinates[0]);
            }
          } catch (e) {
            console.error("Failed to parse GPX", e);
          }
        }
      } catch (e) {
        console.error("Failed to fetch upcoming expedition", e);
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const coordinates = await parseTrack(file);
      setRoute(coordinates);
      if (coordinates.length > 0) {
        setCenter(coordinates[0]);
      }
    } catch (error) {
      console.error('Error parsing GPX file:', error);
      alert('Error parsing GPX file. Please ensure it is a valid GPX or KML file.');
    }
  };

  if (!data) return <div className="py-24 bg-black text-white text-center">Loading...</div>;

  return (
    <section id="expedition" className="py-24 bg-[#0a0a0a] text-white px-4 md:px-8 relative overflow-hidden">
      <ElevationBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#0a0a0a] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-purple-500 font-mono text-sm tracking-widest uppercase mb-2 block">Next Objective</span>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-none">
              {data.title}
            </h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'map' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Route Map
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[500px] bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 relative group shadow-2xl">
            {activeTab === 'map' ? (
              <>
                <Map 
                  route={route} 
                  center={center} 
                  zoom={data.zoom} 
                  className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" 
                  fitBounds={true}
                  basemap="dark"
                />
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-400">
                  {route.length > 0 ? 'Route Loaded' : 'No Route Data'}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex">
                  <Link 
                    to="/itinerary"
                    className="px-6 py-2 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full text-white text-sm font-medium hover:bg-white hover:text-black transition-all shadow-lg flex items-center gap-2"
                  >
                    See Detailed Map <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-8 md:p-12 h-full flex flex-col justify-center bg-zinc-900/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="text-purple-500" />
                  Expedition Brief
                </h3>
                <p className="text-zinc-300 leading-relaxed text-lg mb-8">
                  {data.description}
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Region</span>
                    <span className="text-white font-medium">{data.region}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Shelter</span>
                    <span className="text-white font-medium">{data.shelter}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-6">Key Statistics</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-xl text-white">
                    <Mountain size={20} />
                  </div>
                  <div>
                    <span className="block text-xl font-mono font-bold">{data.elevation}</span>
                    <span className="text-zinc-500 text-[10px] uppercase">Elevation</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-xl text-white">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <span className="block text-xl font-mono font-bold">{data.distance}</span>
                    <span className="text-zinc-500 text-[10px] uppercase">Distance</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-xl text-white">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="block text-xl font-mono font-bold">{data.duration}</span>
                    <span className="text-zinc-500 text-[10px] uppercase">Duration</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-purple-400 text-xs uppercase tracking-widest mb-4">Highlights</h3>
              <ul className="space-y-3">
                {data.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to="/itinerary"
              className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors group"
            >
              View Full Itinerary
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

