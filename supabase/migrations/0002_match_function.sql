-- RPC for vector search on document_chunks
create or replace function public.match_document_chunks (
  query_embedding vector(1536),
  match_count int,
  org_id uuid,
  similarity_threshold float8 default 0.75
) returns table (
  id uuid,
  document_id uuid,
  chunk_text text,
  chunk_metadata jsonb,
  similarity float8
) language sql stable as $$
  select
    dc.id,
    dc.document_id,
    dc.chunk_text,
    dc.chunk_metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.organization_id = org_id
  order by dc.embedding <=> query_embedding
  limit match_count
$$;

comment on function public.match_document_chunks is 'Returns top-k similar chunks for an org using cosine similarity';

grant execute on function public.match_document_chunks to anon, authenticated, service_role;

