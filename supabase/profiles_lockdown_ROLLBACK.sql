-- ============================================================
-- ROLLBACK — undo profiles_column_lockdown.sql
-- RUN THIS NOW. It restores the grants Supabase ships with and brings
-- signup, login, profiles, levels and gates back immediately.
--
-- Why the lockdown broke everything: column-level GRANTs are incompatible with
-- `select('*')`, and AuthContext.fetchProfile selects * from profiles on every
-- session load. Postgres expands * to every column, sees a column the role was
-- not granted, and refuses the whole statement — hence "permission denied for
-- table profiles" on the signup and login screens, and every downstream
-- symptom (no name, no level, no gate access) since the profile never loads.
-- ============================================================

-- Clear the column-level grants (they linger independently of table grants)
revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;

-- Restore the Supabase defaults
grant all on public.profiles to anon;
grant all on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Row-level security is untouched by this file: whatever policies existed
-- before (e.g. profiles_update_own) are still in force.

-- ── VERIFY ──────────────────────────────────────────────────
-- Expect a row back, and the app to work again:
--   select id, name from public.profiles limit 1;
