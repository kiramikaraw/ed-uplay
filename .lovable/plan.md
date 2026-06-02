# Rencana Upgrade Eduverse → Platform SaaS Edukasi Modern

Pengembangan dilakukan **bertahap (multi-batch)** karena scope sangat besar. Identitas visual (FuturisticLogo, neon glow, dark futuristic theme, semantic tokens) tetap dipertahankan — hanya di-extend.

---

## BATCH 1 — Landing Page Revamp + Hero Modern

**Tujuan:** Landing terasa seperti SaaS edukasi modern (Duolingo × Ruangguru × Linear).

1. **Hero Section baru** (`src/pages/Index.tsx`)
   - Headline besar + subheadline + dual CTA (Mulai Gratis / Lihat Demo)
   - Mockup dashboard Eduverse di sisi kanan (komponen baru `HeroDashboardMockup`) menampilkan: progress belajar, AI tutor chip, daily challenge, XP bar, mini leaderboard, quiz card, learning path
   - Floating animation cards: "+50 XP Earned", "Daily Challenge Completed", "AI Tutor Active", "Rank #12 This Week" (framer-motion, posisi absolute)
   - Background: gradient + grid pattern + blur orbs (pakai token warna existing)
   - Trust bar: "Dipakai oleh 10.000+ siswa"

2. **Section landing baru** (komponen per section di `src/components/landing/`):
   - `WhyDifferent` — 4 pilar (AI, Gamifikasi, Personalized, Creator)
   - `HowItWorks` — 3 langkah dengan ilustrasi
   - `PersonalizedLearningSection` — visual roadmap SD/SMP/SMA/UTBK
   - `AITutorSection` — chat mockup dengan contoh tanya jawab per jenjang
   - `DashboardPreviewSection` — screenshot-style dashboard
   - `GamificationSection` — XP, badges, streak, level
   - `EducationalGamesSection` — grid game (Battle Quiz, Puzzle, Memory, dll)
   - `PricingSection` — freemium dengan tier per jenjang (SD/SMP/SMA/UTBK)
   - `CreatorPlatformSection` — pitch untuk Edu Creator + revenue sharing
   - `Testimonials` — carousel siswa, guru, ortu
   - `FAQ` — accordion
   - `ModernFooter`

3. **Style:** glassmorphism, floating cards, blur orbs, smooth scroll animations (framer-motion `whileInView`). Semua warna pakai semantic tokens yang sudah ada.

---

## BATCH 2 — Register Flow Modern + Role System

**Tujuan:** Onboarding multi-role yang modern.

1. **Halaman Register baru** (`src/pages/Auth.tsx` – mode signup)
   - **Step 1: Role Selection Card** (bukan radio)
     - 3 card besar: "Belajar Sebagai Siswa", "Menjadi Edu Creator", "Pantau Progress Anak"
     - Tiap card dengan icon, gradient, hover effect
   - **Step 2: Data per role** (conditional form)
     - Siswa: umur, jenjang (SD/SMP/SMA/SMK/UTBK), kelas, jurusan (untuk SMA/SMK), tujuan belajar (multi-select: nilai sekolah, UTBK, skill, hobi)
     - Creator: bidang pelajaran (multi-select), tahun pengalaman, institusi (optional)
     - Orang Tua: nama anak, jenjang anak, kode akun siswa (link nanti)
   - **Step 3:** Email + password + Google sign-in
   - Note informatif untuk siswa tentang akurasi data
   - Progress indicator antar step

2. **Database changes** (migration):
   - Extend `profiles`: tambah `age`, `grade`, `major`, `learning_goals` (jsonb), `subjects_taught` (jsonb), `experience_years`, `institution`
   - Tabel baru `student_link_codes` (kode unik tiap siswa untuk dihubungkan ortu)
   - Update trigger `handle_new_user` untuk menyimpan metadata baru
   - Tabel `parent_children` sudah ada — extend dengan flow link via code

