import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Apakah Eduverse cocok untuk anak SD?',
    a: 'Sangat cocok. Untuk SD, materi disajikan dengan bahasa sederhana, banyak game ringan, dan AI tutor yang menjelaskan dengan contoh sehari-hari.',
  },
  {
    q: 'Bagaimana sistem personalized learning bekerja?',
    a: 'Setelah daftar, kamu mengisi jenjang, kelas, jurusan, dan tujuan belajar. Sistem otomatis menyusun roadmap, rekomendasi modul, dan jadwal latihan sesuai profil kamu.',
  },
  {
    q: 'Apakah ada paket gratis?',
    a: 'Ya. Semua jenjang punya tier gratis yang mencakup 3 bab pertama tiap mapel, basic quiz, dan AI tutor terbatas. Upgrade ke Premium kapan saja.',
  },
  {
    q: 'Siapa saja yang bisa jadi Edu Creator?',
    a: 'Guru sekolah, mahasiswa, alumni, atau siapa saja yang punya kompetensi mengajar. Kamu bisa upload kelas premium, tryout, atau modul tambahan dan dapat revenue sharing.',
  },
  {
    q: 'Bagaimana orang tua memantau anak?',
    a: 'Orang tua mendaftar dengan role khusus, lalu menghubungkan akun dengan kode siswa milik anak. Setelah terhubung, dashboard ortu menampilkan progress, streak, nilai quiz, dan waktu belajar.',
  },
  {
    q: 'Apakah AI tutor benar-benar tahu jawaban yang benar?',
    a: 'AI tutor kami dirancang untuk pembelajaran — adaptif sesuai jenjang. Kami juga selalu menyarankan untuk cross-check dengan modul resmi untuk soal-soal kritis seperti ujian.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-card/40 border-y border-border/40">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Pertanyaan yang <span className="text-gradient">sering ditanya</span>.
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="rounded-2xl border border-border/60 bg-card px-5 data-[state=open]:border-primary/40"
            >
              <AccordionTrigger className="text-left font-bold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
