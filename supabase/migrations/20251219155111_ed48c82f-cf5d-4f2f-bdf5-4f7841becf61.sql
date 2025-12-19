-- Create user_coins table for tracking coins
CREATE TABLE public.user_coins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 1500,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_owned_items table for tracking purchased items
CREATE TABLE public.user_owned_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id text NOT NULL,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Create parental_controls table
CREATE TABLE public.parental_controls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id uuid NOT NULL,
  child_id uuid NOT NULL,
  daily_time_limit_minutes integer DEFAULT 120,
  allowed_start_time time DEFAULT '06:00',
  allowed_end_time time DEFAULT '21:00',
  blocked_game_types text[] DEFAULT '{}',
  content_filter_level text DEFAULT 'moderate',
  notifications_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Enable RLS
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_owned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_controls ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_coins
CREATE POLICY "Users can view own coins" ON public.user_coins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coins" ON public.user_coins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coins" ON public.user_coins FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user_owned_items
CREATE POLICY "Users can view own items" ON public.user_owned_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.user_owned_items FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for parental_controls
CREATE POLICY "Parents can manage own controls" ON public.parental_controls FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "Children can view their controls" ON public.parental_controls FOR SELECT USING (auth.uid() = child_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_coins_updated_at BEFORE UPDATE ON public.user_coins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parental_controls_updated_at BEFORE UPDATE ON public.parental_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award coins after game completion
CREATE OR REPLACE FUNCTION public.award_coins_for_game()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coins_earned integer;
  existing_coins user_coins%ROWTYPE;
BEGIN
  -- Calculate coins based on score (10 coins per 100 points)
  coins_earned := GREATEST(10, COALESCE(NEW.score, 0) / 10);
  
  -- Get or create coins record
  SELECT * INTO existing_coins FROM user_coins WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_coins (user_id, balance, total_earned)
    VALUES (NEW.user_id, 1500 + coins_earned, coins_earned);
  ELSE
    UPDATE user_coins 
    SET balance = balance + coins_earned,
        total_earned = total_earned + coins_earned,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to award coins when game session is completed
CREATE TRIGGER award_coins_on_game_complete
AFTER UPDATE ON public.game_sessions
FOR EACH ROW
WHEN (NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL))
EXECUTE FUNCTION public.award_coins_for_game();