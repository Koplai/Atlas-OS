# SEO Squad — Data Dictionary (Ruta A)

## Convenciones
- PK: `id` UUID salvo tablas de dimensión con serial opcional.
- Fechas en UTC en DB; presentación en Europe/Madrid.
- Granularidad primaria: diaria.

## Staging
### stg_gsc_query_page_daily
- `date` date
- `query` text
- `page` text
- `country` text
- `device` text
- `clicks` int
- `impressions` int
- `ctr` numeric(8,6)
- `position` numeric(8,3)

### stg_ga4_landing_daily
- `date` date
- `landing_page` text
- `sessions` int
- `users` int
- `engaged_sessions` int
- `conversions` int
- `revenue` numeric(14,2)

### stg_shopify_products_daily
- `date` date
- `product_id` text
- `handle` text
- `title` text
- `status` text
- `inventory` int
- `price` numeric(14,2)
- `updated_at` timestamptz
- `collection_ids` text

### stg_trends_daily
- `date` date
- `keyword` text
- `trend_index` int
- `geo` text
- `source` text

## Core
### dim_page
- `page_id` bigserial PK
- `url` text unique
- `type` text (`product|collection|blog|page|other`)
- `lang` text
- `collection` text
- `product_id` text
- `is_indexable` boolean

### dim_keyword
- `keyword_id` bigserial PK
- `keyword` text unique
- `intent` text
- `cluster` text
- `priority_market` text

### fact_seo_page_daily
- `date` date
- `page_id` bigint FK
- `clicks` int
- `impressions` int
- `ctr` numeric(8,6)
- `position` numeric(8,3)
- `sessions` int
- `users` int
- `revenue` numeric(14,2)

### fact_seo_keyword_daily
- `date` date
- `keyword_id` bigint FK
- `page_id` bigint FK nullable
- `clicks` int
- `impressions` int
- `ctr` numeric(8,6)
- `position` numeric(8,3)
- `trend_index` int

## Oportunidades y ejecución
### seo_opportunities
Campos clave:
- `opp_id` uuid PK
- `date_detected` date
- `opp_type` text (`ctr_gap|pos_4_20|decay|thin_content|internal_link_gap|schema_gap`)
- `entity_type` text (`page|keyword|collection|product`)
- `entity_id` text
- `impact_score`, `confidence_score`, `effort_score`, `business_score`, `final_score` int
- `priority` text (`P1|P2|P3`)
- `status` text (`open|planned|done|discarded`)
- `owner` text

### seo_tasks
- `task_id` uuid PK
- `opp_id` uuid FK
- `action_type` text
- `instructions` text
- `risk_level` text (`low|medium|high`)
- `eta_hours` numeric(6,2)
- `status` text (`todo|doing|blocked|done`)

### seo_run_log
- `run_id` uuid PK
- `workflow` text
- `started_at` timestamptz
- `ended_at` timestamptz
- `status` text
- `rows_in` int
- `rows_out` int
- `error` text
