-- Create chapters table for organizing topics by grade and semester
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 12),
  semester INTEGER CHECK (semester IN (1, 2)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create question_banks table for storing quiz questions
CREATE TABLE public.question_banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  difficulty difficulty NOT NULL DEFAULT 'medium',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  hints JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  video_explanation_url TEXT,
  source TEXT,
  times_answered INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create topic_statistics table for tracking user progress per topic
CREATE TABLE public.topic_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  average_time_seconds INTEGER DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  mastery_score DECIMAL(5,2) DEFAULT 0,
  weak_areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Create quiz_sessions table for tracking quiz attempts with different modes
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  quiz_mode TEXT NOT NULL DEFAULT 'quick',
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  questions_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Chapters policies (publicly viewable)
CREATE POLICY "Chapters are viewable by everyone" 
ON public.chapters FOR SELECT 
USING (true);

CREATE POLICY "Teachers can manage chapters" 
ON public.chapters FOR ALL 
USING (has_role(auth.uid(), 'teacher'));

-- Question banks policies (publicly viewable)
CREATE POLICY "Question banks are viewable by everyone" 
ON public.question_banks FOR SELECT 
USING (true);

CREATE POLICY "Teachers can manage question banks" 
ON public.question_banks FOR ALL 
USING (has_role(auth.uid(), 'teacher'));

-- Topic statistics policies (user-specific)
CREATE POLICY "Users can view own statistics" 
ON public.topic_statistics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics" 
ON public.topic_statistics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics" 
ON public.topic_statistics FOR UPDATE 
USING (auth.uid() = user_id);

-- Quiz sessions policies (user-specific)
CREATE POLICY "Users can view own quiz sessions" 
ON public.quiz_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz sessions" 
ON public.quiz_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz sessions" 
ON public.quiz_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updating topic_statistics updated_at
CREATE TRIGGER update_topic_statistics_updated_at
BEFORE UPDATE ON public.topic_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();