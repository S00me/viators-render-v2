import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Utensils, Home, ExternalLink, CheckCircle, ShoppingCart, ChevronUp, X } from 'lucide-react';
import Map from '@/components/map/Map';
import { parseTrack } from '@/lib/gpx';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HiddenAdminButton } from '@/components/admin/HiddenAdminButton';

interface ItineraryDay {
  id: number;
  day_number: number;
  title: string;
  description: string;
  km: string;
  elevation_gain: string;
  elevation_loss: string;
  shelter: string;
  water_source: boolean;
  food_source: boolean;
  store_source: boolean;
  difficulty: string;
  komoot_link: string;
  gpx_url: string;
  color: string;
}

interface GearCategory {
  id: number;
  name: string;
  items: { id: number; name: string }[];
}

interface GearItemProps {
  item: { id: number; name: string };
}

function GearItem({ item }: GearItemProps) {
  const [checked, setChecked] = useState(false);

  return (
    <li 
      className="flex items-start gap-3 text-sm cursor-pointer group"
      onClick={() => setChecked(!checked)}
    >
      <div className={`mt-0.5 w-4 h-4 rounded-full border transition-all duration-300 flex items-center justify-center shrink-0 ${checked ? 'bg-purple-500 border-purple-500' : 'border-zinc-600 group-hover:border-purple-400'}`}>
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle size={10} className="text-white" />
          </motion.div>
        )}
      </div>
      <span className={`transition-colors duration-300 ${checked ? 'text-zinc-500 line-through' : 'text-zinc-300 group-hover:text-white'}`}>
        {item.name}
      </span>
    </li>
  );
}

function RouteKey({ days }: { days: ItineraryDay[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Panel */}
      <div className="hidden md:block absolute bottom-4 right-4 bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10 max-w-xs shadow-2xl">
        <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3 border-b border-white/10 pb-2">Route Key</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {days.map((day) => (
            <div key={day.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: day.color || '#000000' }} />
              <span className="text-xs text-zinc-300 font-medium truncate">Day {day.day_number}: {day.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/10 text-white shadow-lg z-[1000]"
      >
        <ChevronUp size={20} />
      </button>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-2xl p-6 z-[2001] md:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Route Key</h4>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 bg-white/5 rounded-full text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {days.map((day) => (
                  <div key={day.id} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: day.color || '#000000' }} />
                    <span className="text-sm text-zinc-300 font-medium">Day {day.day_number}: {day.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Itinerary() {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [gear, setGear] = useState<GearCategory[]>([]);
  const [routes, setRoutes] = useState<{ coordinates: [number, number][]; color: string }[]>([]);
  const [center, setCenter] = useState<[number, number]>([46.0000, 7.7300]);
  const [upcomingTitle, setUpcomingTitle] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const upcomingRes = await fetch('/api/upcoming');
        const upcomingData = await upcomingRes.json();
        setUpcomingTitle(upcomingData.title);

        const daysRes = await fetch('/api/itinerary');
        const daysData = await daysRes.json();
        setDays(daysData);

        const gearRes = await fetch('/api/gear');
        const gearData = await gearRes.json();
        setGear(gearData);

        // Parse GPX files
        const parsedRoutes = await Promise.all(
          daysData.map(async (day: ItineraryDay) => {
            if (day.gpx_url) {
              try {
                const coordinates = await parseTrack(day.gpx_url);
                return { coordinates, color: day.color || '#ffffff' };
              } catch (e) {
                console.error(`Failed to parse GPX for day ${day.day_number}`, e);
                return null;
              }
            }
            return null;
          })
        );
        
        const validRoutes = parsedRoutes.filter((r): r is { coordinates: [number, number][]; color: string } => r !== null);
        setRoutes(validRoutes);
        
        if (validRoutes.length > 0 && validRoutes[0].coordinates.length > 0) {
          setCenter(validRoutes[0].coordinates[0]);
        }
      } catch (e) {
        console.error('Failed to fetch itinerary data', e);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-black min-h-screen font-sans selection:bg-purple-500 selection:text-white relative"
    >
      <Header />
      
      <main className="pt-24">
        <div className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
          <div className="mb-12">
            <span className="text-purple-500 font-mono text-sm tracking-widest uppercase mb-2 block">{upcomingTitle}</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">FULL ITINERARY</h1>
            <p className="text-zinc-400 max-w-2xl text-lg font-light">
              Detailed breakdown of the route, daily stats, and essential gear for the expedition.
            </p>
          </div>

          {/* Map Section */}
          <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 h-[500px] relative shadow-2xl">
            <Map 
              routes={routes} 
              center={center} 
              zoom={12} 
              className="w-full h-full" 
              fitBounds={true}
              basemap="outdoors"
            />
            <RouteKey days={days} />
          </div>
        </div>

        {/* Daily Breakdown */}
        <section className="bg-zinc-950 py-24 px-4 md:px-8 border-t border-white/5" id="itinerary">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-white mb-16 border-b border-white/10 pb-4 text-center uppercase tracking-widest">Daily Breakdown</h2>
            
            <div className="space-y-24">
              {days.map((day, index) => (
                <motion.div 
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-1">
                    <div className="sticky top-24">
                      <span className="text-purple-500 font-mono text-xl font-bold block mb-2">DAY {day.day_number}</span>
                      <h3 className="text-2xl font-bold text-white mb-4">{day.title}</h3>
                      <p className="text-zinc-400 leading-relaxed mb-6">
                        {day.description}
                      </p>
                      {day.komoot_link && (
                        <a 
                          href={day.komoot_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-white border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors"
                        >
                          View on Komoot <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div>
                          <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Distance</span>
                          <span className="text-xl font-mono font-bold text-white">{day.km}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Gain</span>
                          <span className="text-xl font-mono font-bold text-green-400">+{day.elevation_gain}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Loss</span>
                          <span className="text-xl font-mono font-bold text-red-400">-{day.elevation_loss}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Difficulty</span>
                          <span className="text-xl font-mono font-bold text-white">{day.difficulty}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-white/5 pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                            <Home size={18} />
                          </div>
                          <div>
                            <span className="text-xs text-zinc-500 block">Shelter</span>
                            <span className="text-sm text-white">{day.shelter}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${day.water_source ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
                            <Droplets size={18} />
                          </div>
                          <div>
                            <span className="text-xs text-zinc-500 block">Water Source</span>
                            <span className="text-sm text-white">{day.water_source ? 'Available' : 'None'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${day.food_source ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            <Utensils size={18} />
                          </div>
                          <div>
                            <span className="text-xs text-zinc-500 block">Food Source</span>
                            <span className="text-sm text-white">{day.food_source ? 'Available' : 'None'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${day.store_source ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                            <ShoppingCart size={18} />
                          </div>
                          <div>
                            <span className="text-xs text-zinc-500 block">Store</span>
                            <span className="text-sm text-white">{day.store_source ? 'Available' : 'None'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gear List */}
        <section className="bg-[#050505] py-24 px-4 md:px-8 border-t border-white/5" id="gear">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-white mb-16 border-b border-white/10 pb-4 text-center uppercase tracking-widest">Expedition Gear</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gear.map((category) => (
                <div key={category.id} className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 hover:bg-zinc-900/50 transition-colors">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    {category.name}
                  </h3>
                  <ul className="space-y-3">
                    {category.items.map((item) => (
                      <GearItem key={item.id} item={item} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <HiddenAdminButton />
    </motion.div>
  );
}
