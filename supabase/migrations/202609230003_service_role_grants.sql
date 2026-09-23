-- RLS bypass does not imply table privileges. Server-only jobs and admin flows need both.
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
