-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Categories Table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- Products Table
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  price numeric(10, 2) not null default 0,
  stock integer not null default 0,
  category_id uuid references categories(id),
  project_id uuid references projects(id),
  created_at timestamp with time zone default now()
);

-- Enum for Transaction Type
create type transaction_type as enum ('SALE', 'GIFT');

-- Transactions Table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  type transaction_type not null,
  quantity integer not null check (quantity > 0),
  amount numeric(10, 2) not null default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table projects enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table transactions enable row level security;

-- Basic Public Policies (Read/Write for everyone as requested for starter)
create policy "Allow public read access on projects" on projects for select using (true);
create policy "Allow public insert access on projects" on projects for insert with check (true);
create policy "Allow public update access on projects" on projects for update using (true);

create policy "Allow public read access on categories" on categories for select using (true);
create policy "Allow public insert access on categories" on categories for insert with check (true);

create policy "Allow public read access on products" on products for select using (true);
create policy "Allow public insert access on products" on products for insert with check (true);
create policy "Allow public update access on products" on products for update using (true);

create policy "Allow public read access on transactions" on transactions for select using (true);
create policy "Allow public insert access on transactions" on transactions for insert with check (true);
