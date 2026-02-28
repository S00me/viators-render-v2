import { motion } from 'motion/react';

const SKILLS = [
  { category: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Three.js"] },
  { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "GraphQL", "Redis"] },
  { category: "DevOps", items: ["Docker", "AWS", "CI/CD", "Linux", "Git"] },
  { category: "Design", items: ["Figma", "Adobe CC", "UI/UX", "Prototyping", "Motion"] }
];

export function Skills() {
  return (
    <section id="skills" className="py-24 bg-black text-white px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <span className="text-purple-500 font-mono text-sm tracking-widest uppercase mb-2 block">Expertise</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">TECHNICAL SKILLS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SKILLS.map((group, idx) => (
            <motion.div 
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/30 p-8 rounded-2xl border border-white/5 hover:bg-zinc-900/50 transition-colors"
            >
              <h3 className="text-xl font-bold mb-6 text-purple-400">{group.category}</h3>
              <ul className="space-y-3">
                {group.items.map(item => (
                  <li key={item} className="flex items-center gap-3 text-zinc-300">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
