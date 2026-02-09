# SEO Squad — Flujos n8n (Ruta A)

## WF-01 `seo_ingest_daily` (02:10)
**Nodos sugeridos**
1. Cron Trigger
2. Function `set_window` (últimas 48h + 28d)
3. HTTP Request GSC
4. HTTP Request GA4
5. HTTP Request Shopify
6. HTTP Request Trends
7. Function `normalize_records`
8. Postgres `upsert_staging`
9. Postgres `merge_core_facts`
10. Postgres `insert_run_log`

## WF-02 `seo_scoring_daily` (03:00)
1. Cron Trigger
2. Postgres `load_features_base`
3. Function `compute_scores`
4. Postgres `upsert_opportunities`
5. Postgres `insert_run_log`
6. HTTP/Postgres `push_atlas_summary`

## WF-03 `seo_actions_weekly` (Lunes 08:30)
1. Cron Trigger
2. Postgres `select_top_opps`
3. Function `generate_tasks_from_templates`
4. Postgres `upsert_tasks`
5. Optional Telegram/Slack notification

## WF-04 `seo_report_monthly` (día 1, 09:00)
1. Cron Trigger
2. Postgres `kpi_monthly`
3. Postgres `wins_losses`
4. Function `render_markdown_report`
5. Write Binary File / S3
6. Postgres/HTTP `publish_report_atlas`

## Operación y resiliencia
- Retry por nodo crítico: 2 intentos, backoff exponencial.
- Circuit-breaker: si falla 2 días seguidos, alerta `high`.
- Lock por workflow para evitar doble corrida.
- Duración objetivo ingest: <15 min.
