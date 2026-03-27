create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  payment_id text not null unique,
  payment_status text not null,
  payment_method text,
  customer_name text not null,
  customer_email text not null,
  customer_address text not null,
  customer_postcode text not null,
  customer_city text not null,
  customer_note text not null default '',
  format text not null,
  quantity integer not null,
  addons jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null,
  file_url text not null default '',
  file_id text not null default '',
  email_sent boolean not null default false,
  customer_email_sent boolean not null default false,
  admin_email_sent boolean not null default false,
  fulfillment_status text not null default 'nieuw',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_fulfillment_status_idx on public.orders (fulfillment_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();
