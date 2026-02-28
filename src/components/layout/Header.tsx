import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Menu, ArrowLeft, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isItinerary = location.pathname === '/itinerary';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Fetch profile picture
    fetch('/api/settings/profile_picture')
      .then(res => res.json())
      .then(data => {
        if (data.value) setProfilePic(data.value);
      })
      .catch(console.error);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    if (isItinerary) return; // Should not happen if buttons are hidden
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menuItems = isItinerary 
    ? [
        { label: 'Itinerary', id: 'itinerary' }, // Assuming top of page or specific section
        { label: 'Gear', id: 'gear' } // Need to add id="gear" to gear section in Itinerary page
      ]
    : [
        { label: 'Upcoming Expedition', id: 'expedition' },
        { label: 'Archive', id: 'trips' },
        { label: 'Community', id: 'community' }
      ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 flex justify-between items-center",
        isMenuOpen ? "bg-black" : (isScrolled ? "bg-black/50 backdrop-blur-md border-b border-white/5" : "bg-transparent")
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 cursor-pointer">
        {isItinerary ? (
           <Link to="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 bg-[#1e1e1e] rounded-full flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
               <ArrowLeft size={16} className="text-white" />
             </div>
             <span className="text-white font-display font-bold tracking-wider text-lg">VIATORS</span>
           </Link>
        ) : (
          <div className="flex items-center gap-2" onClick={() => scrollToSection('hero')}>
            <div 
              className="w-8 h-8 bg-[#1e1e1e] rounded-full flex items-center justify-center overflow-hidden relative group"
            >
              {profilePic ? (
                <img src={profilePic} alt="Community" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">V</span>
              )}
            </div>
            <span className="text-white font-display font-bold tracking-wider text-lg">VIATORS</span>
          </div>
        )}
      </div>

      <nav className="hidden md:flex gap-8">
        {isItinerary ? (
          <Link
            to="/"
            className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors uppercase flex items-center gap-2"
          >
            Return to Base Camp
          </Link>
        ) : (
          menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.id)}
              className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors uppercase"
            >
              {item.label}
            </button>
          ))
        )}
      </nav>

      <button 
        className="md:hidden text-white z-50"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 md:hidden flex flex-col gap-4 shadow-2xl"
          >
            {isItinerary && (
                 <Link
                    to="/"
                    className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors uppercase py-2 border-b border-white/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Return to Base Camp
                  </Link>
            )}
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                    if (isItinerary && item.id === 'gear') {
                        // Special handling for gear section in itinerary page if needed, 
                        // but scrollIntoView should work if id exists
                        const element = document.getElementById('gear');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                    } else if (isItinerary && item.id === 'itinerary') {
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        scrollToSection(item.id);
                    }
                    setIsMenuOpen(false);
                }}
                className="text-left text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors uppercase py-2 border-b border-white/5 last:border-0"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
