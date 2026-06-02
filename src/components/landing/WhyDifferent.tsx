import { motion } from 'framer-motion';
import { Brain, Gamepad2, Sparkles, Users } from 'lucide-react';

const pillars = [
  {
    icon: Brain,
    title: 'AI Learning Assistant',
    desc: 'AI tutor 24/7 yang adaptif sesuai jenjang — SD penjelasan sederhana, SMA detail, UTBK intensif.',
    color: 'purple',
  },
  {
    icon: Gamepad2,
    title: 'Gamifikasi Total',
    desc: 'XP, level, badge, streak, leaderboard, battle quiz. Belajar terasa seperti main game.',
    color: 'primary',
  },
  {
    icon: Sparkles,
    title: 'Personalized Learning',
    desc: 'Setiap user dapat dashboard dan roadmap berbeda — sesuai umur, kelas, jurusan, dan tujuan.',
    color: 'secondary',
  },
  {
    icon: Users,
    title: 'Creator Ecosystem',
    desc: 'Guru dan creator edukasi bisa upload kelas premium dan dapat revenue sharing dari Eduverse.',
    color: 'warning',
  },
];

export function WhyDifferent() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
            KENAPA EDUVERSE BERBEDA
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Bukan sekadar <span className="text-gradient">portal sekolah</span>.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Eduverse adalah gabungan dari platform belajar modern, game edukasi, AI tutor, dan
            education creator platform — semua dalam satu pengalaman.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/40 via-purple/30 to-secondary/40 opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                <div className="relative h-full p-6 rounded-2xl bg-card border border-border/60 backdrop-blur-sm">
                  <div className={`w-12 h-12 rounded-xl bg-${p.color}/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${p.color}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
