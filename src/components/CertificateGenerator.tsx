import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Share2, Trophy, Star, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', title: 'Pemula Hebat', description: 'Menyelesaikan game pertama', icon: '🎮', type: 'bronze' },
  { id: 'streak_7', title: 'Konsisten Seminggu', description: 'Streak belajar 7 hari berturut-turut', icon: '🔥', type: 'silver' },
  { id: 'streak_30', title: 'Master Konsistensi', description: 'Streak belajar 30 hari berturut-turut', icon: '⚡', type: 'gold' },
  { id: 'perfect_score', title: 'Nilai Sempurna', description: 'Mendapat skor 100% dalam quiz', icon: '💯', type: 'silver' },
  { id: 'games_50', title: 'Pelajar Aktif', description: 'Menyelesaikan 50 game', icon: '📚', type: 'gold' },
  { id: 'games_100', title: 'Pelajar Legendaris', description: 'Menyelesaikan 100 game', icon: '🏆', type: 'platinum' },
  { id: 'all_subjects', title: 'Serba Bisa', description: 'Bermain di semua mata pelajaran', icon: '🌟', type: 'gold' },
  { id: 'top_leaderboard', title: 'Juara Kelas', description: 'Mencapai peringkat 1 leaderboard', icon: '👑', type: 'platinum' },
];

const TYPE_COLORS = {
  bronze: { bg: 'from-amber-600 to-amber-800', border: 'border-amber-500', text: 'text-amber-100' },
  silver: { bg: 'from-slate-400 to-slate-600', border: 'border-slate-400', text: 'text-slate-100' },
  gold: { bg: 'from-yellow-400 to-yellow-600', border: 'border-yellow-400', text: 'text-yellow-100' },
  platinum: { bg: 'from-purple-400 to-indigo-600', border: 'border-purple-400', text: 'text-purple-100' },
};

export const CertificateGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [generating, setGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Demo: mark some achievements as earned
  const earnedAchievements = ['first_game', 'streak_7', 'perfect_score'];

  const downloadCertificate = async () => {
    if (!selectedAchievement || !certificateRef.current) return;
    
    setGenerating(true);
    
    try {
      // Use html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `sertifikat-${selectedAchievement.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "Sertifikat Diunduh! 🎉",
        description: "Sertifikat berhasil disimpan",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Gagal Mengunduh",
        description: "Terjadi kesalahan saat membuat sertifikat",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Award className="h-4 w-4" />
          Sertifikat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Generator Sertifikat
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Achievement List */}
          <div>
            <h3 className="font-semibold mb-3">Pilih Achievement</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {ACHIEVEMENTS.map((achievement) => {
                const isEarned = earnedAchievements.includes(achievement.id);
                const colors = TYPE_COLORS[achievement.type];
                
                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => isEarned && setSelectedAchievement(achievement)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAchievement?.id === achievement.id 
                        ? 'border-primary bg-primary/10' 
                        : isEarned 
                          ? 'border-border hover:border-primary/50 bg-card' 
                          : 'border-border/50 bg-muted/30 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{achievement.title}</span>
                          <Badge variant="outline" className={`text-xs ${isEarned ? '' : 'opacity-50'}`}>
                            {achievement.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      {!isEarned && <span className="text-xs text-muted-foreground">🔒</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Certificate Preview */}
          <div>
            <h3 className="font-semibold mb-3">Preview Sertifikat</h3>
            {selectedAchievement ? (
              <div className="space-y-4">
                <div 
                  ref={certificateRef}
                  className={`relative p-8 rounded-2xl bg-gradient-to-br ${TYPE_COLORS[selectedAchievement.type].bg} ${TYPE_COLORS[selectedAchievement.type].border} border-4 aspect-[4/3]`}
                >
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white/30 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white/30 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white/30 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white/30 rounded-br-lg" />
                  
                  <div className={`text-center ${TYPE_COLORS[selectedAchievement.type].text}`}>
                    <div className="flex justify-center mb-2">
                      <Trophy className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">SERTIFIKAT</h2>
                    <p className="text-sm opacity-80 mb-4">Achievement EduPlay</p>
                    
                    <div className="text-6xl mb-4">{selectedAchievement.icon}</div>
                    
                    <h3 className="text-xl font-bold mb-2">{selectedAchievement.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{selectedAchievement.description}</p>
                    
                    <div className="border-t border-white/30 pt-4 mt-4">
                      <p className="text-sm font-medium">Diberikan kepada</p>
                      <p className="text-lg font-bold">{user?.email?.split('@')[0] || 'Pelajar'}</p>
                      <p className="text-xs opacity-70 mt-2">{formatDate()}</p>
                    </div>
                    
                    <div className="flex justify-center gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={downloadCertificate}
                    disabled={generating}
                  >
                    <Download className="h-4 w-4" />
                    {generating ? 'Mengunduh...' : 'Download PNG'}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[300px] rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Pilih achievement untuk melihat sertifikat</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};