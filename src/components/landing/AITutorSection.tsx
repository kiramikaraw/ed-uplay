import { motion } from 'framer-motion';
import { Brain, Send } from 'lucide-react';

export function AITutorSection() {
  return (
    <section className="py-20 bg-card/40 border-y border-border/40 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Chat mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="relative max-w-md mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple/30 to-primary/30 rounded-3xl blur-2xl opacity-60" />
              <div className="relative rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-primary flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Eduverse AI Tutor</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-xs text-success">Online — adaptif jenjang kamu</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3 min-h-[280px]">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-sm">
                      Apa itu subnetting? (kelas 11 SMK TKJ)
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-muted text-foreground text-sm">
                      Subnetting adalah teknik membagi 1 jaringan besar jadi beberapa
                      sub-jaringan lebih kecil. Tujuannya: hemat IP, atur lalu lintas, dan
                      tingkatkan keamanan. Mau aku jelaskan dengan contoh CIDR /24?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-sm">
                      Iya, kasih contoh dong
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-tl-sm bg-muted">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 border-t border-border/50">
                  <div className="flex-1 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
                    Tanya apa saja...
                  </div>
                  <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <Send className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1 rounded-full bg-purple/10 text-purple font-semibold text-sm mb-4">
              AI STUDY ASSISTANT
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              AI tutor yang <span className="text-gradient">ngerti level kamu</span>.
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Tanya apa saja — integral, subnetting, jurnal umum, tata bahasa. AI akan menyesuaikan
              gaya penjelasan dengan jenjang pendidikan kamu.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: 'SD', desc: 'Bahasa sederhana, banyak contoh', color: 'success' },
                { label: 'SMP–SMA', desc: 'Detail konsep & rumus', color: 'secondary' },
                { label: 'UTBK', desc: 'Strategi & shortcut soal', color: 'primary' },
              ].map((x) => (
                <div key={x.label} className={`p-4 rounded-xl bg-card border border-${x.color}/30`}>
                  <div className={`text-xs font-bold text-${x.color} mb-1`}>{x.label}</div>
                  <div className="text-xs text-muted-foreground">{x.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
