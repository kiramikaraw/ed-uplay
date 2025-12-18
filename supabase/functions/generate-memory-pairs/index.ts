import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PairRequest {
  topic: string;
  educationLevel: string;
  count?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, educationLevel, count = 6 }: PairRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const levelMap: Record<string, string> = {
      sd: "Sekolah Dasar (SD)",
      smp: "Sekolah Menengah Pertama (SMP)",
      sma: "Sekolah Menengah Atas (SMA)",
    };

    const levelDescription = levelMap[educationLevel] || "Sekolah Dasar (SD)";

    const systemPrompt = `Kamu adalah guru yang membuat pasangan soal-jawaban untuk memory game.
Buat pasangan yang edukatif dan sesuai dengan tingkat pendidikan siswa.`;

    const userPrompt = `Buatkan ${count} pasangan soal-jawaban tentang "${topic}" untuk siswa ${levelDescription}.

Format output HARUS berupa JSON array seperti ini:
[
  { "question": "2 + 2", "answer": "4" },
  { "question": "Ibukota Indonesia", "answer": "Jakarta" }
]

Pastikan:
- Pasangan sesuai dengan materi ${topic}
- Jawaban singkat (1-2 kata)
- Soal dan jawaban jelas berpasangan`;

    console.log(`Generating ${count} pairs for topic: ${topic}`);

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
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let pairs;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        pairs = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch (parseError) {
      console.error("Failed to parse:", parseError);
      throw new Error("Failed to parse pairs");
    }

    console.log(`Generated ${pairs.length} pairs`);

    return new Response(
      JSON.stringify({ pairs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate pairs";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
