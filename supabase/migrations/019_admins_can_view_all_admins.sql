-- Lets an existing admin see the full list of admins (for the in-app
-- "Admins" view), without recursion.
--
-- This is safe (non-recursive) because the EXISTS subquery's own row —
-- WHERE user_id = auth.uid() — is already visible to the querying user via
-- the existing "app_admins_self_select" policy (auth.uid() = user_id,
-- no subquery), so Postgres can satisfy the OR of policies without ever
-- needing to re-evaluate this new policy for that row.

CREATE POLICY "app_admins_admin_select_all"
  ON public.app_admins FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = auth.uid())
  );
