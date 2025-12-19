import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import { BadgeGrid } from '@/components/BadgeDisplay';
import {
  Trophy, Star, BookOpen, Target, LogOut, Settings, 
  Brain, Flame, Clock, TrendingUp, Users, FileText 
} from 'lucide-react';
import { JoinClass } from '@/components/JoinClass';
import { ClassLeaderboard } from '@/components/ClassLeaderboard';
import { AssignmentNotifications } from '@/components/AssignmentNotifications';
import { AchievementSystem } from '@/components/AchievementSystem';
import { DiscussionForum } from '@/components/DiscussionForum';
import { DailyChallenge } from '@/components/DailyChallenge';
import { StudyGroups } from '@/components/StudyGroups';
import { AITutor } from '@/components/AITutor';
import { LearningStreak } from '@/components/LearningStreak';
import { FocusTimer } from '@/components/FocusTimer';
import { QuizBattle } from '@/components/QuizBattle';
import { GlobalLeaderboard } from '@/components/GlobalLeaderboard';
import { BattleNotifications } from '@/components/BattleNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VoiceNotes } from '@/components/VoiceNotes';
import { WeeklyProgressChart } from '@/components/WeeklyProgressChart';
import { RewardShop } from '@/components/RewardShop';
import { RealtimeQuizBattle } from '@/components/RealtimeQuizBattle';
import { LevelProgression } from '@/components/LevelProgression';
import { FlashcardSystem } from '@/components/FlashcardSystem';
import { MiniGames } from '@/components/MiniGames';
import { DailyQuests } from '@/components/DailyQuests';
import NotificationCenter from '@/components/NotificationCenter';
import SearchFilter from '@/components/SearchFilter';
import ContentBookmarks from '@/components/ContentBookmarks';
import StudentAnalyticsReport from '@/components/StudentAnalyticsReport';
import StudyCalendar from '@/components/StudyCalendar';

interface ProfileData {
  full_name: string;
  avatar_url: string | null;
  education_level: string | null;
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function Dashboard() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalScore: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
    // Redirect teachers to teacher dashboard
    if (!authLoading && user && role === 'teacher') {
      navigate('/teacher');
    }
    // Redirect parents to parent dashboard
    if (!authLoading && user && role === 'parent') {
      navigate('/parent');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, education_level')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*');

      if (allBadges) {
        setBadges(allBadges);
      }

