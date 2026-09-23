-- Preserve the pre-production Praxis schema before installing the current model.
-- Rollback remains possible because original tables and rows are moved, not dropped.
do $$
declare
  relation_name text;
  type_name text;
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'insights' and column_name = 'content'
  ) then
    create schema if not exists praxis_legacy_20260923;

    foreach relation_name in array array[
      'action_outcomes', 'actions', 'goals', 'insight_goals', 'insight_resurfacing',
      'insights', 'public_applied_insights', 'user_settings'
    ] loop
      if to_regclass('public.' || relation_name) is not null then
        execute format('alter table public.%I set schema praxis_legacy_20260923', relation_name);
      end if;
    end loop;

    if to_regclass('public.public_applied_knowledge') is not null then
      alter view public.public_applied_knowledge set schema praxis_legacy_20260923;
    end if;

    foreach type_name in array array[
      'action_kind', 'action_status', 'insight_intent', 'insight_source_type', 'outcome_effect'
    ] loop
      if exists (
        select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
        where n.nspname = 'public' and t.typname = type_name
      ) then
        execute format('alter type public.%I set schema praxis_legacy_20260923', type_name);
      end if;
    end loop;
  end if;
end;
$$;
