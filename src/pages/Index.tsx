import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GameButton } from '@/components/ui/game-button';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { FuturisticLogo } from '@/components/FuturisticLogo';
import { 
  Brain, Hand, Grid3X3, Puzzle, GraduationCap, Users, Sparkles, Star, Trophy, Rocket,
  CheckCircle, Zap, Shield, BookOpen, Target, Award, ChevronRight, Play, Video, FileText, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

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
            <Link to="/">
              <FuturisticLogo size="md" />
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/dashboard">
                <GameButton variant="ghost" size="sm">Dashboard</GameButton>
              </Link>
              <Link to="/subjects">
                <GameButton variant="ghost" size="sm">Mata Pelajaran</GameButton>
              </Link>
              <Link to="/curriculum">
                <GameButton variant="ghost" size="sm">Kurikulum</GameButton>
              </Link>
              <Link to="/tryout">
                <GameButton variant="ghost" size="sm">Tryout</GameButton>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/subjects" className="game-card group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Mulai Belajar</h3>
                  <p className="text-muted-foreground">Pilih mata pelajaran</p>
                </div>
              </div>
              <GameButton variant="primary" className="w-full">
                Lihat Mata Pelajaran →
              </GameButton>
            </Link>

            <Link to="/curriculum" className="game-card group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Learning Path</h3>
                  <p className="text-muted-foreground">Jalur belajar terstruktur</p>
                </div>
              </div>
              <GameButton variant="secondary" className="w-full">
                Lihat Kurikulum →
              </GameButton>
            </Link>

            <Link to="/tryout" className="game-card group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-purple/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-purple" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Tryout UTBK</h3>
                  <p className="text-muted-foreground">Simulasi ujian lengkap</p>
                </div>
              </div>
              <GameButton variant="outline" className="w-full">
                Mulai Tryout →
              </GameButton>
            </Link>

            <Link to="/dashboard" className="game-card group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-orange" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Progress Kamu</h3>
                  <p className="text-muted-foreground">Lihat pencapaian</p>
                </div>
              </div>
              <GameButton variant="outline" className="w-full">
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
          <Link to="/">
            <FuturisticLogo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
            <a href="#games" className="text-muted-foreground hover:text-foreground transition-colors">Game</a>
            <a href="#platform" className="text-muted-foreground hover:text-foreground transition-colors">Platform</a>
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
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple/5 rounded-full blur-[150px]" />
            
            {/* Floating Orbs */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-32 left-[15%] w-4 h-4 bg-primary rounded-full opacity-60"
            />
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-48 right-[20%] w-6 h-6 bg-secondary rounded-full opacity-40"
            />
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-40 left-[25%] w-3 h-3 bg-purple rounded-full opacity-50"
            />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground mb-6 border border-primary/20"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Platform Edukasi Interaktif #1 di Indonesia</span>
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  Jelajahi{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-purple to-secondary bg-clip-text text-transparent">
                      Universe
                    </span>
                  </span>
                  {' '}Pembelajaran
                  <br />
                  <span className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground">
                    dengan Cara Baru!
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                  Video learning, tryout UTBK, game edukatif, dan AI tutor dalam satu platform. 
                  Belajar jadi lebih seru dan efektif!
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
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative hidden lg:block"
              >
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Logo Display */}
                <div className="relative z-10 flex justify-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <img src="/eduverse-logo.svg" alt="Eduverse" className="w-80 h-80 drop-shadow-2xl" />
                  </motion.div>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 p-4 bg-card rounded-2xl shadow-xl border border-border"
                >
                  <Video className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-20 right-10 p-4 bg-card rounded-2xl shadow-xl border border-border"
                >
                  <FileText className="w-8 h-8 text-secondary" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-32 left-5 p-4 bg-card rounded-2xl shadow-xl border border-border"
                >
                  <Brain className="w-8 h-8 text-purple" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute bottom-10 right-20 p-4 bg-card rounded-2xl shadow-xl border border-border"
                >
                  <Trophy className="w-8 h-8 text-warning" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '50K+', label: 'Siswa Aktif', color: 'text-primary' },
                { value: '1000+', label: 'Video Pembelajaran', color: 'text-secondary' },
                { value: '100+', label: 'Tryout UTBK', color: 'text-purple' },
                { value: '98%', label: 'Tingkat Kepuasan', color: 'text-success' },
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className={`text-3xl md:text-4xl font-black ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section id="platform" className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-purple/10 text-purple font-semibold text-sm mb-4">
                PLATFORM LENGKAP
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Semua yang Kamu Butuhkan 🚀
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Dari video learning hingga simulasi UTBK, semua ada di Eduverse
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Video className="w-10 h-10" />,
                  title: 'Video Learning',
                  description: 'Ribuan video pembelajaran berkualitas dari guru-guru terbaik Indonesia',
                  color: 'from-primary/20 to-primary/10',
                  iconColor: 'text-primary'
                },
                {
                  icon: <FileText className="w-10 h-10" />,
                  title: 'Tryout UTBK',
                  description: 'Simulasi ujian dengan sistem scoring IRT dan prediksi passing grade',
                  color: 'from-secondary/20 to-secondary/10',
                  iconColor: 'text-secondary'
                },
                {
                  icon: <Globe className="w-10 h-10" />,
                  title: 'Learning Path',
                  description: 'Jalur belajar terstruktur sesuai kurikulum nasional SD-SMA',
                  color: 'from-purple/20 to-purple/10',
                  iconColor: 'text-purple'
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="game-card text-center group"
                >
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform ${feature.iconColor}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Game Types */}
        <section id="games" className="py-20 bg-card">
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
              {[
                { icon: <Brain className="w-10 h-10" />, title: 'Quiz', desc: 'Jawab pertanyaan dengan cepat dan tepat', tag: 'Paling Populer', color: 'primary' },
                { icon: <Hand className="w-10 h-10" />, title: 'Drag & Drop', desc: 'Susun dan cocokkan item dengan menyenangkan', tag: 'Interaktif', color: 'secondary' },
                { icon: <Grid3X3 className="w-10 h-10" />, title: 'Memory Game', desc: 'Latih ingatan dengan mencocokkan kartu', tag: 'Asah Otak', color: 'purple' },
                { icon: <Puzzle className="w-10 h-10" />, title: 'Puzzle', desc: 'Susun gambar dan pecahkan teka-teki', tag: 'Menantang', color: 'orange' },
              ].map((game, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`game-card text-center group hover:border-${game.color}/50 border-2 border-transparent transition-all`}
                >
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-${game.color}/20 to-${game.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform text-${game.color}`}>
                    {game.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{game.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{game.desc}</p>
                  <div className={`inline-flex items-center gap-2 text-xs text-${game.color} font-semibold`}>
                    <Play className="w-4 h-4" />
                    <span>{game.tag}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
                FITUR UNGGULAN
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Kenapa Pilih Eduverse? 🚀
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Platform belajar yang didesain khusus untuk membuat pendidikan lebih menyenangkan
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Rocket className="w-7 h-7" />, title: 'AI Tutor', desc: 'Asisten AI yang siap membantu belajar 24/7', color: 'success' },
                { icon: <Trophy className="w-7 h-7" />, title: 'Gamifikasi', desc: 'Kumpulkan badge, naik level, dan bersaing di leaderboard', color: 'primary' },
                { icon: <Users className="w-7 h-7" />, title: 'Dashboard Guru', desc: 'Pantau progress siswa dan berikan tugas dengan mudah', color: 'secondary' },
                { icon: <BookOpen className="w-7 h-7" />, title: 'Kurikulum Lengkap', desc: 'Mencakup semua mata pelajaran SD hingga SMA', color: 'purple' },
                { icon: <Zap className="w-7 h-7" />, title: 'Daily Challenge', desc: 'Tantangan harian dengan bonus poin spesial', color: 'warning' },
                { icon: <Shield className="w-7 h-7" />, title: 'Parent Dashboard', desc: 'Orang tua bisa memantau progress anak', color: 'info' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${feature.color}/20 to-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-purple/10 text-purple font-semibold text-sm mb-4">
                TESTIMONI
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Apa Kata Mereka? 💬
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Dengarkan pengalaman dari pengguna Eduverse
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { text: 'Anak saya jadi lebih semangat belajar sejak pakai Eduverse. Video pembelajarannya keren dan game-nya seru!', name: 'Ibu Sari', role: 'Orang Tua Siswa SD', avatar: '👩' },
                { text: 'Tryout UTBK-nya sangat membantu. Prediksi skornya akurat dan pembahasannya detail!', name: 'Andi', role: 'Siswa SMA Kelas 12', avatar: '👨‍🎓' },
                { text: 'Dashboard guru sangat membantu saya memantau progress siswa. Fitur bulk assign menghemat banyak waktu!', name: 'Pak Budi', role: 'Guru SMP', avatar: '👨‍🏫' },
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-background p-6 rounded-2xl border border-border hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple/10 to-secondary/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
          
          <div className="container mx-auto px-4 relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
                <img src="/favicon.svg" alt="Eduverse" className="w-6 h-6" />
                <span className="font-semibold">Bergabung dengan 50,000+ Siswa</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Siap Menjelajahi<br />
                <span className="bg-gradient-to-r from-primary via-purple to-secondary bg-clip-text text-transparent">
                  Universe Pembelajaran?
                </span>
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg">
                Daftar sekarang dan mulai belajar dengan cara yang menyenangkan. 
                100% gratis untuk semua siswa!
              </p>
              <Link to="/auth?mode=signup">
                <GameButton variant="primary" size="xl" className="group">
                  <Sparkles className="w-6 h-6" />
                  Mulai Sekarang - Gratis!
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </GameButton>
              </Link>
              <p className="mt-6 text-sm text-muted-foreground">
                Tidak perlu kartu kredit • Langsung bisa digunakan
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <FuturisticLogo size="sm" />
              </div>
              <p className="text-muted-foreground text-sm">
                Platform edukasi interaktif #1 Indonesia. Learn, Play, Grow.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fitur</a></li>
                <li><a href="#games" className="hover:text-foreground transition-colors">Jenis Game</a></li>
                <li><a href="#platform" className="hover:text-foreground transition-colors">Video Learning</a></li>
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
                <li>support@eduverse.id</li>
                <li>+62 812 3456 7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>© 2024 Eduverse. Learn • Play • Grow 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  );
}