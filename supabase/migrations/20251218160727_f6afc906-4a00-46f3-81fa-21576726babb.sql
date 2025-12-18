-- Create discussions table for class forums
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discussion replies table
CREATE TABLE public.discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussions
CREATE POLICY "Class members can view discussions"
ON public.discussions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM class_members 
    WHERE class_members.class_id = discussions.class_id 
    AND class_members.student_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = discussions.class_id 
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Class members can create discussions"
ON public.discussions FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM class_members 
      WHERE class_members.class_id = discussions.class_id 
      AND class_members.student_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = discussions.class_id 
      AND classes.teacher_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete own discussions"
ON public.discussions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for replies
CREATE POLICY "Class members can view replies"
ON public.discussion_replies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM discussions d
    JOIN class_members cm ON cm.class_id = d.class_id
    WHERE d.id = discussion_replies.discussion_id
    AND cm.student_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM discussions d
    JOIN classes c ON c.id = d.class_id
    WHERE d.id = discussion_replies.discussion_id
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Class members can create replies"
ON public.discussion_replies FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM discussions d
      JOIN class_members cm ON cm.class_id = d.class_id
      WHERE d.id = discussion_replies.discussion_id
      AND cm.student_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM discussions d
      JOIN classes c ON c.id = d.class_id
      WHERE d.id = discussion_replies.discussion_id
      AND c.teacher_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete own replies"
ON public.discussion_replies FOR DELETE
USING (auth.uid() = user_id);