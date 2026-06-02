
-- 1) notifications: restrict INSERT to self
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2) questions / question_banks / tryout_questions: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
CREATE POLICY "Questions viewable by authenticated"
ON public.questions
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Question banks are viewable by everyone" ON public.question_banks;
CREATE POLICY "Question banks viewable by authenticated"
ON public.question_banks
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Tryout questions viewable by everyone" ON public.tryout_questions;
CREATE POLICY "Tryout questions viewable by authenticated"
ON public.tryout_questions
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.questions FROM anon;
REVOKE SELECT ON public.question_banks FROM anon;
REVOKE SELECT ON public.tryout_questions FROM anon;

-- 3) referral_codes: remove broad public select; add safe lookup function
DROP POLICY IF EXISTS "Referral codes viewable for lookup" ON public.referral_codes;

CREATE OR REPLACE FUNCTION public.lookup_referral_code(_code text)
RETURNS TABLE(id uuid, code text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, code FROM public.referral_codes WHERE code = _code LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_referral_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_referral_code(text) TO authenticated, anon;

-- 4) user_roles: prevent self-escalation; only allow inserting 'student'
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
CREATE POLICY "Users can self-assign student role only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'student'::app_role);
