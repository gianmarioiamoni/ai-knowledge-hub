-- Add rich roles and invites, add disabled flags
set check_function_bodies = off;

create type public.user_role as enum ('SUPER_ADMIN', 'COMPANY_ADMIN', 'CONTRIBUTOR', 'VIEWER');
create type public.invite_status as enum ('pending', 'accepted', 'expired', 'revoked');

-- Drop policies that depend on organization_members.role before altering the column
drop policy if exists "orgs_update_admins" on public.organizations;
drop policy if exists "orgs_delete_admins" on public.organizations;
drop policy if exists "members_select_self_or_admin" on public.organization_members;
drop policy if exists "members_insert_admin_or_self" on public.organization_members;
drop policy if exists "members_update_admin" on public.organization_members;
drop policy if exists "members_delete_admin_or_self" on public.organization_members;
drop policy if exists "documents_admin_delete" on public.documents;
drop policy if exists "conversations_member_delete" on public.conversations;
drop policy if exists "messages_member_delete" on public.messages;
drop policy if exists "procedures_member_delete" on public.procedures;

-- Map existing member_role to user_role
alter table public.organization_members add column role_new public.user_role;
update public.organization_members
set role_new = (
  case role
    when 'ORG_ADMIN' then 'COMPANY_ADMIN'
    else 'CONTRIBUTOR'
  end
)::public.user_role;
alter table public.organization_members drop column role;
alter table public.organization_members rename column role_new to role;

-- Drop old enum if no longer used
do $$
begin
  if exists (select 1 from pg_type where typname = 'member_role') then
    drop type public.member_role;
  end if;
end$$;

-- Disabled flags
alter table public.organizations add column if not exists disabled boolean not null default false;
alter table public.organization_members add column if not exists disabled boolean not null default false;

-- Invites
create table if not exists public.organization_invites (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role public.user_role not null,
  token uuid not null default uuid_generate_v4(),
  status invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_org_invites_org on public.organization_invites (organization_id);
create index if not exists idx_org_invites_email on public.organization_invites (email);

-- Update policies to use COMPANY_ADMIN
create policy "orgs_update_admins" on public.organizations
for update using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "orgs_delete_admins" on public.organizations
for delete using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "members_select_self_or_admin" on public.organization_members
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "members_insert_admin_or_self" on public.organization_members
for insert with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "members_update_admin" on public.organization_members
for update using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "members_delete_admin_or_self" on public.organization_members
for delete using (
  auth.uid() = user_id
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "documents_admin_delete" on public.documents
for delete using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "conversations_member_delete" on public.conversations
for delete using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "messages_member_delete" on public.messages
for delete using (
  exists (
    select 1
    from public.conversations c
    join public.organization_members om on om.organization_id = c.organization_id
    where c.id = conversation_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "procedures_member_delete" on public.procedures
for delete using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

-- Invites policies
alter table public.organization_invites enable row level security;

create policy "invites_select_company_admin" on public.organization_invites
for select using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);

create policy "invites_insert_company_admin" on public.organization_invites
for insert with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'COMPANY_ADMIN'
  )
);


