-- Supabase schema for AI Knowledge Hub
set check_function_bodies = off;

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

create type public.document_status as enum ('pending', 'processing', 'ingested', 'failed');
create type public.member_role as enum ('ORG_ADMIN', 'ORG_MEMBER');
create type public.message_role as enum ('system', 'user', 'assistant');

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role member_role not null default 'ORG_ADMIN',
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  file_path text not null,
  file_type text not null,
  status document_status not null default 'pending',
  title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_text text not null,
  chunk_metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Conversation',
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role message_role not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.procedures (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  content text not null,
  source_documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_org on public.documents (organization_id);
create index if not exists idx_document_chunks_org on public.document_chunks (organization_id);
create index if not exists idx_document_chunks_doc on public.document_chunks (document_id);
create index if not exists idx_conversations_org on public.conversations (organization_id);
create index if not exists idx_conversations_user on public.conversations (user_id);
create index if not exists idx_messages_conversation on public.messages (conversation_id);
create index if not exists idx_procedures_org on public.procedures (organization_id);
create index if not exists document_chunks_embedding_index on public.document_chunks using ivfflat (embedding vector_l2_ops) with (lists = 100);

create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  insert into public.organization_members (user_id, organization_id, role)
  values (auth.uid(), new.id, 'ORG_ADMIN')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_organization_created
after insert on public.organizations
for each row
execute procedure public.handle_new_organization();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.procedures enable row level security;

create policy "orgs_select_members" on public.organizations
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = id
      and om.user_id = auth.uid()
  )
);

create policy "orgs_insert_authenticated" on public.organizations
for insert
with check (auth.uid() is not null);

create policy "orgs_update_admins" on public.organizations
for update
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "orgs_delete_admins" on public.organizations
for delete
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "members_select_self_or_admin" on public.organization_members
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "members_insert_admin_or_self" on public.organization_members
for insert
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "members_update_admin" on public.organization_members
for update
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "members_delete_admin_or_self" on public.organization_members
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "documents_member_access" on public.documents
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "documents_member_insert" on public.documents
for insert
with check (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "documents_member_update" on public.documents
for update
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "documents_admin_delete" on public.documents
for delete
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "chunks_member_access" on public.document_chunks
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "chunks_member_insert" on public.document_chunks
for insert
with check (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "conversations_member_access" on public.conversations
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "conversations_member_insert" on public.conversations
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "conversations_member_delete" on public.conversations
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "messages_member_access" on public.messages
for select
using (
  exists (
    select 1
    from public.conversations c
    join public.organization_members om on om.organization_id = c.organization_id
    where c.id = conversation_id
      and om.user_id = auth.uid()
  )
);

create policy "messages_member_insert" on public.messages
for insert
with check (
  exists (
    select 1
    from public.conversations c
    join public.organization_members om on om.organization_id = c.organization_id
    where c.id = conversation_id
      and om.user_id = auth.uid()
  )
);

create policy "messages_member_delete" on public.messages
for delete
using (
  exists (
    select 1
    from public.conversations c
    join public.organization_members om on om.organization_id = c.organization_id
    where c.id = conversation_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);

create policy "procedures_member_access" on public.procedures
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "procedures_member_insert" on public.procedures
for insert
with check (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

create policy "procedures_member_delete" on public.procedures
for delete
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
      and om.role = 'ORG_ADMIN'
  )
);


