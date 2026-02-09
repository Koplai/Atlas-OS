-- SEO Squad Shopify ES (Ruta A) - DDL inicial

create extension if not exists pgcrypto;

create table if not exists stg_gsc_query_page_daily (
  date date not null,
  query text not null,
  page text not null,
  country text,
  device text,
  clicks int,
  impressions int,
  ctr numeric(8,6),
  position numeric(8,3),
  primary key (date, query, page, country, device)
);

create table if not exists stg_ga4_landing_daily (
  date date not null,
  landing_page text not null,
  sessions int,
  users int,
  engaged_sessions int,
  conversions int,
  revenue numeric(14,2),
  primary key (date, landing_page)
);

create table if not exists stg_shopify_products_daily (
  date date not null,
  product_id text not null,
  handle text,
  title text,
  status text,
  inventory int,
  price numeric(14,2),
  updated_at timestamptz,
  collection_ids text,
  primary key (date, product_id)
);

create table if not exists stg_trends_daily (
  date date not null,
  keyword text not null,
  trend_index int,
  geo text,
  source text,
  primary key (date, keyword, geo)
);

create table if not exists seo_opportunities (
  opp_id uuid primary key default gen_random_uuid(),
  date_detected date not null,
  opp_type text not null,
  entity_type text not null,
  entity_id text not null,
  title text,
  hypothesis text,
  impact_score int,
  confidence_score int,
  effort_score int,
  business_score int,
  final_score int,
  priority text,
  status text default 'open',
  owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_seo_opp_priority_status on seo_opportunities(priority, status);
create index if not exists idx_seo_opp_entity on seo_opportunities(entity_type, entity_id);
