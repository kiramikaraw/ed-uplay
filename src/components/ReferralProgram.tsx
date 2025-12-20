import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Users, Gift, Copy, Share2, Trophy, Coins, Crown, Check, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  total_earnings: number;
}

const REFERRAL_MILESTONES = [
  { referrals: 1, reward: 500, label: '500 Coins' },
  { referrals: 5, reward: 3000, label: '3.000 Coins' },
  { referrals: 10, reward: 7500, label: '1 Bulan Premium' },
  { referrals: 25, reward: 20000, label: '3 Bulan Premium' },
  { referrals: 50, reward: 50000, label: '1 Tahun Premium' },
];

const REWARD_PER_REFERRAL = 200;

const ReferralProgram = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      loadReferralData();
    }
  }, [user, isOpen]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'EDU';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const loadReferralData = async () => {
    try {
      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (existingCode) {
        setReferralCode(existingCode);
      } else {
        // Create new referral code
        const newCode = generateCode();
        const { data: newReferral } = await supabase
          .from('referral_codes')
          .insert({
            user_id: user?.id,
            code: newCode,
            uses_count: 0,
            total_earnings: 0,
          })
          .select()
          .single();

        if (newReferral) {
          setReferralCode(newReferral);
        }
      }
    } catch (error) {
      console.error('Error loading referral:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      toast.success('Kode referral disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = async () => {
    const shareData = {
      title: 'Belajar Seru di EduPlay!',
      text: `Yuk belajar sambil bermain di EduPlay! Gunakan kode referral saya: ${referralCode?.code} untuk dapat bonus 500 coins!`,
      url: `https://eduplay.id?ref=${referralCode?.code}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  const getCurrentMilestone = () => {
    const count = referralCode?.uses_count || 0;
    return REFERRAL_MILESTONES.find(m => count < m.referrals) || REFERRAL_MILESTONES[REFERRAL_MILESTONES.length - 1];
  };

  const getProgressToNextMilestone = () => {
    const count = referralCode?.uses_count || 0;
    const currentMilestone = getCurrentMilestone();
    const prevMilestone = REFERRAL_MILESTONES[REFERRAL_MILESTONES.indexOf(currentMilestone!) - 1];
    const prevCount = prevMilestone?.referrals || 0;
    const targetCount = currentMilestone?.referrals || 1;
    return ((count - prevCount) / (targetCount - prevCount)) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-green-500/50 hover:bg-green-500/10">
          <Users className="h-4 w-4 text-green-500" />
          Ajak Teman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-green-500" />
            Program Referral
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Referral Code Card */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2 text-center">Kode Referral Kamu</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={referralCode?.code || ''}
                    readOnly
                    className="text-center text-2xl font-bold tracking-widest"
                  />
                  <Button size="icon" variant="outline" onClick={copyCode}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button className="w-full mt-3 bg-green-500 hover:bg-green-600" onClick={shareReferral}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan ke Teman
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{referralCode?.uses_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Teman Diundang</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Coins className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold">{referralCode?.total_earnings || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Coins</p>
                </CardContent>
              </Card>
            </div>

            {/* Rewards Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Hadiah Referral
                </CardTitle>
                <CardDescription>
                  Dapat {REWARD_PER_REFERRAL} coins untuk setiap teman yang bergabung!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progress to next milestone */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress ke milestone berikutnya</span>
                    <span className="font-semibold">{getCurrentMilestone()?.label}</span>
                  </div>
                  <Progress value={getProgressToNextMilestone()} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {referralCode?.uses_count || 0} / {getCurrentMilestone()?.referrals} referral
                  </p>
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                  {REFERRAL_MILESTONES.map((milestone, index) => {
                    const achieved = (referralCode?.uses_count || 0) >= milestone.referrals;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          achieved ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {achieved ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className="text-sm">{milestone.referrals} Referral</span>
                        </div>
                        <Badge variant={achieved ? 'default' : 'secondary'} className={achieved ? 'bg-green-500' : ''}>
                          {milestone.referrals >= 10 ? (
                            <Crown className="h-3 w-3 mr-1" />
                          ) : (
                            <Coins className="h-3 w-3 mr-1" />
                          )}
                          {milestone.label}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cara Kerja</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>1. Bagikan kode referral kamu ke teman</p>
                <p>2. Teman daftar dengan kode kamu</p>
                <p>3. Kalian berdua dapat {REWARD_PER_REFERRAL} coins!</p>
                <p>4. Kumpulkan referral untuk hadiah spesial</p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReferralProgram;
