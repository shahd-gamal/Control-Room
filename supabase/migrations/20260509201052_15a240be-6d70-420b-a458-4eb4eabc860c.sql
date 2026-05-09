
-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- auto profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'other',
  amount numeric(12,2) not null default 0,
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "own expenses all" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger expenses_updated before update on public.expenses for each row execute function public.set_updated_at();
create index on public.expenses(user_id, date desc);

-- income
create table public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'other',
  amount numeric(12,2) not null default 0,
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.income enable row level security;
create policy "own income all" on public.income for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger income_updated before update on public.income for each row execute function public.set_updated_at();
create index on public.income(user_id, date desc);

-- clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  service_type text,
  total_price numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.clients enable row level security;
create policy "own clients all" on public.clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger clients_updated before update on public.clients for each row execute function public.set_updated_at();
create index on public.clients(user_id, created_at desc);

-- posts (facebook scheduler)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  scheduled_at timestamptz,
  status text not null default 'draft',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "own posts all" on public.posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger posts_updated before update on public.posts for each row execute function public.set_updated_at();
create index on public.posts(user_id, scheduled_at);

-- tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  priority text not null default 'Medium',
  due_date date,
  status text not null default 'Todo',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "own tasks all" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();
create index on public.tasks(user_id, due_date);
