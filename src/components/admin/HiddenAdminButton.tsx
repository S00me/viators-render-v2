import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Settings } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { AdminPanel } from './AdminPanel';

export function HiddenAdminButton() {
  const { isAdmin } = useAdmin();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Show if within 200px of bottom
      if (windowHeight + scrollTop >= documentHeight - 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-4 left-4 p-2 bg-black/50 backdrop-blur-md hover:bg-white/10 rounded-full text-white/20 hover:text-white transition-all duration-300 z-[999] border border-white/5"
        title="Admin Mode"
      >
        <Settings size={16} />
      </button>

      {isLoginOpen && (
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      )}

      {isAdminPanelOpen && (
        <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
      )}
    </>
  );
}
