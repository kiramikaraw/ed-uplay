import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Atom, Trophy } from 'lucide-react';

const tracks = [
  { icon: BookOpen, level: 'SD / MI', desc: 'Materi dasar, game ringan, progres ceria', color: 'success' },
  { icon: GraduationCap, level: 'SMP / MTS', desc: 'Eksplorasi mata pelajaran, daily challenge', color: 'secondary' },
  { icon: Atom, level: 'SMA / SMK', desc: 'Jurusan IPA/IPS/SMK, modul mendalam', color: 'purple' },
  { icon: Trophy, level: 'UTBK / TKA', desc: 'Tryout intensif, prediksi skor, pembahasan', color: 'primary' },
];

export function PersonalizedLearningSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple/10 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-purple/10 text-purple font-semibold text-sm mb-4">
              PERSONALIZED LEARNING
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Satu platform, <span className="text-gradient">ribuan jalur belajar</span> berbeda.
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Setelah login, dashboard kamu otomatis berubah sesuai umur, kelas, jurusan, dan
              tujuan. Tidak ada lagi materi yang "tidak relevan".
            </p>
            <div className="space-y-3">
              {[
                'Roadmap belajar otomatis dari sistem',
                'Rekomendasi modul sesuai jurusan & target',
                'Target mingguan personal yang adaptif',
                'Evaluasi otomatis & rekomendasi perbaikan',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tracks.map((t, idx) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.level}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative p-5 rounded-2xl bg-card border border-border/60 hover:border-${t.color}/50 transition-all hover-lift overflow-hidden group`}
                >
                  <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-${t.color}/10 blur-2xl group-hover:bg-${t.color}/20 transition-colors`} />
                  <div className={`relative w-12 h-12 rounded-xl bg-${t.color}/15 flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 text-${t.color}`} />
                  </div>
                  <h4 className="font-black text-lg mb-1">{t.level}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
