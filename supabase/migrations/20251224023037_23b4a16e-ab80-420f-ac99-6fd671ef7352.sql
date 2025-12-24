-- Video Lessons Table
CREATE TABLE public.video_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_provider TEXT NOT NULL DEFAULT 'youtube',
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Video Progress Table
CREATE TABLE public.video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.video_lessons(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Learning Paths Table
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  education_level public.education_level NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Learning Path Nodes (skill tree nodes)
CREATE TABLE public.learning_path_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 100,
  order_index INTEGER DEFAULT 0,
  prerequisite_node_id UUID REFERENCES public.learning_path_nodes(id) ON DELETE SET NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Path Progress
CREATE TABLE public.user_path_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  node_id UUID NOT NULL REFERENCES public.learning_path_nodes(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, node_id)
);

-- Tryout Types (UTBK, UN, PTS, UAS)
CREATE TABLE public.tryout_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tryout Packages
CREATE TABLE public.tryout_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tryout_type_id UUID NOT NULL REFERENCES public.tryout_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  education_level public.education_level NOT NULL,
  total_questions INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tryout Sections (e.g., TPS, TKA for UTBK)
CREATE TABLE public.tryout_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tryout Questions
CREATE TABLE public.tryout_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.tryout_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium',
  points INTEGER DEFAULT 1,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Tryout Sessions
CREATE TABLE public.tryout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress',
  total_score INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  ranking INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Tryout Answers
CREATE TABLE public.tryout_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.tryout_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.tryout_questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- Enable RLS
ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_lessons
CREATE POLICY "Video lessons viewable by everyone" ON public.video_lessons FOR SELECT USING (true);
CREATE POLICY "Teachers can manage video lessons" ON public.video_lessons FOR ALL USING (has_role(auth.uid(), 'teacher'));

-- RLS Policies for video_progress
CREATE POLICY "Users can view own video progress" ON public.video_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own video progress" ON public.video_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own video progress" ON public.video_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_paths
CREATE POLICY "Learning paths viewable by everyone" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Teachers can manage learning paths" ON public.learning_paths FOR ALL USING (has_role(auth.uid(), 'teacher'));

-- RLS Policies for learning_path_nodes
CREATE POLICY "Learning path nodes viewable by everyone" ON public.learning_path_nodes FOR SELECT USING (true);
CREATE POLICY "Teachers can manage learning path nodes" ON public.learning_path_nodes FOR ALL USING (has_role(auth.uid(), 'teacher'));

-- RLS Policies for user_path_progress
CREATE POLICY "Users can view own path progress" ON public.user_path_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own path progress" ON public.user_path_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own path progress" ON public.user_path_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for tryout_types
CREATE POLICY "Tryout types viewable by everyone" ON public.tryout_types FOR SELECT USING (true);

-- RLS Policies for tryout_packages
CREATE POLICY "Tryout packages viewable by everyone" ON public.tryout_packages FOR SELECT USING (true);
CREATE POLICY "Teachers can manage tryout packages" ON public.tryout_packages FOR ALL USING (has_role(auth.uid(), 'teacher'));

-- RLS Policies for tryout_sections
CREATE POLICY "Tryout sections viewable by everyone" ON public.tryout_sections FOR SELECT USING (true);

-- RLS Policies for tryout_questions
CREATE POLICY "Tryout questions viewable by everyone" ON public.tryout_questions FOR SELECT USING (true);
CREATE POLICY "Teachers can manage tryout questions" ON public.tryout_questions FOR ALL USING (has_role(auth.uid(), 'teacher'));

-- RLS Policies for tryout_sessions
CREATE POLICY "Users can view own tryout sessions" ON public.tryout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tryout sessions" ON public.tryout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tryout sessions" ON public.tryout_sessions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for tryout_answers
CREATE POLICY "Users can view own tryout answers" ON public.tryout_answers FOR SELECT 
USING (EXISTS (SELECT 1 FROM tryout_sessions WHERE id = tryout_answers.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own tryout answers" ON public.tryout_answers FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM tryout_sessions WHERE id = tryout_answers.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own tryout answers" ON public.tryout_answers FOR UPDATE 
USING (EXISTS (SELECT 1 FROM tryout_sessions WHERE id = tryout_answers.session_id AND user_id = auth.uid()));

-- Insert default tryout types
INSERT INTO public.tryout_types (name, slug, description, duration_minutes, icon) VALUES
('UTBK SNBT', 'utbk', 'Ujian Tulis Berbasis Komputer untuk SNBT', 195, 'GraduationCap'),
('Ujian Nasional', 'un', 'Simulasi Ujian Nasional', 120, 'FileText'),
('Penilaian Tengah Semester', 'pts', 'Latihan Penilaian Tengah Semester', 90, 'ClipboardList'),
('Penilaian Akhir Semester', 'pas', 'Latihan Penilaian Akhir Semester', 120, 'Award');

-- Insert sample UTBK package
INSERT INTO public.tryout_packages (tryout_type_id, title, description, education_level, total_questions, is_premium)
SELECT id, 'Tryout UTBK 2024 - Paket 1', 'Simulasi UTBK SNBT 2024 lengkap dengan pembahasan', 'sma', 155, false
FROM public.tryout_types WHERE slug = 'utbk';