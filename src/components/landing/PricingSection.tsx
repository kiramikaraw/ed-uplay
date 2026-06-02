import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GameButton } from '@/components/ui/game-button';

type Tier = 'SD' | 'SMP' | 'SMA/SMK' | 'UTBK';

const pricing: Record<Tier, { free: string[]; premium: { price: string; features: string[] } }> = {
  SD: {
    free: ['3 bab pertama tiap mapel', 'Basic quiz & game', 'AI tutor 10 pertanyaan/hari'],
    premium: {
      price: '29.000',
      features: ['Semua modul SD', 'AI tutor unlimited', 'Game premium', 'Daily challenge premium', 'Sertifikat'],
    },
  },
  SMP: {
    free: ['3 bab pertama tiap mapel', 'Basic quiz & game', 'AI tutor 10 pertanyaan/hari'],
    premium: {
      price: '49.000',
      features: ['Semua modul SMP', 'AI tutor unlimited', 'Battle mode', 'Leaderboard penuh', 'Sertifikat'],
    },
  },
  'SMA/SMK': {
    free: ['3 bab pertama tiap mapel', 'Basic quiz', 'AI tutor 10 pertanyaan/hari'],
    premium: {
      price: '79.000',
      features: ['Semua modul SMA/SMK', 'AI tutor unlimited', 'Battle mode + tryout', 'Pembahasan video', 'Sertifikat'],
    },
  },
  UTBK: {
    free: ['1 tryout gratis', 'Pembahasan terbatas', 'AI tutor 10 pertanyaan/hari'],
    premium: {
      price: '149.000',
      features: ['Tryout UTBK unlimited', 'Prediksi skor IRT', 'Pembahasan video lengkap', 'AI strategi soal', 'Sertifikat'],
    },
  },
};

const tiers: Tier[] = ['SD', 'SMP', 'SMA/SMK', 'UTBK'];

export function PricingSection() {
  const [tier, setTier] = useState<Tier>('SMA/SMK');
  const plan = pricing[tier];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[140px]" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
            HARGA
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Bayar sesuai <span className="text-gradient">jenjang</span> kamu.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mulai gratis, upgrade kapan saja. Setiap jenjang punya harga & fitur yang pas.
          </p>
        </div>

        {/* Tier switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-2xl bg-card border border-border/60">
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  tier === t
                    ? 'bg-gradient-to-r from-primary to-purple text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <motion.div
            key={`free-${tier}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-card border border-border/60"
          >
            <div className="text-sm font-semibold text-muted-foreground mb-2">Gratis</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black">Rp 0</span>
              <span className="text-muted-foreground">/selamanya</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.free.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth?mode=signup&role=student">
              <GameButton variant="outline" className="w-full">Mulai Gratis</GameButton>
            </Link>
          </motion.div>

          {/* Premium */}
          <motion.div
            key={`prem-${tier}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-purple/5 to-secondary/10 border-2 border-primary/40 overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-purple text-primary-foreground text-xs font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> POPULAR
            </div>
            <div className="relative">
              <div className="text-sm font-semibold text-primary mb-2">Premium {tier}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-gradient">Rp {plan.premium.price}</span>
                <span className="text-muted-foreground">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.premium.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup&role=student">
                <GameButton variant="primary" className="w-full">Upgrade ke Premium</GameButton>
              </Link>
            </div>
          </motion.div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Tanpa kontrak. Cancel kapan saja. Diskon tahunan tersedia di dalam aplikasi.
        </p>
      </div>
    </section>
  );
}
