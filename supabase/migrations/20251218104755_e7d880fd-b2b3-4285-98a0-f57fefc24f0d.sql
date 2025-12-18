-- Create enums
create type public.app_role as enum ('student', 'teacher');
create type public.education_level as enum ('sd', 'smp', 'sma');
create type public.game_type as enum ('quiz', 'drag_drop', 'memory', 'puzzle');
create type public.difficulty as enum ('easy', 'medium', 'hard');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  avatar_url text,
  education_level education_level,
  school_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- User roles table (separate for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- Subjects table
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  color text,
  created_at timestamp with time zone default now()
);

-- Topics table
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade not null,
  education_level education_level not null,
  name text not null,
  description text,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- Games table
create table public.games (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade not null,
  game_type game_type not null,
  title text not null,
  description text,
  difficulty difficulty default 'medium',
  time_limit_seconds integer default 60,
  points_per_correct integer default 10,
  created_at timestamp with time zone default now()
);

-- Questions table (for quiz and other games)
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade not null,
  question_text text not null,
  question_type text default 'multiple_choice',
  options jsonb,
  correct_answer text not null,
  explanation text,
  image_url text,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- Game sessions (tracking user play)
create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  score integer default 0,
  total_questions integer default 0,
  correct_answers integer default 0,
  time_spent_seconds integer default 0,
  completed boolean default false,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- User progress per topic
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete cascade not null,
  games_played integer default 0,
  total_score integer default 0,
  mastery_level integer default 0,
  last_played_at timestamp with time zone,
  unique (user_id, topic_id)
);

-- Badges/achievements
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  requirement_type text not null,
  requirement_value integer not null,
  created_at timestamp with time zone default now()
);

-- User badges
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default now(),
  unique (user_id, badge_id)
);

-- Classes (for teachers)
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  education_level education_level not null,
  join_code text unique,
  created_at timestamp with time zone default now()
);

-- Class members
create table public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamp with time zone default now(),
  unique (class_id, student_id)
);

-- Assignments
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  title text not null,
  due_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.games enable row level security;
alter table public.questions enable row level security;
alter table public.game_sessions enable row level security;
alter table public.user_progress enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;

-- Security definer function for role checking
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies

-- Profiles: users can view and update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- User roles: users can view their own roles
create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Users can insert own role on signup" on public.user_roles for insert with check (auth.uid() = user_id);

-- Subjects, Topics, Games, Questions: publicly readable
create policy "Subjects are viewable by everyone" on public.subjects for select using (true);
create policy "Topics are viewable by everyone" on public.topics for select using (true);
create policy "Games are viewable by everyone" on public.games for select using (true);
create policy "Questions are viewable by everyone" on public.questions for select using (true);

-- Teachers can manage content
create policy "Teachers can insert subjects" on public.subjects for insert with check (public.has_role(auth.uid(), 'teacher'));
create policy "Teachers can insert topics" on public.topics for insert with check (public.has_role(auth.uid(), 'teacher'));
create policy "Teachers can insert games" on public.games for insert with check (public.has_role(auth.uid(), 'teacher'));
create policy "Teachers can insert questions" on public.questions for insert with check (public.has_role(auth.uid(), 'teacher'));

-- Game sessions: users manage their own
create policy "Users can view own game sessions" on public.game_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own game sessions" on public.game_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own game sessions" on public.game_sessions for update using (auth.uid() = user_id);

-- User progress: users manage their own
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id);

-- Badges: publicly readable
create policy "Badges are viewable by everyone" on public.badges for select using (true);

-- User badges: users view their own
create policy "Users can view own badges" on public.user_badges for select using (auth.uid() = user_id);
create policy "Users can insert own badges" on public.user_badges for insert with check (auth.uid() = user_id);

-- Classes: teachers manage their own, students can view joined classes
create policy "Teachers can manage own classes" on public.classes for all using (auth.uid() = teacher_id);
create policy "Students can view joined classes" on public.classes for select using (
  exists (select 1 from public.class_members where class_id = classes.id and student_id = auth.uid())
);

