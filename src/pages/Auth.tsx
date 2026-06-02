import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot } from '@/components/Mascot';
import { FuturisticLogo } from '@/components/FuturisticLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, Mail, Lock, User, ArrowLeft, Heart, CheckCircle, Info } from 'lucide-react';
import { z } from 'zod';
import {
  JENJANG_OPTIONS,
  KELAS_BY_JENJANG,
  JURUSAN_SMA,
  JURUSAN_SMK,
  FAKULTAS_PRODI,
  UTBK_TARGETS,
  UTBK_JURUSAN,
  AGAMA_OPTIONS,
  BIDANG_GURU,
  jenjangToBaseLevel,
} from '@/lib/registerOptions';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const signupBaseSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['student', 'teacher', 'parent']),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(
    (searchParams.get('mode') as 'login' | 'signup' | 'forgot') || 'login'
  );
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>(
    (searchParams.get('role') as 'student' | 'teacher' | 'parent') || 'student'
  );
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [jenjang, setJenjang] = useState<string>('');
  const [kelas, setKelas] = useState<string>('');
  const [jurusanSma, setJurusanSma] = useState<string>('');
  const [jurusanSmk, setJurusanSmk] = useState<string>('');
  const [fakultas, setFakultas] = useState<string>('');
  const [prodi, setProdi] = useState<string>('');
  const [utbkTarget, setUtbkTarget] = useState<string>('');
  const [utbkJurusan, setUtbkJurusan] = useState<string>('');
  const [agama, setAgama] = useState<string>('');
  // Teacher
  const [bidang, setBidang] = useState<string>('');
  const [mapel, setMapel] = useState('');
  const [pengalaman, setPengalaman] = useState('');
  const [institusi, setInstitusi] = useState('');
  // Parent
  const [namaAnak, setNamaAnak] = useState('');
  const [jenjangAnak, setJenjangAnak] = useState<string>('');
  const [kodeAnak, setKodeAnak] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const modeParam = searchParams.get('mode') as 'login' | 'signup' | 'forgot';
    const roleParam = searchParams.get('role') as 'student' | 'teacher' | 'parent';
    if (modeParam) setMode(modeParam);
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: 'Masukkan email' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({
        title: 'Gagal mengirim email',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setForgotEmailSent(true);
      toast({
        title: 'Email terkirim!',
        description: 'Cek inbox email Anda untuk link reset password',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Gagal masuk',
            description: error.message === 'Invalid login credentials' 
              ? 'Email atau password salah'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Berhasil masuk!',
            description: 'Selamat datang kembali di Eduverse',
          });
          navigate('/dashboard');
        }
      } else {
        const result = signupSchema.safeParse({ 
          email, 
          password, 
          fullName, 
          role,
          educationLevel: role === 'student' ? educationLevel : undefined,
        });
        
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        if (role === 'student' && !educationLevel) {
          setErrors({ educationLevel: 'Pilih jenjang pendidikan' });
          setLoading(false);
          return;
        }

        const { error } = await signUp(
          email, 
          password, 
          fullName, 
          role,
          role === 'student' ? educationLevel : undefined
        );
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Email sudah terdaftar',
              description: 'Silakan gunakan email lain atau masuk dengan email ini',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Gagal mendaftar',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Berhasil mendaftar!',
            description: 'Selamat datang di Eduverse',
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        description: 'Silakan coba lagi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <div className="mb-8">
            <FuturisticLogo size="lg" />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Selamat Datang Kembali!' : mode === 'forgot' ? 'Lupa Password?' : 'Buat Akun Baru'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === 'login' 
              ? 'Masuk untuk melanjutkan belajar' 
              : mode === 'forgot'
                ? 'Masukkan email untuk reset password'
                : 'Daftar gratis dan mulai belajar'}
          </p>

          {mode === 'forgot' && forgotEmailSent && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-500">Email terkirim!</p>
              <p className="text-sm text-muted-foreground">Cek inbox email Anda</p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  role === 'student' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <GraduationCap className={`w-6 h-6 mx-auto mb-2 ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`font-semibold text-sm ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`}>Siswa</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  role === 'teacher' 
                    ? 'border-secondary bg-secondary/10' 
                    : 'border-border hover:border-secondary/50'
                }`}
              >
                <Users className={`w-6 h-6 mx-auto mb-2 ${role === 'teacher' ? 'text-secondary' : 'text-muted-foreground'}`} />
                <p className={`font-semibold text-sm ${role === 'teacher' ? 'text-secondary' : 'text-muted-foreground'}`}>Guru</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  role === 'parent' 
                    ? 'border-purple bg-purple/10' 
                    : 'border-border hover:border-purple/50'
                }`}
              >
                <Heart className={`w-6 h-6 mx-auto mb-2 ${role === 'parent' ? 'text-purple' : 'text-muted-foreground'}`} />
                <p className={`font-semibold text-sm ${role === 'parent' ? 'text-purple' : 'text-muted-foreground'}`}>Orang Tua</p>
              </button>
            </div>
          )}

          {mode === 'forgot' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <GameButton
                type="button"
                variant="primary"
                size="lg"
                className="w-full mt-6"
                disabled={loading || forgotEmailSent}
                onClick={handleForgotPassword}
              >
                {loading ? 'Loading...' : forgotEmailSent ? 'Email Terkirim' : 'Kirim Link Reset'}
              </GameButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              {mode === 'signup' && role === 'student' && (
                <div>
                  <Label htmlFor="educationLevel">Jenjang Pendidikan</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel}>
                    <SelectTrigger className="mt-1 h-12 rounded-xl">
                      <SelectValue placeholder="Pilih jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">SD (Sekolah Dasar)</SelectItem>
                      <SelectItem value="smp">SMP (Sekolah Menengah Pertama)</SelectItem>
                      <SelectItem value="sma">SMA (Sekolah Menengah Atas)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.educationLevel && <p className="text-sm text-destructive mt-1">{errors.educationLevel}</p>}
                </div>
              )}

              <GameButton
                type="submit"
                variant={role === 'teacher' ? 'secondary' : 'primary'}
                size="lg"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Loading...' : mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
              </GameButton>
            </form>
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="block w-full text-center text-sm text-muted-foreground hover:text-primary mt-4"
            >
              Lupa password?
            </button>
          )}

          <p className="text-center text-muted-foreground mt-6">
            {mode === 'login' ? (
              <>
                Belum punya akun?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  Daftar Gratis
                </button>
              </>
            ) : mode === 'forgot' ? (
              <>
                Ingat password?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Masuk
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-secondary/5 to-purple/10 items-center justify-center p-12">
        <div className="text-center">
          <Mascot size="xl" mood={mode === 'login' ? 'happy' : 'excited'} />
          <h2 className="text-2xl font-bold mt-8 mb-4">
            {mode === 'login' 
              ? 'Siap untuk belajar lagi?' 
              : role === 'student'
                ? 'Yuk mulai petualangan belajarmu!'
                : role === 'parent'
                  ? 'Pantau progress anak dengan mudah!'
                  : 'Pantau progress siswa dengan mudah!'}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {mode === 'login'
              ? 'Lanjutkan progress belajarmu dan kumpulkan lebih banyak badge!'
              : role === 'student'
                ? 'Belajar sambil bermain dengan game-game seru yang akan membuatmu pintar!'
                : role === 'parent'
                  ? 'Lihat progress belajar anak dan dukung mereka untuk terus berkembang!'
                  : 'Dashboard khusus guru untuk memantau dan membantu siswa belajar dengan lebih efektif.'}
          </p>
        </div>
      </div>
    </div>
  );
}