---

## BATCH 3 — Personalized Dashboard + Smart Learning Path

1. **Dashboard siswa adaptif** (`src/pages/Dashboard.tsx`)
   - Filter konten berdasarkan `profile.education_level`, `grade`, `major`, `learning_goals`
   - Widget baru: "Smart Learning Path" — roadmap visual otomatis sesuai tujuan (mis. UTBK → jadwal tryout mingguan)
   - Rekomendasi modul berdasarkan jenjang
   - Daily challenge & weekly target card
   - Hero greeting personal: "Halo {nama}, target hari ini: 30 menit Matematika"

2. **Komponen baru:**
   - `SmartLearningPath` — visual tree/timeline
   - `WeeklyTargetCard`
   - `RecommendedModules` (query topics by education_level & subjects)

---

## BATCH 4 — Creator Dashboard + Monetization

1. **Halaman baru** `/creator` (`src/pages/CreatorDashboard.tsx`)
   - Stats: earnings, students, kelas aktif, rating
   - CRUD: kelas premium, modul, tryout, challenge
   - Revenue sharing display (e.g. 70/30)
   - Withdrawal section (UI saja dulu, payment menyusul)

2. **Database:**
   - Tabel `creator_classes` (title, price, creator_id, subject, level)
   - Tabel `class_enrollments` (user_id, class_id, paid_amount)
   - Tabel `creator_earnings` (creator_id, amount, period, status)
   - Tabel `creator_payouts`
   - RLS: creator hanya manage milik sendiri

3. Update `Auth` agar role `teacher` redirect ke `/creator` (atau toggle teacher/creator dashboard)

---

## BATCH 5 — Parent Linking Flow

1. **Halaman onboarding ortu** — input kode anak → verify → link
2. **Generate code** otomatis untuk siswa di profile settings (copyable)
3. Parent dashboard sudah ada — pastikan menampilkan: progress, statistik, nilai quiz, streak, waktu belajar, grafik mingguan

---

## BATCH 6 — Subscription Tiers per Jenjang

1. **Update `subscription_plans`** seed: tier berbeda untuk SD, SMP, SMA/SMK, UTBK (harga & feature berbeda)
2. **Update `PricingPlans` component** + section landing untuk menampilkan tab per jenjang
3. **Feature gating** di modul: free user hanya 3 bab pertama (cek di `SubjectDetail`)
4. **`useSubscription` hook** — extend untuk check tier per jenjang
5. Payment gateway: defer (sesuai memory)

---

## BATCH 7 — Polish AI Tutor, Game Edukasi, Gamification

1. **AI Tutor**: update system prompt agar adaptif jenjang (sudah ada `ai-tutor` edge function — modifikasi prompt)
2. **Game baru** (jika belum ada): Battle Quiz Arena upgrade, Logic Game
3. **Gamification audit**: pastikan XP, streak, badges, level progression, profile frame unlock semua wired

---

## Catatan Teknis

- **Stack:** React + Vite + Tailwind + shadcn + framer-motion (sudah ada di project)
- **Design tokens:** wajib pakai semantic tokens di `index.css` & `tailwind.config.ts` — tidak ada warna hardcoded
- **Database:** semua migration via `supabase--migration` dengan GRANT + RLS lengkap
- **Backward compat:** komponen existing (FuturisticLogo, QuizHub, Tryout, dll) tidak dihapus, hanya di-extend
- **Payment:** UI only sekarang, gateway Duitku integrasi nanti

---

## Yang Akan Diimplementasi Pertama

**Saran:** mulai dari **Batch 1 (Landing Page Revamp + Hero Modern)** karena ini yang paling impactful untuk first impression dan paling sesuai dengan keluhan "hero terlalu kosong".

Apakah Anda setuju mulai dari Batch 1, atau ingin prioritaskan batch lain (mis. Register Flow dulu, atau Personalized Dashboard dulu)?
