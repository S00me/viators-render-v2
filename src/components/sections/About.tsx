import { motion } from 'motion/react';
import { ArrowDown, Code, Palette, Terminal } from 'lucide-react';

export function About() {
  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-80" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 mb-4"
        >
          <img 
            src="https://picsum.photos/seed/avatar/400/400" 
            alt="Profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.h1 
          className="font-display font-bold text-5xl md:text-7xl tracking-tighter text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          CREATIVE DEVELOPER
        </motion.h1>

        <motion.div 
          className="flex flex-col gap-4 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <p className="text-xl md:text-2xl text-zinc-400 font-light tracking-wide max-w-2xl leading-relaxed">
            Building digital experiences that merge art and technology.
          </p>
          
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Code size={16} className="text-purple-400" />
              <span className="text-sm">Full Stack</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Palette size={16} className="text-purple-400" />
              <span className="text-sm">UI/UX Design</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Terminal size={16} className="text-purple-400" />
              <span className="text-sm">System Arch</span>
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={scrollToProjects}
          className="mt-16 group flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <span className="text-xs uppercase tracking-[0.2em]">View Work</span>
          <div className="p-3 rounded-full border border-white/10 group-hover:border-white/30 transition-all duration-300 group-hover:bg-white/5">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </motion.button>
      </div>
    </section>
  );
}