-- Class members
create policy "Teachers can manage class members" on public.class_members for all using (
  exists (select 1 from public.classes where id = class_members.class_id and teacher_id = auth.uid())
);
create policy "Students can view own membership" on public.class_members for select using (auth.uid() = student_id);
create policy "Students can join classes" on public.class_members for insert with check (auth.uid() = student_id);

-- Assignments
create policy "Teachers can manage assignments" on public.assignments for all using (
  exists (select 1 from public.classes where id = assignments.class_id and teacher_id = auth.uid())
);
create policy "Students can view class assignments" on public.assignments for select using (
  exists (select 1 from public.class_members where class_id = assignments.class_id and student_id = auth.uid())
);

-- Teachers can view student progress in their classes
create policy "Teachers can view student progress" on public.user_progress for select using (
  public.has_role(auth.uid(), 'teacher') and exists (
    select 1 from public.class_members cm 
    join public.classes c on c.id = cm.class_id 
    where cm.student_id = user_progress.user_id and c.teacher_id = auth.uid()
  )
);

-- Teachers can view student game sessions
create policy "Teachers can view student sessions" on public.game_sessions for select using (
  public.has_role(auth.uid(), 'teacher') and exists (
    select 1 from public.class_members cm 
    join public.classes c on c.id = cm.class_id 
    where cm.student_id = game_sessions.user_id and c.teacher_id = auth.uid()
  )
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, education_level)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    (new.raw_user_meta_data ->> 'education_level')::education_level
  );
  
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'role')::app_role
  );
  
  return new;
end;
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profile updates
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Insert default subjects
insert into public.subjects (name, icon, color) values
  ('Matematika', '➗', '#FF6B6B'),
  ('Bahasa Indonesia', '📚', '#4ECDC4'),
  ('Bahasa Inggris', '🌍', '#45B7D1'),
  ('IPA', '🔬', '#96CEB4'),
  ('IPS', '🗺️', '#FFEAA7');

-- Insert sample topics
insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'sd', 'Penjumlahan', 'Belajar menjumlahkan angka', 1
from public.subjects s where s.name = 'Matematika';

insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'sd', 'Pengurangan', 'Belajar mengurangkan angka', 2
from public.subjects s where s.name = 'Matematika';

insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'smp', 'Aljabar Dasar', 'Pengenalan variabel dan persamaan', 1
from public.subjects s where s.name = 'Matematika';

insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'sma', 'Trigonometri', 'Sin, cos, tan dan aplikasinya', 1
from public.subjects s where s.name = 'Matematika';

insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'sd', 'Membaca Cerita', 'Latihan membaca dan memahami cerita', 1
from public.subjects s where s.name = 'Bahasa Indonesia';

insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'sd', 'Basic Vocabulary', 'Kosakata dasar bahasa Inggris', 1
from public.subjects s where s.name = 'Bahasa Inggris';

insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'sd', 'Tubuh Manusia', 'Mengenal bagian-bagian tubuh', 1
from public.subjects s where s.name = 'IPA';

insert into public.topics (subject_id, education_level, name, description, order_index)
select s.id, 'sd', 'Lingkungan Sekitar', 'Mengenal lingkungan dan masyarakat', 1
from public.subjects s where s.name = 'IPS';

-- Insert badges
insert into public.badges (name, description, icon, requirement_type, requirement_value) values
  ('Pemula', 'Selesaikan game pertamamu', 'star', 'games_completed', 1),
  ('Rajin Belajar', 'Selesaikan 10 game', 'trophy', 'games_completed', 10),
  ('Master', 'Selesaikan 50 game', 'crown', 'games_completed', 50),
  ('Perfect Score', 'Dapatkan skor sempurna', 'medal', 'perfect_score', 1),
  ('Streak 7 Hari', 'Main 7 hari berturut-turut', 'fire', 'daily_streak', 7);