import { motion } from 'framer-motion';
import { Coins, BarChart3, Upload, Users2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GameButton } from '@/components/ui/game-button';

export function CreatorPlatformSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-warning/10 rounded-full blur-[140px]" />
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-warning/10 text-warning font-semibold text-sm mb-4">
              UNTUK EDU CREATOR
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Jadilah <span className="text-gradient">Edu Creator</span>.<br />
              Bagikan ilmu, dapat penghasilan.
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Upload kelas premium, tryout, atau modul tambahan. Kamu dapat bagian dari setiap
              pembelian dengan sistem revenue sharing yang transparan.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Upload, label: 'Upload kelas & tryout' },
                { icon: Users2, label: 'Bangun komunitas siswa' },
                { icon: Coins, label: 'Revenue sharing transparan' },
                { icon: BarChart3, label: 'Dashboard analytics' },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/60">
                    <div className="w-9 h-9 rounded-lg bg-warning/15 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-warning" />
                    </div>
                    <span className="text-sm font-medium">{f.label}</span>
                  </div>
                );
              })}
            </div>

            <Link to="/auth?mode=signup&role=teacher">
              <GameButton variant="primary" size="lg">
                Mulai jadi Creator <ArrowRight className="w-4 h-4" />
              </GameButton>
            </Link>
          </div>

          {/* Creator stats mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-warning/30 to-primary/20 rounded-3xl blur-3xl opacity-50" />
            <div className="relative rounded-3xl bg-card border border-border/60 shadow-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs text-muted-foreground">Creator Dashboard</div>
                  <div className="font-bold">Pak Budi · Matematika SMA</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-success/15 text-success text-xs font-bold">
                  ⭐ 4.9
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-warning/15 to-warning/5 border border-warning/20">
                  <div className="text-xs text-muted-foreground mb-1">Penghasilan Bulan Ini</div>
                  <div className="text-2xl font-black text-warning">Rp 8.4jt</div>
                  <div className="text-[10px] text-success">↑ 23% vs bulan lalu</div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Total Siswa</div>
                  <div className="text-2xl font-black text-primary">1,247</div>
                  <div className="text-[10px] text-success">↑ 84 minggu ini</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Kelas Top Performing</div>
                {[
                  { name: 'Integral & Turunan UTBK', sales: 312, rev: 'Rp 3.1jt' },
                  { name: 'Trigonometri SMA Kelas 11', sales: 198, rev: 'Rp 1.9jt' },
                  { name: 'Statistika Dasar', sales: 156, rev: 'Rp 1.5jt' },
                ].map((c) => (
                  <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm">
                    <div>
                      <div className="font-semibold text-xs">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.sales} siswa</div>
                    </div>
                    <div className="text-xs font-bold text-warning">{c.rev}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
