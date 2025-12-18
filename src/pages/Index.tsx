import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GameButton } from '@/components/ui/game-button';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { 
  Brain, Hand, Grid3X3, Puzzle, GraduationCap, Users, Sparkles, Star, Trophy, Rocket,
  CheckCircle, Zap, Shield, BookOpen, Target, Award, ChevronRight, Play
} from 'lucide-react';

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
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduPlay
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
            <a href="#games" className="text-muted-foreground hover:text-foreground transition-colors">Game</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimoni</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=login">
              <GameButton variant="ghost" size="sm">Masuk</GameButton>
            </Link>
            <Link to="/auth?mode=signup">
              <GameButton variant="primary" size="sm">Daftar Gratis</GameButton>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px]" />
          
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground mb-6 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Platform Edukasi Interaktif #1 di Indonesia</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  Belajar Jadi{' '}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-primary via-purple to-secondary bg-clip-text text-transparent">
                      Seru & Menyenangkan!
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                      <path d="M2 10C50 4 150 4 298 10" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                  Game edukasi interaktif untuk SD, SMP, dan SMA. Belajar sambil bermain dengan 
                  quiz, puzzle, memory game, dan masih banyak lagi!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link to="/auth?mode=signup&role=student">
                    <GameButton variant="primary" size="lg" className="w-full sm:w-auto group">
                      <GraduationCap className="w-5 h-5" />
                      Mulai Belajar Gratis
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </GameButton>
                  </Link>
                  <Link to="/auth?mode=signup&role=teacher">
                    <GameButton variant="outline" size="lg" className="w-full sm:w-auto">
                      <Users className="w-5 h-5" />
                      Daftar sebagai Guru
                    </GameButton>
                  </Link>
                </div>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>100% Gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-info" />
                    <span>Aman untuk Anak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="relative z-10 flex justify-center">
                  <div className="relative">
                    <Mascot size="xl" mood="celebrating" />
                    <div className="absolute -top-4 -right-4 bg-card rounded-full p-3 shadow-xl animate-bounce">
                      <span className="text-2xl">🎉</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 p-4 bg-card rounded-2xl shadow-xl float-animation border border-border" style={{ animationDelay: '0s' }}>
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute top-20 right-10 p-4 bg-card rounded-2xl shadow-xl float-animation border border-border" style={{ animationDelay: '0.5s' }}>
                  <Puzzle className="w-8 h-8 text-purple" />
                </div>
                <div className="absolute bottom-32 left-5 p-4 bg-card rounded-2xl shadow-xl float-animation border border-border" style={{ animationDelay: '1s' }}>
                  <Star className="w-8 h-8 text-accent" />
                </div>
                <div className="absolute bottom-10 right-20 p-4 bg-card rounded-2xl shadow-xl float-animation border border-border" style={{ animationDelay: '1.5s' }}>
                  <Trophy className="w-8 h-8 text-warning" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">10K+</div>
                <div className="text-muted-foreground font-medium">Siswa Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-secondary mb-2">500+</div>
                <div className="text-muted-foreground font-medium">Guru Terdaftar</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-purple mb-2">5K+</div>
                <div className="text-muted-foreground font-medium">Game Dimainkan</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-success mb-2">98%</div>
                <div className="text-muted-foreground font-medium">Tingkat Kepuasan</div>
              </div>
            </div>
          </div>
        </section>

        {/* Game Types */}
        <section id="games" className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
                JENIS GAME
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                4 Jenis Game Seru! 🎯
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Berbagai jenis game interaktif yang dirancang untuk membuat belajar tidak membosankan
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="game-card text-center group hover:border-primary/50 border-2 border-transparent transition-all">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Quiz</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Jawab pertanyaan dengan cepat dan tepat. Ada timer dan poin!
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-primary font-semibold">
                  <Play className="w-4 h-4" />
                  <span>Paling Populer</span>
                </div>
              </div>
              
              <div className="game-card text-center group hover:border-secondary/50 border-2 border-transparent transition-all">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Hand className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Drag & Drop</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Susun, cocokkan, dan kelompokkan item dengan cara yang menyenangkan
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-secondary font-semibold">
                  <Target className="w-4 h-4" />
                  <span>Interaktif</span>
                </div>
              </div>
              
              <div className="game-card text-center group hover:border-purple/50 border-2 border-transparent transition-all">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple/20 to-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Grid3X3 className="w-10 h-10 text-purple" />
                </div>
                <h3 className="font-bold text-xl mb-2">Memory Game</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Latih ingatan dengan mencocokkan kartu yang berpasangan
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-purple font-semibold">
                  <Brain className="w-4 h-4" />
                  <span>Asah Otak</span>
                </div>
              </div>
              
              <div className="game-card text-center group hover:border-orange/50 border-2 border-transparent transition-all">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange/20 to-orange/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Puzzle className="w-10 h-10 text-orange" />
                </div>
                <h3 className="font-bold text-xl mb-2">Puzzle</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Susun gambar dan pecahkan teka-teki yang menantang
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-orange font-semibold">
                  <Award className="w-4 h-4" />
                  <span>Menantang</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
                FITUR UNGGULAN
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Kenapa Pilih EduPlay? 🚀
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Platform belajar yang didesain khusus untuk membuat pendidikan lebih menyenangkan
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Rocket className="w-7 h-7 text-success" />
                </div>
                <h3 className="font-bold text-xl mb-2">Soal AI-Generated</h3>
                <p className="text-muted-foreground">
                  Soal dibuat otomatis oleh AI sesuai dengan kurikulum dan tingkat kesulitan yang dipersonalisasi
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Gamifikasi Lengkap</h3>
                <p className="text-muted-foreground">
                  Kumpulkan badge, naik level, dan bersaing di leaderboard untuk motivasi belajar maksimal
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Dashboard Guru</h3>
                <p className="text-muted-foreground">
                  Guru bisa memantau progress siswa, memberikan tugas, dan melihat laporan lengkap
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple/20 to-purple/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-purple" />
                </div>
                <h3 className="font-bold text-xl mb-2">Kurikulum Lengkap</h3>
                <p className="text-muted-foreground">
                  Mencakup semua mata pelajaran dari SD hingga SMA sesuai kurikulum nasional
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-warning" />
                </div>
                <h3 className="font-bold text-xl mb-2">Daily Challenge</h3>
                <p className="text-muted-foreground">
                  Tantangan harian dengan bonus poin untuk menjaga konsistensi belajar setiap hari
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-info/20 to-info/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-info" />
                </div>
                <h3 className="font-bold text-xl mb-2">Parent Dashboard</h3>
                <p className="text-muted-foreground">
                  Orang tua bisa memantau progress anak dengan dashboard khusus yang informatif
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-purple/10 text-purple font-semibold text-sm mb-4">
                TESTIMONI
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Apa Kata Mereka? 💬
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Dengarkan pengalaman dari pengguna EduPlay
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-6">
                  "Anak saya jadi lebih semangat belajar sejak pakai EduPlay. Game-nya seru dan bikin dia ketagihan belajar!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
                    👩
                  </div>
                  <div>
                    <p className="font-bold">Ibu Sari</p>
                    <p className="text-sm text-muted-foreground">Orang Tua Siswa SD</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-6">
                  "Dashboard guru sangat membantu saya memantau progress siswa. Fitur bulk assign sangat menghemat waktu!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-purple flex items-center justify-center text-xl">
                    👨‍🏫
                  </div>
                  <div>
                    <p className="font-bold">Pak Budi</p>
                    <p className="text-sm text-muted-foreground">Guru SMP</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-6">
                  "Belajar jadi nggak boring! Aku suka banget sama memory game-nya. Nilai ulangan juga naik!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple to-primary flex items-center justify-center text-xl">
                    👧
                  </div>
                  <div>
                    <p className="font-bold">Rina</p>
                    <p className="text-sm text-muted-foreground">Siswa Kelas 5 SD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple/10 to-secondary/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
          
          <div className="container mx-auto px-4 relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
              <span className="text-2xl">🎮</span>
              <span className="font-semibold">Bergabung dengan 10,000+ Siswa</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Siap Mulai Petualangan<br />
              <span className="bg-gradient-to-r from-primary via-purple to-secondary bg-clip-text text-transparent">
                Belajarmu?
              </span>
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg">
              Daftar sekarang dan mulai belajar dengan cara yang menyenangkan. 
              100% gratis untuk semua siswa!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <GameButton variant="primary" size="xl" className="group">
                  <Sparkles className="w-6 h-6" />
                  Mulai Sekarang - Gratis!
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </GameButton>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Tidak perlu kartu kredit • Langsung bisa digunakan
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎮</span>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  EduPlay
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Platform edukasi interaktif untuk membuat belajar jadi menyenangkan.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fitur</a></li>
                <li><a href="#games" className="hover:text-foreground transition-colors">Jenis Game</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimoni</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Untuk Pengguna</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth?mode=signup&role=student" className="hover:text-foreground transition-colors">Daftar Siswa</Link></li>
                <li><Link to="/auth?mode=signup&role=teacher" className="hover:text-foreground transition-colors">Daftar Guru</Link></li>
                <li><Link to="/auth?mode=signup&role=parent" className="hover:text-foreground transition-colors">Daftar Orang Tua</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@eduplay.id</li>
                <li>+62 812 3456 7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>© 2024 EduPlay. Belajar Sambil Bermain! 🎮</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
