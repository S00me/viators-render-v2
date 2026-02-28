import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown } from 'lucide-react';

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings/hero_background')
      .then(res => res.json())
      .then(data => {
        if (data.value) setBgImage(data.value);
        // else setBgImage('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80');
      })
      .catch((err) => {
        console.error(err);
        // setBgImage('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80');
      });
  }, []);

  const scrollToExpedition = () => {
    const element = document.getElementById('expedition');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="h-screen relative overflow-hidden flex items-center justify-center bg-black">
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y, scale }}
      >
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          initial={{ opacity: 0 }}
          animate={{ opacity: bgImage ? 1 : 0 }}
          transition={{ duration: 1 }}
          style={{ 
            backgroundImage: bgImage ? `url("${bgImage}")` : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black" />
      </motion.div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ opacity }}
        >
          <h1 className="font-display text-[18vw] md:text-[12vw] font-bold text-white leading-none tracking-tighter opacity-90">
            VIATORS
          </h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent" />
            <p className="text-white/80 font-light text-sm md:text-base tracking-[0.2em] uppercase max-w-md mx-auto">
              "It is not the mountain we conquer, but ourselves."
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        onClick={scrollToExpedition}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors flex flex-col items-center gap-2 group cursor-pointer z-20"
      >
        <span className="text-[10px] uppercase tracking-widest group-hover:tracking-[0.2em] transition-all duration-300">Begin Ascent</span>
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </motion.button>
    </section>
  );
}
