begin;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'praxis-a@example.test', extensions.crypt('test-password', extensions.gen_salt('bf')), now(), '{}', '{"display_name":"User A"}'),
  ('20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'praxis-b@example.test', extensions.crypt('test-password', extensions.gen_salt('bf')), now(), '{}', '{"display_name":"User B"}');

insert into public.captures (id, user_id, content)
values
  ('11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Private capture A'),
  ('22000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Private capture B');

insert into public.insights (id, user_id, title, body, visibility, slug, published_at)
values
  ('21000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'Private insight B', 'Must stay private', 'private', null, null),
  ('22000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'Unlisted insight B', 'Visible only through sanitized RPC', 'unlisted', 'share-test-token', now()),
  ('23000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'Public insight B', 'Safe public evidence', 'public', 'public-test', now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
declare visible integer;
begin
  select count(*) into visible from public.captures where user_id = '20000000-0000-4000-8000-000000000002';
  if visible <> 0 then raise exception 'RLS leaked another user capture'; end if;

  select count(*) into visible from public.insights where user_id = '20000000-0000-4000-8000-000000000002';
  if visible <> 1 then raise exception 'RLS must expose only the public insight'; end if;

  if public.get_shared_insight('share-test-token') is null then raise exception 'Unlisted share RPC did not return sanitized insight'; end if;
end;
$$;

do $$
begin
  begin
    insert into public.actions (user_id, title) values ('20000000-0000-4000-8000-000000000002', 'Forbidden action');
    raise exception 'RLS allowed cross-user action insert';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

rollback;
