
-- Subscription Plans Table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Subscriptions Table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Battle Pass Seasons
CREATE TABLE public.battle_pass_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Battle Pass Rewards
CREATE TABLE public.battle_pass_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value JSONB NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Battle Pass Progress
CREATE TABLE public.user_battle_pass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  season_id UUID REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  claimed_rewards INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- Referral System
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  code TEXT UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE,
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily Rewards & Lucky Spin
CREATE TABLE public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_day INTEGER DEFAULT 1,
  reward_type TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, reward_date)
);

CREATE TABLE public.lucky_spin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_type TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  is_premium_spin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment Transactions (untuk Duitku nanti)
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'IDR',
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'expired')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_battle_pass ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_spin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Plans viewable by everyone" ON public.subscription_plans FOR SELECT USING (true);

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Battle pass seasons viewable by everyone" ON public.battle_pass_seasons FOR SELECT USING (true);
CREATE POLICY "Battle pass rewards viewable by everyone" ON public.battle_pass_rewards FOR SELECT USING (true);

CREATE POLICY "Users can view own battle pass" ON public.user_battle_pass FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own battle pass" ON public.user_battle_pass FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own battle pass" ON public.user_battle_pass FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own referral code" ON public.referral_codes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Referral codes viewable for lookup" ON public.referral_codes FOR SELECT USING (true);

CREATE POLICY "Users can view referral uses" ON public.referral_uses FOR SELECT USING (EXISTS (SELECT 1 FROM referral_codes WHERE id = code_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert referral uses" ON public.referral_uses FOR INSERT WITH CHECK (auth.uid() = referred_user_id);

CREATE POLICY "Users can view own daily rewards" ON public.daily_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily rewards" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own spin history" ON public.lucky_spin_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spin history" ON public.lucky_spin_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.payment_transactions FOR UPDATE USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_yearly, features) VALUES
('Free', 'free', 0, 0, '{"daily_games": 5, "daily_ai_chats": 3, "ad_free": false, "premium_avatars": false, "premium_powerups": false, "max_children": 1, "pdf_reports": false}'),
('Premium', 'premium', 49000, 470000, '{"daily_games": -1, "daily_ai_chats": -1, "ad_free": true, "premium_avatars": true, "premium_powerups": true, "max_children": 1, "pdf_reports": true}'),
('Family', 'family', 99000, 950000, '{"daily_games": -1, "daily_ai_chats": -1, "ad_free": true, "premium_avatars": true, "premium_powerups": true, "max_children": 5, "pdf_reports": true, "family_leaderboard": true}'),
('School', 'school', 0, 0, '{"daily_games": -1, "daily_ai_chats": -1, "ad_free": true, "premium_avatars": true, "premium_powerups": true, "unlimited_classes": true, "bulk_import": true, "advanced_analytics": true}');

-- Insert sample battle pass season
INSERT INTO public.battle_pass_seasons (name, description, starts_at, ends_at, is_active) VALUES
('Season 1: Back to School', 'Mulai petualangan belajarmu!', now(), now() + interval '90 days', true);
