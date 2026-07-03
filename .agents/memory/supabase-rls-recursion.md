---
name: Supabase RLS self-referencing recursion
description: How to safely write "admin can read all rows" RLS policies without triggering infinite recursion errors in Postgres/Supabase.
---

A SELECT policy on table `T` must never check the current user's own
privilege flag by querying `T` itself in an `EXISTS (SELECT ... FROM T ...)`
subquery. Postgres evaluates that subquery under `T`'s own RLS policies
(including the very policy being defined), which recurses infinitely and
fails at query time with: `infinite recursion detected in policy for
relation "T"`. This is easy to trigger accidentally when the privilege flag
(e.g. `is_creator`, `is_admin`) lives as a column on the same table you're
trying to grant broad read access to (e.g. `user_profiles`).

**Why:** This bit us building an admin "read all users' aggregate data"
policy on `user_profiles` — the natural-looking policy
`USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator))`
recurses because the subquery's `user_profiles` scan re-triggers the same
policy. It also does NOT help to move the check into a `SECURITY DEFINER`
function owned by `postgres`, because Supabase's cloud `postgres` role is
not a true superuser and does not bypass RLS from within such functions.

**How to apply:** Track the privilege flag in a small, separate table
(e.g. `app_admins(user_id uuid primary key)`) with a trivial, non-recursive
self-only policy (`USING (auth.uid() = user_id)`), then reference that
separate table — never the protected table itself — from every "admin can
read everything" policy: `EXISTS (SELECT 1 FROM app_admins WHERE user_id =
auth.uid())`. Backfill the admin table from the raw SQL editor (which isn't
subject to RLS) rather than through the app.
