9# Muichiro-Nexus: *A Cloud-Storage with AI Integration*

<img width="200" height="206" alt="image" src="https://github.com/user-attachments/assets/b45dc22b-fcc9-44f7-a7cd-6d5489d45ce4" />


## Project To-Do List

### Development Checkpoints
- [x] Set up Next.js project structure
- [x] Integrate Noto Sans JP font for headings
- [x] Design Home Page UI
- [x] Created a Storage Bucket in supabase
- [x] Created the policies to allow only authenticated users to perform CRUD 
- [x] Just Created a separate branch for tetsing of supabase-clerk Integration for fetching and storing user details and generating a user Id in Supabase's User Table that i have previously created.
- [x] Finally created upload - file feature
- [x] File-Upload stuffs just take file from user and then it send that file to my supabase files-table just like clerk send user details to user-table in supabase.
- [x] After receiving data from frontend, supabase stores that file in my storage-bucket where i have full authority to Delete, Download and get link for uploaded files.
- [x] Took me hours but its finally done, I am done with integrating feature of file-display on frontend, was stuck with some RLS policy issues but have to just bypass it due to lack of time 😅.
- [x] File-deleting working properly on frontend.
- [x] Have some issues with file-downloading feat., no idea why it is failing to fetch the downloading-url of file from bucket, even my bucket is not-found LOL, I have to figure it out.
- [x] Fixed File Download feature.
- [ ] Next I will be moving to most interesting part of my project - AI integration.
- [ ] Will deep dive into Vercel's ai-sdk
- [ ] Complete Implementing AI features
- [ ] Test responsiveness on mobile and desktop

### Deployment Checkpoints
- [ ] Deploy to Vercel 
- [ ] Update README.md with live demo link
- [ ] Add project to resume 

---

## AI Integration Setup

1) Install packages

```bash
npm i @xenova/transformers
```

2) Environment variables

Add to `.env.local` (and Vercel project if deploying):

```
# No API key needed for local embeddings with @xenova/transformers
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3) Database schema (pgvector and tables)

Run in Supabase SQL editor:

```sql
-- Enable pgvector
create extension if not exists vector;

-- File chunks table to store embeddings
create table if not exists public.file_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_id uuid not null references public.files(id) on delete cascade,
  file_path text not null,
  chunk_index int not null,
  content text not null,
  embedding vector(384) not null, -- all-MiniLM-L6-v2 dims
  created_at timestamp with time zone default now()
);

create index if not exists file_chunks_user_idx on public.file_chunks(user_id);
create index if not exists file_chunks_file_idx on public.file_chunks(file_id);
create index if not exists file_chunks_embedding_idx on public.file_chunks using ivfflat (embedding vector_l2_ops) with (lists = 100);

-- RPC for semantic match
create or replace function public.match_file_chunks(
  p_user_id uuid,
  p_query_embedding vector(384),
  p_match_count int default 8
)
returns table (
  file_id uuid,
  file_path text,
  content text,
  score float
)
language sql stable as $$
  select
    fc.file_id,
    fc.file_path,
    fc.content,
    1 - (fc.embedding <=> p_query_embedding) as score -- cosine similarity if normalized
  from public.file_chunks fc
  where fc.user_id = p_user_id
  order by fc.embedding <-> p_query_embedding -- l2 distance for ivfflat; use <=> for cosine if normalized
  limit p_match_count;
$$;
```

Note: If you want cosine similarity optimized, store normalized embeddings and switch the index to `vector_cosine_ops` with `<=>` in `order by`.

4) RLS

If RLS is on, create policies for `file_chunks` allowing the service role or matching `user_id` access, or perform all writes/reads via the service client as implemented.

5) Usage

- Upload a text-like file; the server action will create embeddings and store them in `public.file_chunks`.
- Use the “Semantic Search” card on the dashboard to query your corpus.
