-- Add parent role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';

-- Daily Challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  bonus_points INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily Challenge Completions
CREATE TABLE public.daily_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Study Groups
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Study Group Members
CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Parent-Child relationship
CREATE TABLE public.parent_children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

-- RLS for daily_challenges (viewable by everyone)
CREATE POLICY "Daily challenges viewable by all" ON public.daily_challenges
FOR SELECT USING (true);

CREATE POLICY "Teachers can manage daily challenges" ON public.daily_challenges
FOR ALL USING (has_role(auth.uid(), 'teacher'));

-- RLS for daily_challenge_completions
CREATE POLICY "Users can view own completions" ON public.daily_challenge_completions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON public.daily_challenge_completions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for study_groups
CREATE POLICY "Class members can view study groups" ON public.study_groups
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_members WHERE class_members.class_id = study_groups.class_id AND class_members.student_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM classes WHERE classes.id = study_groups.class_id AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can create study groups" ON public.study_groups
FOR INSERT WITH CHECK (
  auth.uid() = creator_id AND
  EXISTS (
    SELECT 1 FROM class_members WHERE class_members.class_id = study_groups.class_id AND class_members.student_id = auth.uid()
  )
);

CREATE POLICY "Creators can delete study groups" ON public.study_groups
FOR DELETE USING (auth.uid() = creator_id);

-- RLS for study_group_members
CREATE POLICY "Group members can view members" ON public.study_group_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM study_group_members sgm WHERE sgm.group_id = study_group_members.group_id AND sgm.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM study_groups sg 
    JOIN classes c ON c.id = sg.class_id 
    WHERE sg.id = study_group_members.group_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Class members can join groups" ON public.study_group_members
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM study_groups sg
    JOIN class_members cm ON cm.class_id = sg.class_id
    WHERE sg.id = study_group_members.group_id AND cm.student_id = auth.uid()
  )
);

CREATE POLICY "Users can leave groups" ON public.study_group_members
FOR DELETE USING (auth.uid() = user_id);

-- RLS for parent_children
CREATE POLICY "Parents can view own children" ON public.parent_children
FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can add children" ON public.parent_children
FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can remove children" ON public.parent_children
FOR DELETE USING (auth.uid() = parent_id);

-- Allow parents to view their children's profiles
CREATE POLICY "Parents can view children profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children WHERE parent_children.parent_id = auth.uid() AND parent_children.child_id = profiles.id
  )
);

-- Allow parents to view children's progress
CREATE POLICY "Parents can view children progress" ON public.user_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children WHERE parent_children.parent_id = auth.uid() AND parent_children.child_id = user_progress.user_id
  )
);

-- Allow parents to view children's game sessions
CREATE POLICY "Parents can view children sessions" ON public.game_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children WHERE parent_children.parent_id = auth.uid() AND parent_children.child_id = game_sessions.user_id
  )
);

-- Allow parents to view children's badges
CREATE POLICY "Parents can view children badges" ON public.user_badges
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children WHERE parent_children.parent_id = auth.uid() AND parent_children.child_id = user_badges.user_id
  )
);