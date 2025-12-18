import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GameButton } from '@/components/ui/game-button';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { Brain, Hand, Grid3X3, Puzzle, GraduationCap, Users, Sparkles, Star, Trophy, Rocket } from 'lucide-react';

export default function Index() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">🎮</span>
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EduPlay
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/dashboard">
                <GameButton variant="ghost" size="sm">Dashboard</GameButton>
              </Link>
              <Link to="/subjects">
                <GameButton variant="ghost" size="sm">Mata Pelajaran</GameButton>
              </Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <MascotMessage 
              message={`Selamat datang kembali! Siap untuk belajar hari ini?`} 
              mood="excited" 
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/subjects" className="game-card group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Mulai Belajar</h3>
                  <p className="text-muted-foreground">Pilih mata pelajaran favoritmu</p>
                </div>
              </div>
              <GameButton variant="primary" className="w-full">
                Lihat Mata Pelajaran →
              </GameButton>
            </Link>

            <Link to="/dashboard" className="game-card group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Progress Kamu</h3>
                  <p className="text-muted-foreground">Lihat pencapaian dan badge</p>
                </div>
              </div>
              <GameButton variant="secondary" className="w-full">
                Buka Dashboard →
              </GameButton>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduPlay
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/auth?mode=login">
              <GameButton variant="ghost" size="sm">Masuk</GameButton>
            </Link>
            <Link to="/auth?mode=signup">
              <GameButton variant="primary" size="sm">Daftar Gratis</GameButton>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">Platform Edukasi Interaktif #1</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  Belajar Jadi{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Seru & Menyenangkan!
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                  Game edukasi interaktif untuk SD, SMP, dan SMA. Belajar sambil bermain dengan 
                  quiz, puzzle, memory game, dan masih banyak lagi!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/auth?mode=signup&role=student">
                    <GameButton variant="primary" size="lg" className="w-full sm:w-auto">
                      <GraduationCap className="w-5 h-5" />
                      Daftar sebagai Siswa
                    </GameButton>
                  </Link>
                  <Link to="/auth?mode=signup&role=teacher">
                    <GameButton variant="outline" size="lg" className="w-full sm:w-auto">
                      <Users className="w-5 h-5" />
                      Daftar sebagai Guru
                    </GameButton>
                  </Link>
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
                <div className="relative z-10 flex justify-center">
                  <Mascot size="xl" mood="celebrating" />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 p-4 bg-card rounded-2xl shadow-lg float-animation" style={{ animationDelay: '0s' }}>
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute top-20 right-10 p-4 bg-card rounded-2xl shadow-lg float-animation" style={{ animationDelay: '0.5s' }}>
                  <Puzzle className="w-8 h-8 text-purple" />
                </div>
                <div className="absolute bottom-20 left-20 p-4 bg-card rounded-2xl shadow-lg float-animation" style={{ animationDelay: '1s' }}>
                  <Star className="w-8 h-8 text-accent" />
                </div>
                <div className="absolute bottom-10 right-20 p-4 bg-card rounded-2xl shadow-lg float-animation" style={{ animationDelay: '1.5s' }}>
                  <Trophy className="w-8 h-8 text-warning" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Game Types */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                4 Jenis Game Seru! 🎯
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Berbagai jenis game interaktif yang dirancang untuk membuat belajar tidak membosankan
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="game-card text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Quiz</h3>
                <p className="text-muted-foreground text-sm">
                  Jawab pertanyaan dengan cepat dan tepat. Ada timer dan poin!
                </p>
              </div>
              
              <div className="game-card text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Hand className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Drag & Drop</h3>
                <p className="text-muted-foreground text-sm">
                  Susun, cocokkan, dan kelompokkan item dengan cara yang menyenangkan
                </p>
              </div>
              
              <div className="game-card text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-purple/10 flex items-center justify-center">
                  <Grid3X3 className="w-10 h-10 text-purple" />
                </div>
                <h3 className="font-bold text-xl mb-2">Memory Game</h3>
                <p className="text-muted-foreground text-sm">
                  Latih ingatan dengan mencocokkan kartu yang berpasangan
                </p>
              </div>
              
              <div className="game-card text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-orange/10 flex items-center justify-center">
                  <Puzzle className="w-10 h-10 text-orange" />
                </div>
                <h3 className="font-bold text-xl mb-2">Puzzle</h3>
                <p className="text-muted-foreground text-sm">
                  Susun gambar dan pecahkan teka-teki yang menantang
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Kenapa Pilih EduPlay? 🚀
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Soal AI-Generated</h3>
                      <p className="text-muted-foreground">
                        Soal dibuat otomatis oleh AI sesuai dengan kurikulum dan tingkat kesulitan
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Gamifikasi Lengkap</h3>
                      <p className="text-muted-foreground">
                        Kumpulkan badge, naik level, dan bersaing di leaderboard
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Dashboard Guru</h3>
                      <p className="text-muted-foreground">
                        Guru bisa memantau progress siswa dan memberikan tugas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-card rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                      🦊
                    </div>
                    <div>
                      <p className="font-bold">Foxy si Maskot</p>
                      <p className="text-sm text-muted-foreground">Teman belajarmu!</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted rounded-xl">
                      <span>🏆 Badge Dikumpulkan</span>
                      <span className="font-bold">24</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted rounded-xl">
                      <span>⭐ Total Poin</span>
                      <span className="font-bold">12,450</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted rounded-xl">
                      <span>📚 Game Selesai</span>
                      <span className="font-bold">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-purple/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Mulai Belajar? 📚
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Daftar sekarang dan mulai petualangan belajarmu. Gratis untuk semua siswa!
            </p>
            <Link to="/auth?mode=signup">
              <GameButton variant="primary" size="xl">
                <Sparkles className="w-6 h-6" />
                Mulai Sekarang - Gratis!
              </GameButton>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 EduPlay. Belajar Sambil Bermain! 🎮</p>
        </div>
      </footer>
    </div>
  );
}
