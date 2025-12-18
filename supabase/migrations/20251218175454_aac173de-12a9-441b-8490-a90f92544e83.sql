-- Create learning streaks table
CREATE TABLE public.learning_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create daily activity log
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  games_played INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Create quiz battles table
CREATE TABLE public.quiz_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL,
  opponent_id UUID,
  challenger_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, in_progress, completed
  winner_id UUID,
  battle_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_battles ENABLE ROW LEVEL SECURITY;

-- Learning streaks policies
CREATE POLICY "Users can view own streaks"
ON public.learning_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
ON public.learning_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
ON public.learning_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- Daily activities policies
CREATE POLICY "Users can view own activities"
ON public.daily_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
ON public.daily_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
ON public.daily_activities FOR UPDATE
USING (auth.uid() = user_id);

-- Quiz battles policies
CREATE POLICY "Users can view battles they participate in"
ON public.quiz_battles FOR SELECT
USING (auth.uid() = challenger_id OR auth.uid() = opponent_id OR status = 'waiting');

CREATE POLICY "Users can create battles"
ON public.quiz_battles FOR INSERT
WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update battles they participate in"
ON public.quiz_battles FOR UPDATE
USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- Parents can view children streaks
CREATE POLICY "Parents can view children streaks"
ON public.learning_streaks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM parent_children
  WHERE parent_children.parent_id = auth.uid()
  AND parent_children.child_id = learning_streaks.user_id
));

-- Parents can view children activities
CREATE POLICY "Parents can view children activities"
ON public.daily_activities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM parent_children
  WHERE parent_children.parent_id = auth.uid()
  AND parent_children.child_id = daily_activities.user_id
));

-- Function to update streaks
CREATE OR REPLACE FUNCTION public.update_learning_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_record learning_streaks%ROWTYPE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Get or create streak record
  SELECT * INTO streak_record FROM learning_streaks WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    INSERT INTO learning_streaks (user_id, current_streak, longest_streak, last_activity_date, total_xp)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE, NEW.xp_earned);
  ELSE
    IF streak_record.last_activity_date = CURRENT_DATE THEN
      -- Already logged today, just update XP
      UPDATE learning_streaks 
      SET total_xp = total_xp + NEW.xp_earned,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF streak_record.last_activity_date = yesterday THEN
      -- Continue streak
      UPDATE learning_streaks 
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = CURRENT_DATE,
          total_xp = total_xp + NEW.xp_earned,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE learning_streaks 
      SET current_streak = 1,
          last_activity_date = CURRENT_DATE,
          total_xp = total_xp + NEW.xp_earned,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update streaks
CREATE TRIGGER on_daily_activity_insert
AFTER INSERT ON public.daily_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_learning_streak();

-- Enable realtime for quiz battles
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_battles;