      // Fetch earned badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      if (userBadges) {
        setEarnedBadges(userBadges.map(b => b.badge_id));
      }

      // Fetch game stats
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('score, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (sessions) {
        setStats({
          totalGames: sessions.length,
          totalScore: sessions.reduce((sum, s) => sum + (s.score || 0), 0),
          streak: 0, // Would need more complex logic for streak
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const educationLevelLabels: Record<string, string> = {
    sd: 'SD',
    smp: 'SMP',
    sma: 'SMA',
  };

  // Sample leaderboard data
  const leaderboardData = [
    { rank: 1, name: 'Ahmad', score: 15000 },
    { rank: 2, name: 'Siti', score: 14500 },
    { rank: 3, name: 'Budi', score: 14000 },
    { rank: 4, name: profile?.full_name || 'Kamu', score: stats.totalScore, isCurrentUser: true },
    { rank: 5, name: 'Dewi', score: 12000 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduPlay
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <SearchFilter />
            <NotificationCenter />
            <ThemeToggle />
            <JoinClass onClassJoined={fetchDashboardData} />
            <Link to="/subjects">
              <GameButton variant="ghost" size="sm">
                <BookOpen className="w-4 h-4" />
                Mata Pelajaran
              </GameButton>
            </Link>
            <Link to="/settings">
              <GameButton variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </GameButton>
            </Link>
            <GameButton variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Keluar
            </GameButton>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <MascotMessage 
            message={`Halo ${profile?.full_name || 'Teman'}! Siap belajar hari ini?`}
            mood="happy"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalScore.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Poin</p>
              </div>
            </div>
          </div>

          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
                <p className="text-sm text-muted-foreground">Game Selesai</p>
              </div>
            </div>
          </div>

          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-sm text-muted-foreground">Hari Streak</p>
              </div>
            </div>
          </div>

          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{earnedBadges.length}</p>
                <p className="text-sm text-muted-foreground">Badge</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="game-card">
              <h2 className="font-bold text-xl mb-4">Mulai Belajar 🚀</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/subjects" className="block">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors">
                    <BookOpen className="w-8 h-8 text-primary mb-2" />
                    <h3 className="font-bold">Pilih Mata Pelajaran</h3>
                    <p className="text-sm text-muted-foreground">Belajar sesuai kurikulum</p>
                  </div>
                </Link>
                <Link to="/subjects" className="block">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:border-secondary/40 transition-colors">
                    <Target className="w-8 h-8 text-secondary mb-2" />
                    <h3 className="font-bold">Latihan Cepat</h3>
                    <p className="text-sm text-muted-foreground">Quiz random 10 soal</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Battle Options */}
            {/* Mode Battle & Tools */}
            <div className="game-card">
              <h2 className="font-bold text-xl mb-4">Mode Battle & Tools ⚔️</h2>
              <div className="flex flex-wrap gap-3">
                <QuizBattle />
                <RealtimeQuizBattle />
                <RewardShop />
                <FlashcardSystem />
                <MiniGames />
              </div>
            </div>

            {/* Weekly Progress */}
            <WeeklyProgressChart />

            {/* Focus Timer */}
            <FocusTimer />

            {/* Achievements */}
            <AchievementSystem />

            {/* Discussion Forum */}
            <DiscussionForum />

            {/* Progress by Subject - Placeholder */}
            <div className="game-card">
              <h2 className="font-bold text-xl mb-4">Progress Belajar 📈</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Matematika</span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <ProgressBar value={45} showLabel={false} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Bahasa Indonesia</span>
                    <span className="text-sm text-muted-foreground">30%</span>
                  </div>
                  <ProgressBar value={30} showLabel={false} variant="success" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">IPA</span>
                    <span className="text-sm text-muted-foreground">60%</span>
                  </div>
                  <ProgressBar value={60} showLabel={false} variant="warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="game-card text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl mb-4">
                {profile?.full_name?.charAt(0).toUpperCase() || '🦊'}
              </div>
              <h3 className="font-bold text-xl">{profile?.full_name || 'User'}</h3>
              <p className="text-muted-foreground">
                {role === 'teacher' ? 'Guru' : 'Siswa'} 
                {profile?.education_level && ` - ${educationLevelLabels[profile.education_level]}`}
              </p>
              <div className="mt-4 p-3 rounded-xl bg-muted">
                <p className="text-sm">
                  Level: <span className="font-bold text-primary">Penjelajah</span>
                </p>
              </div>
            </div>

            {/* Level Progression */}
            <LevelProgression />

            {/* Learning Streak */}
            <LearningStreak />

            {/* Daily Challenge */}
            <DailyChallenge />

            {/* Daily Quests */}
            <DailyQuests />

            {/* Assignment Notifications */}
            <AssignmentNotifications />

            {/* Study Groups */}
            <StudyGroups />

            {/* Voice Notes */}
            <VoiceNotes />

            {/* Bookmarks */}
            <ContentBookmarks />

            {/* Study Calendar */}
            <StudyCalendar />

            {/* Student Analytics */}
            <StudentAnalyticsReport />

            {/* Class Leaderboard */}
            <ClassLeaderboard />

            {/* Global Leaderboard with Rewards */}
            <GlobalLeaderboard />
          </div>
        </div>

        {/* Battle Notifications (Background) */}
        <BattleNotifications />

        {/* AI Tutor Floating Button */}
        <AITutor 
          subject={undefined} 
          educationLevel={profile?.education_level || undefined} 
        />
      </main>
    </div>
  );
}
