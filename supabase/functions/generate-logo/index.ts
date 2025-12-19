import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const logoPrompts: Record<string, string> = {
      mascot: "A cute friendly owl mascot wearing a graduation cap and holding a game controller, vibrant purple and golden yellow colors, playful cartoon style, educational gaming logo design, clean white background, high quality vector-like illustration, suitable for app icon",
      abstract: "Modern abstract minimalist logo combining an open book and game controller icons merged together, gradient from purple to magenta colors, rounded geometric shapes, educational gaming brand logo, clean white background, professional app icon design",
      typography: "EduPlay text logo with creative playful rounded font, the letter P designed as a play button triangle, small sparkle star accents around text, purple color scheme with yellow highlights, modern educational app logo, white background",
      puzzle: "Colorful puzzle pieces forming the letter E, pieces in purple yellow and green colors, educational gaming logo concept, fun playful design, clean modern vector style, white background, suitable for app icon"
    };

    const selectedPrompt = logoPrompts[style] || prompt || logoPrompts.mascot;

    console.log('Generating logo with style:', style);
    console.log('Using prompt:', selectedPrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: selectedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      style,
      message: data.choices?.[0]?.message?.content || 'Logo generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating logo:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
