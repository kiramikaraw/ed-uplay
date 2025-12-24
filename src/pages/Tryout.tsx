import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, FileText, ClipboardList, Award, Clock,
  Users, Trophy, ChevronRight, Lock, Crown, Play, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface TryoutType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  icon: string;
}

interface TryoutPackage {
  id: string;
  tryout_type_id: string;
  title: string;
  description: string | null;
  education_level: string;
  total_questions: number;
  is_premium: boolean;
  is_active: boolean;
}

interface TryoutSession {
  id: string;
  package_id: string;
  status: string;
  total_score: number;
  percentage: number;
  ranking: number | null;
  completed_at: string | null;
}

const iconMap: Record<string, any> = {
  GraduationCap,
  FileText,
  ClipboardList,
  Award
};

export default function Tryout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [types, setTypes] = useState<TryoutType[]>([]);
  const [packages, setPackages] = useState<TryoutPackage[]>([]);
  const [sessions, setSessions] = useState<Record<string, TryoutSession>>({});
  const [selectedType, setSelectedType] = useState<TryoutType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTryoutData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const fetchTryoutData = async () => {
    const [typesRes, packagesRes] = await Promise.all([
      supabase.from('tryout_types').select('*').eq('is_active', true),
      supabase.from('tryout_packages').select('*').eq('is_active', true)
    ]);

    if (typesRes.data) {
      setTypes(typesRes.data);
      if (typesRes.data.length > 0) {
        setSelectedType(typesRes.data[0]);
      }
    }
    if (packagesRes.data) {
      setPackages(packagesRes.data);
    }
    setLoading(false);
  };

  const fetchUserSessions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('tryout_sessions')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      const sessionsMap: Record<string, TryoutSession> = {};
      data.forEach(s => {
        if (!sessionsMap[s.package_id] || s.total_score > sessionsMap[s.package_id].total_score) {
          sessionsMap[s.package_id] = s;
        }
      });
      setSessions(sessionsMap);
    }
  };

  const handleStartTryout = (pkg: TryoutPackage) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/auth?mode=login');
      return;
    }

    if (pkg.is_premium && !isPremium) {
      toast.error('Tryout ini hanya untuk member Premium');
      return;
    }

    navigate(`/tryout/${pkg.id}/start`);
  };

  const filteredPackages = packages.filter(
    p => p.tryout_type_id === selectedType?.id
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Tryout & Simulasi Ujian</h1>
              <p className="text-muted-foreground">
                Latihan ujian dengan soal-soal berkualitas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Type Selector */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {types.map((type) => {
            const IconComponent = iconMap[type.icon] || FileText;
            const isSelected = selectedType?.id === type.id;
            
            return (
              <motion.button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent className={`w-8 h-8 mb-3 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className="font-bold">{type.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {type.duration_minutes} menit
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Type Info */}
        {selectedType && (
          <div className="game-card mb-8">
            <h2 className="text-xl font-bold mb-2">{selectedType.name}</h2>
            <p className="text-muted-foreground">{selectedType.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedType.duration_minutes} menit
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {filteredPackages.length} paket tersedia
              </Badge>
            </div>
          </div>
        )}

        {/* Packages List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const session = sessions[pkg.id];
            const isCompleted = session?.status === 'completed';
            const isLocked = pkg.is_premium && !isPremium;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`relative overflow-hidden ${isLocked ? 'opacity-75' : ''}`}>
                  {pkg.is_premium && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-white px-3 py-1 text-sm font-bold flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Premium
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {pkg.title}
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline">
                        {pkg.total_questions} soal
                      </Badge>
                      <Badge variant="outline">
                        {pkg.education_level.toUpperCase()}
                      </Badge>
                    </div>

                    {isCompleted && session && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Skor Terakhir</span>
                          <span className="font-bold text-lg text-primary">
                            {session.percentage.toFixed(1)}%
                          </span>
                        </div>
                        {session.ranking && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            Ranking #{session.ranking}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleStartTryout(pkg)}
                      disabled={isLocked}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Premium Only
                        </>
                      ) : isCompleted ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Ulangi Tryout
                        </>
                      ) : session?.status === 'in_progress' ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Lanjutkan
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Mulai Tryout
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {filteredPackages.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">Belum Ada Paket Tryout</h3>
              <p className="text-muted-foreground">
                Paket tryout untuk kategori ini akan segera tersedia
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
