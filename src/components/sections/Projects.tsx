import { motion } from 'motion/react';
import { ExternalLink, Github } from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    title: "E-Commerce Dashboard",
    category: "Web Application",
    description: "A comprehensive analytics dashboard for online retailers featuring real-time data visualization.",
    image: "https://picsum.photos/seed/project1/800/600",
    tech: ["React", "TypeScript", "D3.js"]
  },
  {
    id: 2,
    title: "Travel Companion",
    category: "Mobile App",
    description: "AI-powered itinerary planner helping travelers discover hidden gems in new cities.",
    image: "https://picsum.photos/seed/project2/800/600",
    tech: ["React Native", "Node.js", "GraphQL"]
  },
  {
    id: 3,
    title: "Financial Portfolio",
    category: "FinTech",
    description: "Secure platform for tracking investments and analyzing market trends.",
    image: "https://picsum.photos/seed/project3/800/600",
    tech: ["Vue.js", "Python", "PostgreSQL"]
  }
];

export function Projects() {
  return (
    <section id="projects" className="py-24 bg-zinc-950 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-purple-500 font-mono text-sm tracking-widest uppercase mb-2 block">Selected Work</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">FEATURED PROJECTS</h2>
        </div>

        <div className="grid gap-12">
          {PROJECTS.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-900/50 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="aspect-video rounded-xl overflow-hidden bg-black relative">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{project.category}</span>
                  <h3 className="text-3xl font-display font-bold mt-2">{project.title}</h3>
                </div>
                
                <p className="text-zinc-400 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map(t => (
                    <span key={t} className="px-3 py-1 bg-white/5 rounded-full text-xs text-zinc-300 border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex items-center gap-2 text-sm font-bold hover:text-purple-400 transition-colors">
                    <ExternalLink size={16} /> Live Demo
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold hover:text-purple-400 transition-colors">
                    <Github size={16} /> Source Code
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
