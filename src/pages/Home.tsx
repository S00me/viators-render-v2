import { motion } from 'motion/react';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/sections/Hero';
import { UpcomingExpedition } from '@/components/sections/UpcomingExpedition';
import { PastTrips } from '@/components/sections/PastTrips';
import { Footer } from '@/components/layout/Footer';
import { HiddenAdminButton } from '@/components/admin/HiddenAdminButton';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-black min-h-screen font-sans selection:bg-purple-500 selection:text-white relative"
    >
      <Header />
      <main>
        <Hero />
        <UpcomingExpedition />
        <PastTrips />
      </main>
      <Footer />
      <HiddenAdminButton />
      <ScrollToTop />
    </motion.div>
  );
}
