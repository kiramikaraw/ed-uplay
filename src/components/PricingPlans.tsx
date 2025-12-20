import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Crown, Users, School, Sparkles, Zap, Star, Shield, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { plans, subscription, isPremium } = useSubscription();
  const { user } = useAuth();
  const { t } = useLanguage();

  const planIcons: Record<string, React.ReactNode> = {
    free: <Zap className="h-8 w-8" />,
    premium: <Crown className="h-8 w-8" />,
    family: <Users className="h-8 w-8" />,
    school: <School className="h-8 w-8" />,
  };

  const planColors: Record<string, string> = {
    free: 'from-slate-500 to-slate-600',
    premium: 'from-amber-500 to-orange-600',
    family: 'from-purple-500 to-pink-600',
    school: 'from-blue-500 to-cyan-600',
  };

  const planFeatures: Record<string, string[]> = {
    free: [
      '5 game per hari',
      '3 chat AI per hari',
      'Akses materi dasar',
      'Leaderboard publik',
    ],
    premium: [
      'Game unlimited',
      'Chat AI unlimited',
      'Bebas iklan',
      'Avatar & tema premium',
      'Power-ups eksklusif',
      'Laporan PDF',
      'Priority support',
    ],
    family: [
      'Semua fitur Premium',
      'Hingga 5 anak',
      'Parental controls lanjutan',
      'Family leaderboard',
      'Laporan mingguan email',
      'Multi-device sync',
    ],
    school: [
      'Semua fitur Premium',
      'Unlimited kelas',
      'Bulk import soal',
      'Analytics lanjutan',
      'Custom branding',
      'API access',
      'Dedicated support',
    ],
  };

  const handleSelectPlan = async (planSlug: string) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    if (planSlug === 'free') {
      toast.info('Kamu sudah menggunakan plan gratis');
      return;
    }

    if (planSlug === 'school') {
      toast.info('Hubungi tim kami untuk plan School: sales@eduplay.id');
      return;
    }

    // For now, show coming soon message since Duitku not integrated yet
    toast.info('Pembayaran akan segera tersedia! Hubungi kami untuk early access.');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Crown className="h-4 w-4 text-amber-500" />
          {isPremium ? 'Kelola Langganan' : 'Upgrade Premium'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Pilih Plan Terbaikmu
          </DialogTitle>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 py-4">
          <span className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>Bulanan</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
            Tahunan
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              Hemat 20%
            </Badge>
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${plan.slug === 'premium' ? 'border-amber-500 border-2 shadow-lg' : ''}`}>
                {plan.slug === 'premium' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500">
                    <Star className="h-3 w-3 mr-1" /> Populer
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${planColors[plan.slug]} flex items-center justify-center text-white mb-2`}>
                    {planIcons[plan.slug]}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.slug === 'school' ? (
                      <span className="text-2xl font-bold">Hubungi Kami</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-foreground">
                          {formatPrice(isYearly ? plan.price_yearly / 12 : plan.price_monthly)}
                        </span>
                        <span className="text-muted-foreground">/bulan</span>
                        {isYearly && plan.price_yearly > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {formatPrice(plan.price_yearly)}/tahun
                          </div>
                        )}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {planFeatures[plan.slug]?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.slug === 'premium' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : ''}`}
                    variant={plan.slug === 'free' ? 'outline' : 'default'}
                    onClick={() => handleSelectPlan(plan.slug)}
                    disabled={subscription?.plan?.slug === plan.slug}
                  >
                    {subscription?.plan?.slug === plan.slug ? (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Plan Aktif
                      </>
                    ) : plan.slug === 'free' ? (
                      'Plan Gratis'
                    ) : plan.slug === 'school' ? (
                      'Hubungi Sales'
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Pilih {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Pembayaran Aman
          </div>
          <div className="flex items-center gap-1">
            <X className="h-4 w-4" />
            Batalkan Kapan Saja
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Aktivasi Instan
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingPlans;
