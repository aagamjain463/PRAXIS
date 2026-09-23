-- Import compatible legacy rows. Original rows remain in praxis_legacy_20260923.
insert into public.profiles (id, display_name, onboarding_completed_at)
select id, coalesce(raw_user_meta_data ->> 'display_name', split_part(coalesce(email, ''), '@', 1)), now()
from auth.users
on conflict (id) do nothing;

insert into public.user_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

do $$
begin
  if to_regclass('praxis_legacy_20260923.insights') is null then
    return;
  end if;

  insert into public.goals (id, user_id, title, description, status, created_at, updated_at)
  select id, user_id, left(name, 240), coalesce(description, ''),
    case when archived_at is null then 'active' else 'archived' end,
    created_at, updated_at
  from praxis_legacy_20260923.goals
  on conflict (id) do nothing;

  insert into public.sources (id, user_id, source_type, title, creator, url, metadata, created_at)
  select id, user_id,
    case source_type::text
      when 'book' then 'book'::public.source_kind
      when 'article' then 'article'::public.source_kind
      when 'youtube' then 'youtube'::public.source_kind
      when 'podcast' then 'podcast'::public.source_kind
      when 'newsletter' then 'newsletter'::public.source_kind
      when 'course' then 'course'::public.source_kind
      when 'conversation' then 'conversation'::public.source_kind
      when 'pdf' then 'pdf'::public.source_kind
      else 'other'::public.source_kind
    end,
    left(coalesce(source_title, ''), 500), left(coalesce(source_creator, ''), 240),
    nullif(left(coalesce(source_url, ''), 2048), ''),
    jsonb_strip_nulls(jsonb_build_object('legacy_location', source_location)), created_at
  from praxis_legacy_20260923.insights
  where source_type is not null or source_url is not null or source_title is not null
  on conflict (id) do nothing;

  insert into public.insights (
    id, user_id, title, body, interpretation, actionability, visibility, created_at, updated_at
  )
  select id, user_id,
    left(coalesce(nullif(trim(source_title), ''), nullif(split_part(trim(content), E'\n', 1), ''), 'Imported insight'), 240),
    left(content, 10000), left(coalesce(interpretation, ''), 10000),
    case when intent::text = 'apply' then 'yes' else 'not_now' end,
    'private'::public.insight_visibility, created_at, updated_at
  from praxis_legacy_20260923.insights
  on conflict (id) do nothing;

  insert into public.insight_sources (insight_id, source_id, is_primary)
  select id, id, true from praxis_legacy_20260923.insights
  where source_type is not null or source_url is not null or source_title is not null
  on conflict do nothing;

  insert into public.actions (
    id, user_id, insight_id, goal_id, title, description, action_type, status,
    context, due_at, completed_at, created_at, updated_at
  )
  select id, user_id, insight_id, goal_id, left(title, 240), left(coalesce(details, ''), 4000),
    case when kind::text = 'experiment' then 'experiment'::public.action_kind else 'task'::public.action_kind end,
    case when status::text = 'completed' then 'completed'::public.action_state else 'active'::public.action_state end,
    left(coalesce(success_condition, ''), 500), due_at, completed_at, created_at, updated_at
  from praxis_legacy_20260923.actions
  on conflict (id) do nothing;

  insert into public.insight_goals (insight_id, goal_id)
  select insight_id, goal_id from praxis_legacy_20260923.insight_goals
  on conflict do nothing;

  insert into public.outcomes (
    id, user_id, action_id, execution, description, insight_helpfulness, apply_again, recorded_at, created_at
  )
  select id, user_id, action_id, 'yes'::public.execution_state, left(result, 10000),
    case effect::text
      when 'helped' then 'helpful'::public.helpfulness
      when 'did_not_help' then 'unhelpful'::public.helpfulness
      else 'neutral'::public.helpfulness
    end,
    case effect::text when 'helped' then 'yes' when 'did_not_help' then 'no' else 'maybe' end,
    created_at, created_at
  from praxis_legacy_20260923.action_outcomes
  on conflict (id) do nothing;

  update public.user_preferences p
  set ai_enabled = s.ai_enabled,
      default_visibility = case when s.public_sharing_default then 'public' else 'private' end::public.insight_visibility
  from praxis_legacy_20260923.user_settings s
  where p.user_id = s.user_id;
end;
$$;
