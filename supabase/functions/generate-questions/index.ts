import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionRequest {
  topic: string;
  educationLevel: string;
  count?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, educationLevel, count = 5 }: QuestionRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const levelMap: Record<string, string> = {
      sd: "Sekolah Dasar (SD), usia 6-12 tahun",
      smp: "Sekolah Menengah Pertama (SMP), usia 13-15 tahun",
      sma: "Sekolah Menengah Atas (SMA), usia 16-18 tahun",
    };

    const levelDescription = levelMap[educationLevel] || "Sekolah Dasar (SD)";

    const systemPrompt = `Kamu adalah guru yang membuat soal quiz untuk siswa Indonesia. 
Buat soal yang edukatif, menarik, dan sesuai dengan tingkat pendidikan siswa.
Gunakan bahasa Indonesia yang baik dan benar.
Setiap soal harus memiliki 4 pilihan jawaban.`;

    const userPrompt = `Buatkan ${count} soal quiz tentang "${topic}" untuk siswa ${levelDescription}.

Format output HARUS berupa JSON array seperti ini:
[
  {
    "id": "1",
    "question_text": "Pertanyaan di sini?",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "correct_answer": "Pilihan yang benar",
    "explanation": "Penjelasan singkat mengapa jawaban tersebut benar"
  }
]

Pastikan:
- Soal sesuai dengan materi ${topic} dan tingkat ${levelDescription}
- Pilihan jawaban tidak ambigu
- Ada satu jawaban yang jelas benar
- Penjelasan singkat dan mudah dipahami`;

    console.log(`Generating ${count} questions for topic: ${topic}, level: ${educationLevel}`);

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response:", content.substring(0, 500));

    // Parse the JSON from the response
    let questions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse questions from AI response");
    }

    // Validate questions structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format");
    }

    // Ensure each question has required fields
    questions = questions.map((q, index) => ({
      id: q.id || String(index + 1),
      question_text: q.question_text || q.question || "",
      options: Array.isArray(q.options) ? q.options : [],
      correct_answer: q.correct_answer || q.options?.[0] || "",
      explanation: q.explanation || "",
    }));

    console.log(`Successfully generated ${questions.length} questions`);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-questions:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate questions";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
