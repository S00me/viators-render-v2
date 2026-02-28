import { useState, useEffect } from 'react';
import { Instagram, Twitter, Mail, ArrowUp } from 'lucide-react';

export function Footer() {
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings/profile_picture')
      .then(res => res.json())
      .then(data => {
        if (data.value) setProfilePic(data.value);
      })
      .catch(console.error);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="community" className="bg-black text-white py-24 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1e1e1e] rounded-full flex items-center justify-center overflow-hidden relative">
              {profilePic ? (
                <img src={profilePic} alt="Community" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">V</span>
              )}
            </div>
            <span className="font-display font-bold tracking-wider text-lg">VIATORS</span>
          </div>
          <p className="text-zinc-500 max-w-xs text-sm leading-relaxed">
            A community dedicated to high-altitude exploration and the shared experience of the mountains.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/_viators/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <button className="text-zinc-500 hover:text-white transition-colors cursor-not-allowed opacity-50" title="Coming Soon">
              <Twitter size={20} />
            </button>
            <a href="mailto:viatoors@gmail.com" className="text-zinc-500 hover:text-white transition-colors">
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-8">
          <div className="text-left md:text-right">
            <p className="text-xl md:text-2xl font-display font-light text-zinc-300 max-w-md leading-tight mb-2">
              Interested in the vision?
            </p>
            <a 
              href="https://www.instagram.com/_viators/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium text-lg inline-flex items-center gap-2"
            >
              Message me! <Instagram size={18} />
            </a>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="mt-8 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group"
          >
            Back to Summit
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
      
      <div className="mt-24 text-center space-y-2">
        <p className="text-zinc-500 text-xs">
          All photos belong to <a href="https://www.instagram.com/mark_kolossa/" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors">@mark_kolossa</a>.
        </p>
        <p className="text-zinc-800 text-[10px] uppercase tracking-widest">
          © 2026 Viators Community. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
