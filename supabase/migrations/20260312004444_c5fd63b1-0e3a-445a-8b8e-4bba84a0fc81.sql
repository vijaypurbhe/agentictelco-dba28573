CREATE POLICY "Allow anonymous select" ON public.login_audit_log
  FOR SELECT TO anon USING (true);