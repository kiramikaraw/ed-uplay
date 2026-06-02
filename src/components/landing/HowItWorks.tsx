import { motion } from 'framer-motion';
import { UserPlus, Compass, Rocket } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Pilih Role & Tujuan Belajar',
    desc: 'Daftar sebagai siswa, creator, atau orang tua. Lengkapi profil — jenjang, kelas, jurusan, dan tujuan belajar kamu.',
  },
  {
    icon: Compass,
    step: '02',
    title: 'Smart Learning Path Aktif',
    desc: 'Sistem AI otomatis menyusun roadmap belajar, rekomendasi modul, jadwal quiz, dan target mingguan personal.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Belajar, Main, Naik Level',
    desc: 'Belajar via modul, AI tutor, game, dan battle quiz. Kumpulkan XP, naik level, dan buka achievement baru.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-card/40 border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
            CARA KERJA
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            3 langkah, langsung <span className="text-gradient">ketagihan belajar</span>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative inline-flex w-24 h-24 mb-5 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-xl" />
                  <div className="relative w-24 h-24 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-lg">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-purple text-primary-foreground text-xs font-black">
                    {s.step}
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
