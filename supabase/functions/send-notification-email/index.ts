import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  type: 'assignment' | 'daily_challenge' | 'achievement' | 'battle_invite' | 'streak_reminder';
  data: {
    studentName?: string;
    title?: string;
    dueDate?: string;
    badgeName?: string;
    challengeTitle?: string;
    streakDays?: number;
    battleCode?: string;
  };
}

const getEmailContent = (type: string, data: NotificationEmailRequest['data']) => {
  const templates: Record<string, { subject: string; html: string }> = {
    assignment: {
      subject: `📚 Tugas Baru: ${data.title}`,
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ec4899, #06b6d4); padding: 30px; border-radius: 16px; text-align: center;">
            <h1 style="color: white; margin: 0;">📚 Tugas Baru!</h1>
          </div>
          <div style="background: #fefce8; padding: 24px; border-radius: 16px; margin-top: 20px;">
            <p style="font-size: 18px; color: #374151;">Hai ${data.studentName || 'Siswa'}!</p>
            <p style="color: #6b7280;">Guru kamu telah memberikan tugas baru:</p>
            <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h2 style="color: #ec4899; margin: 0 0 8px 0;">${data.title}</h2>
              <p style="color: #6b7280; margin: 0;">📅 Deadline: ${data.dueDate || 'Segera'}</p>
            </div>
            <p style="color: #374151;">Ayo kerjakan tugasmu dan dapatkan poin!</p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            EduPlay - Belajar Sambil Bermain 🎮
          </p>
        </div>
      `,
    },
    daily_challenge: {
      subject: `🎯 Tantangan Harian Menunggumu!`,
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; border-radius: 16px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎯 Tantangan Harian!</h1>
          </div>
          <div style="background: #fefce8; padding: 24px; border-radius: 16px; margin-top: 20px;">
            <p style="font-size: 18px; color: #374151;">Hai ${data.studentName || 'Jagoan'}!</p>
            <p style="color: #6b7280;">Tantangan harian sudah siap! Selesaikan untuk mendapat bonus XP!</p>
            <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <h2 style="color: #f59e0b; margin: 0;">${data.challengeTitle || 'Tantangan Seru'}</h2>
              <p style="color: #22c55e; font-size: 24px; margin: 8px 0;">+50 Bonus XP</p>
            </div>
            <p style="color: #374151;">Jangan lewatkan kesempatan ini!</p>
          </div>
        </div>
      `,
    },
    achievement: {
      subject: `🏆 Selamat! Kamu Mendapat Badge Baru!`,
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; border-radius: 16px; text-align: center;">
            <h1 style="color: white; margin: 0;">🏆 Badge Baru!</h1>
          </div>
          <div style="background: #fefce8; padding: 24px; border-radius: 16px; margin-top: 20px;">
            <p style="font-size: 18px; color: #374151;">Selamat ${data.studentName || 'Juara'}!</p>
            <p style="color: #6b7280;">Kamu telah mendapatkan pencapaian baru:</p>
            <div style="background: white; padding: 24px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <p style="font-size: 48px; margin: 0;">🎖️</p>
              <h2 style="color: #8b5cf6; margin: 8px 0;">${data.badgeName}</h2>
            </div>
            <p style="color: #374151; text-align: center;">Terus belajar untuk mendapat lebih banyak badge!</p>
          </div>
        </div>
      `,
    },
    battle_invite: {
      subject: `⚔️ Kamu Ditantang Quiz Battle!`,
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444, #f59e0b); padding: 30px; border-radius: 16px; text-align: center;">
            <h1 style="color: white; margin: 0;">⚔️ Quiz Battle!</h1>
          </div>
          <div style="background: #fefce8; padding: 24px; border-radius: 16px; margin-top: 20px;">
            <p style="font-size: 18px; color: #374151;">Hai ${data.studentName || 'Challenger'}!</p>
            <p style="color: #6b7280;">Ada yang menantangmu untuk Quiz Battle!</p>
            <div style="background: white; padding: 24px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <p style="color: #6b7280;">Kode Battle:</p>
              <h2 style="color: #ef4444; margin: 8px 0; font-size: 32px; letter-spacing: 4px;">${data.battleCode}</h2>
            </div>
            <p style="color: #374151; text-align: center;">Masuk ke EduPlay dan terima tantangannya!</p>
          </div>
        </div>
      `,
    },
    streak_reminder: {
      subject: `🔥 Jangan Putus Streak-mu!`,
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316, #eab308); padding: 30px; border-radius: 16px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔥 Streak Reminder!</h1>
          </div>
          <div style="background: #fefce8; padding: 24px; border-radius: 16px; margin-top: 20px;">
            <p style="font-size: 18px; color: #374151;">Hai ${data.studentName || 'Pejuang'}!</p>
            <p style="color: #6b7280;">Streak belajarmu sedang berjalan!</p>
            <div style="background: white; padding: 24px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <p style="font-size: 48px; margin: 0;">🔥</p>
              <h2 style="color: #f97316; margin: 8px 0;">${data.streakDays} Hari Berturut-turut!</h2>
            </div>
            <p style="color: #374151; text-align: center;">Belajar hari ini untuk menjaga streak-mu!</p>
          </div>
        </div>
      `,
    },
  };

  return templates[type] || templates.daily_challenge;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - email sending disabled");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email notifications not configured. Please add RESEND_API_KEY." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { to, type, data }: NotificationEmailRequest = await req.json();
    const { subject, html } = getEmailContent(type, data);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EduPlay <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-notification-email:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
