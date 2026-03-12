CREATE TABLE public.login_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  logged_in_at timestamptz NOT NULL DEFAULT now(),
  user_agent text
);

ALTER TABLE public.login_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.login_audit_log
  FOR INSERT TO anon WITH CHECK (true);