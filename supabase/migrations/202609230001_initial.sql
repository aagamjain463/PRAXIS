create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;

create type public.insight_visibility as enum ('private', 'unlisted', 'public');
create type public.action_kind as enum ('task', 'scheduled', 'habit', 'experiment', 'decision_rule', 'contextual');
create type public.action_state as enum ('active', 'completed', 'paused', 'cancelled');
create type public.action_priority as enum ('low', 'medium', 'high');
create type public.execution_state as enum ('yes', 'partial', 'no');
create type public.helpfulness as enum ('helpful', 'neutral', 'unhelpful', 'unclear');
create type public.interaction_kind as enum ('save', 'applied', 'helpful', 'did_not_work');
create type public.source_kind as enum ('article', 'book', 'podcast', 'youtube', 'newsletter', 'x', 'instagram', 'course', 'pdf', 'conversation', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null default '',
  bio text not null default '' check (char_length(bio) <= 500),
  avatar_url text,
  interests text[] not null default '{}',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  profile_visibility text not null default 'public' check (profile_visibility in ('public', 'private')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  improvement_areas text[] not null default '{}',
  content_types text[] not null default '{}',
  friction text[] not null default '{}',
  timezone text not null default 'UTC',
  default_visibility public.insight_visibility not null default 'private',
  ai_enabled boolean not null default true,
  allow_private_ai boolean not null default true,
  email_reminders boolean not null default false,
  in_app_notifications boolean not null default true,
  quiet_hours_start time,
  quiet_hours_end time,
  weekly_review_day smallint not null default 1 check (weekly_review_day between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  description text not null default '' check (char_length(description) <= 2000),
  status text not null default 'active' check (status in ('active', 'completed', 'paused', 'archived')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type public.source_kind not null default 'other',
  title text not null default '' check (char_length(title) <= 500),
  creator text not null default '' check (char_length(creator) <= 240),
  publisher text not null default '' check (char_length(publisher) <= 240),
  url text check (url is null or char_length(url) <= 2048),
  thumbnail_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  content text not null check (char_length(content) between 1 and 10000),
  quick_note text not null default '' check (char_length(quick_note) <= 2000),
  captured_at timestamptz not null default now(),
  processed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capture_id uuid references public.captures(id) on delete set null,
  title text not null check (char_length(title) between 1 and 240),
  body text not null check (char_length(body) between 1 and 10000),
  interpretation text not null default '' check (char_length(interpretation) <= 10000),
  actionability text not null default 'not_now' check (actionability in ('yes', 'not_now', 'no_action', 'maybe_later')),
  visibility public.insight_visibility not null default 'private',
  slug text unique,
  public_application text not null default '' check (char_length(public_application) <= 4000),
  public_outcome text not null default '' check (char_length(public_outcome) <= 4000),
  published_at timestamptz,
  last_used_at timestamptz,
  deleted_at timestamptz,
  embedding extensions.vector(1536),
  search_document tsvector generated always as (
    to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(body, '') || ' ' || coalesce(interpretation, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publication_is_explicit check (
    (visibility = 'private' and published_at is null) or
    (visibility in ('unlisted', 'public'))
  )
);

create table public.insight_sources (
  insight_id uuid not null references public.insights(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  is_primary boolean not null default false,
  excerpt text not null default '' check (char_length(excerpt) <= 4000),
  primary key (insight_id, source_id)
);

create table public.insight_goals (
  insight_id uuid not null references public.insights(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  primary key (insight_id, goal_id)
);

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_id uuid references public.insights(id) on delete set null,
  origin_public_insight_id uuid references public.insights(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null check (char_length(title) between 1 and 240),
  description text not null default '' check (char_length(description) <= 4000),
  action_type public.action_kind not null default 'task',
  status public.action_state not null default 'active',
  priority public.action_priority not null default 'medium',
  context text not null default '' check (char_length(context) <= 500),
  start_at timestamptz,
  due_at timestamptz,
  recurrence jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.action_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid not null references public.actions(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  unique (action_id, scheduled_for)
);

create table public.action_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid references public.actions(id) on delete cascade,
  remind_at timestamptz not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'email')),
  sent_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid not null references public.actions(id) on delete cascade,
  execution public.execution_state not null,
  description text not null default '' check (char_length(description) <= 10000),
  insight_helpfulness public.helpfulness not null default 'unclear',
  apply_again text not null default 'maybe' check (apply_again in ('yes', 'maybe', 'no')),
  metric_label text not null default '' check (char_length(metric_label) <= 120),
  metric_value numeric,
  metric_text text not null default '' check (char_length(metric_text) <= 500),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.context_triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_id uuid not null references public.insights(id) on delete cascade,
  trigger_type text not null check (trigger_type in ('user', 'goal', 'time', 'action', 'topic')),
  label text not null check (char_length(label) between 1 and 240),
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  slug text not null,
  unique (user_id, slug)
);

create table public.insight_tags (
  insight_id uuid not null references public.insights(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (insight_id, tag_id)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  description text not null default '' check (char_length(description) <= 2000),
  visibility public.insight_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_items (
  collection_id uuid not null references public.collections(id) on delete cascade,
  insight_id uuid not null references public.insights(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (collection_id, insight_id)
);

create table public.public_interactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_id uuid not null references public.insights(id) on delete cascade,
  kind public.interaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (user_id, insight_id, kind)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_id uuid not null references public.insights(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('action_due', 'habit', 'inbox', 'review', 'context', 'outcome', 'experiment', 'social')),
  title text not null check (char_length(title) between 1 and 240),
  body text not null default '' check (char_length(body) <= 1000),
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  scope text not null default 'personal' check (scope in ('personal', 'community')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.extension_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Browser extension' check (char_length(label) <= 120),
  token_hash text not null unique,
  last_four text not null check (char_length(last_four) = 4),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  insight_id uuid references public.insights(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'copyright', 'misinformation', 'other')),
  details text not null default '' check (char_length(details) <= 2000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  check ((insight_id is not null)::integer + (comment_id is not null)::integer = 1)
);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key (key, window_start)
);

create index captures_user_unprocessed_idx on public.captures (user_id, captured_at desc) where processed_at is null and archived_at is null;
create index insights_user_created_idx on public.insights (user_id, created_at desc) where deleted_at is null;
create index insights_search_idx on public.insights using gin (search_document);
create index insights_embedding_idx on public.insights using hnsw (embedding extensions.vector_cosine_ops) where embedding is not null;
create index insights_public_idx on public.insights (published_at desc) where visibility = 'public' and deleted_at is null;
create index actions_user_due_idx on public.actions (user_id, due_at) where status = 'active';
create index reminders_due_idx on public.action_reminders (remind_at) where sent_at is null and cancelled_at is null;
create index outcomes_action_idx on public.outcomes (action_id, recorded_at desc);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index comments_insight_idx on public.comments (insight_id, created_at);
create index interactions_insight_idx on public.public_interactions (insight_id, kind);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_timezone()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Invalid timezone';
  end if;
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger preferences_updated before update on public.user_preferences for each row execute function public.set_updated_at();
create trigger preferences_timezone before insert or update of timezone on public.user_preferences for each row execute function public.validate_timezone();
create trigger goals_updated before update on public.goals for each row execute function public.set_updated_at();
create trigger captures_updated before update on public.captures for each row execute function public.set_updated_at();
create trigger insights_updated before update on public.insights for each row execute function public.set_updated_at();
create trigger actions_updated before update on public.actions for each row execute function public.set_updated_at();
create trigger collections_updated before update on public.collections for each row execute function public.set_updated_at();
create trigger conversations_updated before update on public.ai_conversations for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)));
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.create_capture(
  capture_content text,
  capture_note text default '',
  capture_source_type public.source_kind default 'other',
  capture_source_url text default null,
  capture_source_title text default '',
  capture_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  new_source_id uuid;
  new_capture_id uuid;
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if char_length(trim(capture_content)) not between 1 and 10000 then raise exception 'Invalid capture content'; end if;
  if capture_source_url is not null or trim(capture_source_title) <> '' or capture_source_type <> 'other' then
    insert into public.sources (user_id, source_type, title, creator, url, thumbnail_url, metadata)
    values (owner_id, capture_source_type, left(capture_source_title, 500), left(coalesce(capture_metadata ->> 'creator', ''), 240), nullif(capture_source_url, ''), nullif(capture_metadata ->> 'thumbnail_url', ''), capture_metadata)
    returning id into new_source_id;
  end if;
  insert into public.captures (user_id, source_id, content, quick_note)
  values (owner_id, new_source_id, trim(capture_content), left(coalesce(capture_note, ''), 2000))
  returning id into new_capture_id;
  return new_capture_id;
end;
$$;

create or replace function public.process_capture(
  target_capture_id uuid,
  insight_title text,
  insight_body text,
  personal_interpretation text,
  selected_actionability text,
  action_title text default null,
  selected_action_type public.action_kind default 'task',
  action_due_at timestamptz default null
)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  new_insight_id uuid;
  linked_source uuid;
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.captures where id = target_capture_id and user_id = owner_id and processed_at is null) then
    raise exception 'Capture unavailable';
  end if;
  select source_id into linked_source from public.captures where id = target_capture_id;
  insert into public.insights (user_id, capture_id, title, body, interpretation, actionability)
  values (owner_id, target_capture_id, left(trim(insight_title), 240), trim(insight_body), trim(personal_interpretation), selected_actionability)
  returning id into new_insight_id;
  if linked_source is not null then
    insert into public.insight_sources (insight_id, source_id, is_primary) values (new_insight_id, linked_source, true);
  end if;
  if selected_actionability = 'yes' and nullif(trim(action_title), '') is not null then
    insert into public.actions (user_id, insight_id, title, action_type, due_at)
    values (owner_id, new_insight_id, left(trim(action_title), 240), selected_action_type, action_due_at);
  end if;
  update public.captures set processed_at = now() where id = target_capture_id and user_id = owner_id;
  return new_insight_id;
end;
$$;

create or replace function public.complete_action_with_outcome(
  target_action_id uuid,
  execution_state public.execution_state,
  outcome_description text,
  helpfulness_state public.helpfulness,
  apply_again_state text
)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  new_outcome_id uuid;
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.actions where id = target_action_id and user_id = owner_id) then raise exception 'Action unavailable'; end if;
  update public.actions set status = 'completed', completed_at = now() where id = target_action_id and user_id = owner_id;
  insert into public.outcomes (user_id, action_id, execution, description, insight_helpfulness, apply_again)
  values (owner_id, target_action_id, execution_state, left(coalesce(outcome_description, ''), 10000), helpfulness_state, apply_again_state)
  returning id into new_outcome_id;
  return new_outcome_id;
end;
$$;

create or replace function public.search_my_knowledge(query_text text, query_embedding extensions.vector(1536) default null, match_count integer default 20)
returns table (
  id uuid, title text, body text, interpretation text, visibility public.insight_visibility,
  created_at timestamptz, text_rank real, semantic_rank real, action_title text, outcome_text text
)
language sql stable security invoker set search_path = ''
as $$
  select i.id, i.title, i.body, i.interpretation, i.visibility, i.created_at,
    case when trim(query_text) = '' then 0::real else ts_rank(i.search_document, websearch_to_tsquery('english', query_text)) end,
    case when query_embedding is null or i.embedding is null then 0::real else (1 - (i.embedding operator(extensions.<=>) query_embedding))::real end,
    a.title,
    o.description
  from public.insights i
  left join lateral (
    select title, id from public.actions where insight_id = i.id and user_id = auth.uid() order by created_at desc limit 1
  ) a on true
  left join lateral (
    select description from public.outcomes where action_id = a.id and user_id = auth.uid() order by recorded_at desc limit 1
  ) o on true
  where i.user_id = auth.uid() and i.deleted_at is null
    and (trim(query_text) = '' or i.search_document @@ websearch_to_tsquery('english', query_text) or (query_embedding is not null and i.embedding is not null))
  order by (case when trim(query_text) = '' then 0 else ts_rank(i.search_document, websearch_to_tsquery('english', query_text)) end) +
    (case when query_embedding is null or i.embedding is null then 0 else 1 - (i.embedding operator(extensions.<=>) query_embedding) end) desc,
    i.created_at desc
  limit least(greatest(match_count, 1), 50);
$$;

create or replace function public.get_shared_insight(shared_slug text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', i.id,
    'user_id', i.user_id,
    'title', i.title,
    'body', i.body,
    'interpretation', i.interpretation,
    'slug', i.slug,
    'public_application', i.public_application,
    'public_outcome', i.public_outcome,
    'published_at', i.published_at,
    'visibility', i.visibility,
    'source_links', coalesce((
      select jsonb_agg(jsonb_build_object(
        'excerpt', link.excerpt,
        'source', jsonb_build_object('title', s.title, 'creator', s.creator, 'url', s.url, 'source_type', s.source_type)
      ))
      from public.insight_sources link join public.sources s on s.id = link.source_id
      where link.insight_id = i.id
    ), '[]'::jsonb)
  )
  from public.insights i
  where i.slug = shared_slug and i.visibility in ('public', 'unlisted') and i.published_at is not null and i.deleted_at is null
  limit 1;
$$;

create or replace function public.check_rate_limit(rate_key text, max_requests integer, window_seconds integer)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / window_seconds) * window_seconds);
  new_count integer;
begin
  insert into public.rate_limits(key, window_start, count) values (rate_key, bucket, 1)
  on conflict (key, window_start) do update set count = public.rate_limits.count + 1
  returning count into new_count;
  return new_count <= max_requests;
end;
$$;

create or replace function public.claim_due_reminders(batch_size integer default 100)
returns table (reminder_id uuid, reminder_user_id uuid, action_id uuid, action_title text, channel text)
language plpgsql security definer set search_path = ''
as $$
begin
  return query
  with due as (
    select r.id
    from public.action_reminders r
    join public.user_preferences p on p.user_id = r.user_id
    where r.sent_at is null and r.cancelled_at is null and r.remind_at <= now()
      and (
        p.quiet_hours_start is null or p.quiet_hours_end is null or
        case when p.quiet_hours_start < p.quiet_hours_end
          then (now() at time zone p.timezone)::time not between p.quiet_hours_start and p.quiet_hours_end
          else not ((now() at time zone p.timezone)::time >= p.quiet_hours_start or (now() at time zone p.timezone)::time <= p.quiet_hours_end)
        end
      )
    order by r.remind_at
    for update skip locked
    limit least(greatest(batch_size, 1), 500)
  ), claimed as (
    update public.action_reminders r set sent_at = now()
    from due where r.id = due.id
    returning r.id, r.user_id, r.action_id, r.channel
  )
  select c.id, c.user_id, c.action_id, a.title, c.channel
  from claimed c join public.actions a on a.id = c.action_id;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
revoke all on function public.claim_due_reminders(integer) from public, anon, authenticated;
grant execute on function public.claim_due_reminders(integer) to service_role;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.goals enable row level security;
alter table public.sources enable row level security;
alter table public.captures enable row level security;
alter table public.insights enable row level security;
alter table public.insight_sources enable row level security;
alter table public.insight_goals enable row level security;
alter table public.actions enable row level security;
alter table public.action_occurrences enable row level security;
alter table public.action_reminders enable row level security;
alter table public.outcomes enable row level security;
alter table public.context_triggers enable row level security;
alter table public.tags enable row level security;
alter table public.insight_tags enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.public_interactions enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.extension_tokens enable row level security;
alter table public.reports enable row level security;
alter table public.rate_limits enable row level security;

create policy "profiles visible when public or self" on public.profiles for select using (profile_visibility = 'public' or id = auth.uid());
create policy "users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "users read own preferences" on public.user_preferences for select using (user_id = auth.uid());
create policy "users update own preferences" on public.user_preferences for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users own goals" on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own sources" on public.sources for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own captures" on public.captures for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owners and public readers see insights" on public.insights for select using (
  user_id = auth.uid() or (visibility = 'public' and published_at is not null and deleted_at is null)
);
create policy "users insert own insights" on public.insights for insert with check (user_id = auth.uid());
create policy "users update own insights" on public.insights for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users delete own insights" on public.insights for delete using (user_id = auth.uid());

create policy "owners read insight sources" on public.insight_sources for select using (exists (select 1 from public.insights i where i.id = insight_id and i.user_id = auth.uid()));
create policy "owners manage insight sources" on public.insight_sources for all using (exists (select 1 from public.insights i where i.id = insight_id and i.user_id = auth.uid())) with check (exists (select 1 from public.insights i where i.id = insight_id and i.user_id = auth.uid()));
create policy "owners manage insight goals" on public.insight_goals for all using (exists (select 1 from public.insights i where i.id = insight_id and i.user_id = auth.uid())) with check (exists (select 1 from public.insights i where i.id = insight_id and i.user_id = auth.uid()));

create policy "users own actions" on public.actions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own occurrences" on public.action_occurrences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own reminders" on public.action_reminders for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own outcomes" on public.outcomes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own triggers" on public.context_triggers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own tags" on public.tags for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own insight tags" on public.insight_tags for all using (exists (select 1 from public.insights i where i.id = insight_id and i.user_id = auth.uid())) with check (exists (select 1 from public.insights i where i.id = insight_id and i.user_id = auth.uid()));

create policy "collections visible when public or self" on public.collections for select using (user_id = auth.uid() or visibility = 'public');
create policy "users manage own collections" on public.collections for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "collection items visible through collection" on public.collection_items for select using (exists (select 1 from public.collections c where c.id = collection_id and (c.user_id = auth.uid() or c.visibility = 'public')));
create policy "owners manage collection items" on public.collection_items for all using (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())) with check (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid()));

