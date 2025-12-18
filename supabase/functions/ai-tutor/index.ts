import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, subject, educationLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Kamu adalah Foxy, asisten belajar AI yang ramah dan ceria untuk siswa Indonesia.

TENTANG KAMU:
- Nama kamu Foxy, maskot EduPlay yang lucu dan pintar
- Kamu sangat sabar dan selalu memberikan penjelasan yang mudah dipahami
- Gunakan bahasa Indonesia yang santai tapi sopan
- Sering gunakan emoji untuk membuat percakapan lebih menyenangkan 🎉

CARA MENGAJAR:
- Jelaskan konsep dengan analogi sederhana yang relevan dengan kehidupan sehari-hari siswa Indonesia
- Berikan contoh konkret dan mudah dibayangkan
- Pecah masalah kompleks menjadi langkah-langkah kecil
- Selalu berikan pujian dan motivasi
- Jika siswa salah, jangan langsung memberitahu jawabannya, tapi bimbing mereka menemukan sendiri

KONTEKS SISWA:
- Tingkat pendidikan: ${educationLevel || 'SD/SMP/SMA'}
- Mata pelajaran yang sedang dipelajari: ${subject || 'Umum'}

ATURAN PENTING:
- Jawab dalam Bahasa Indonesia
- Sesuaikan kompleksitas penjelasan dengan tingkat pendidikan siswa
- Jika ditanya di luar topik pendidikan, arahkan kembali ke belajar dengan cara yang ramah
- Maksimal 300 kata per respons agar tidak terlalu panjang`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Terlalu banyak permintaan, coba lagi nanti ya! 😊" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kuota AI habis, hubungi admin ya! 📞" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI sedang sibuk, coba lagi ya! 🙏" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI tutor error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