create policy "public interactions visible" on public.public_interactions for select using (exists (select 1 from public.insights i where i.id = insight_id and i.visibility = 'public' and i.deleted_at is null));
create policy "users manage own interactions" on public.public_interactions for all using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.insights i where i.id = insight_id and i.visibility = 'public' and i.deleted_at is null));

create policy "comments visible on public insights" on public.comments for select using (exists (select 1 from public.insights i where i.id = insight_id and i.visibility = 'public' and i.deleted_at is null));
create policy "users add public comments" on public.comments for insert with check (user_id = auth.uid() and exists (select 1 from public.insights i where i.id = insight_id and i.visibility = 'public' and i.deleted_at is null));
create policy "users update own comments" on public.comments for update using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.insights i where i.id = insight_id and i.visibility = 'public' and i.deleted_at is null));
create policy "users delete own comments" on public.comments for delete using (user_id = auth.uid());

create policy "follows visible" on public.follows for select using (true);
create policy "users manage own follows" on public.follows for all using (follower_id = auth.uid()) with check (follower_id = auth.uid());
create policy "users own notifications" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own conversations" on public.ai_conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own ai messages" on public.ai_messages for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own extension tokens" on public.extension_tokens for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users create and view own reports" on public.reports for select using (reporter_id = auth.uid());
create policy "users create reports" on public.reports for insert with check (reporter_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.insights, public.collections, public.collection_items, public.public_interactions, public.comments, public.follows to anon;
grant select, insert, update, delete on public.profiles, public.user_preferences, public.goals, public.sources, public.captures, public.insights, public.insight_sources, public.insight_goals, public.actions, public.action_occurrences, public.action_reminders, public.outcomes, public.context_triggers, public.tags, public.insight_tags, public.collections, public.collection_items, public.public_interactions, public.comments, public.follows, public.notifications, public.ai_conversations, public.ai_messages, public.extension_tokens, public.reports to authenticated;
revoke all on public.rate_limits from anon, authenticated;

grant execute on function public.search_my_knowledge(text, extensions.vector, integer) to authenticated;
grant execute on function public.get_shared_insight(text) to anon, authenticated;
grant execute on function public.create_capture(text, text, public.source_kind, text, text, jsonb) to authenticated;
grant execute on function public.process_capture(uuid, text, text, text, text, text, public.action_kind, timestamptz) to authenticated;
grant execute on function public.complete_action_with_outcome(uuid, public.execution_state, text, public.helpfulness, text) to authenticated;
