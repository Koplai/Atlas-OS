# SEO Squad Shopify ES — Ruta A (bajo coste)

## 1) Objetivo
Montar un sistema operativo SEO para Shopify (mercado ES) que detecte oportunidades, priorice por impacto/coste y ejecute acciones con trazabilidad en Atlas OS.

**Principios Ruta A**
- Coste mínimo: reutilizar n8n + Postgres + APIs gratuitas/ya contratadas.
- Entrega incremental: primero “insights + priorización + playbooks”, después automatización de cambios.
- Humano en el loop para acciones de riesgo (plantillas, canonical, redirects masivos).

---

## 2) Estructura de agentes (SEO Squad)

### A. Agent `collector`
**Función:** Ingesta y normalización diaria.
- Fuentes: GSC, GA4, Shopify Admin API, Google Trends (sin pago).
- Salida: tablas staging + snapshots diarios.

### B. Agent `scorer`
**Función:** Detectar oportunidades y calcular score.
- Inputs: query/page metrics + inventario + estacionalidad + esfuerzo.
- Salida: `seo_opportunities` priorizadas (P1/P2/P3).

### C. Agent `planner`
**Función:** Convertir oportunidades en tareas accionables.
- Genera “cards” con: hipótesis, acción exacta, owner, ETA, riesgo.
- Aplica plantillas de acción por tipo (title/meta, enlazado interno, contenido, technical).

### D. Agent `reporter`
**Función:** Resumen mensual + alertas semanales.
- Produce informe ejecutivo y técnico.
- Emite top wins, pérdidas y backlog recomendado.

### E. Agent `orchestrator` (n8n)
**Función:** Coordinar calendarios, reintentos, locks y auditoría.
- Ejecuta workflows por cron.
- Publica estado en Atlas OS.

---

## 3) Flujos n8n (diseño)

## WF-01: `seo_ingest_daily` (02:10 Europe/Madrid)
1. Trigger cron.
2. Pull GSC (Search Analytics): últimas 48h + ventana 28d.
3. Pull GA4 (Landing pages orgánicas): users, sessions, revenue/events.
4. Pull Shopify: productos, colecciones, stock, status, fechas update.
5. Pull Google Trends (keywords candidatas + categorías).
6. Normalizar y upsert en Postgres (staging + core).
7. Guardar `run_log` (duración, filas, errores).

**Control de coste:**
- Agregación diaria (no por hora).
- Limitar dimensiones GSC a top queries/pages por click.
- Tendencias por cluster de keywords, no keyword suelta.

## WF-02: `seo_scoring_daily` (03:00)
1. Cargar datos últimos 28/90 días.
2. Calcular features (delta CTR, gap posición 4-20, impresiones sin clic, etc.).
3. Aplicar fórmula de score (sección 5).
4. Crear/actualizar oportunidades y asignar prioridad.
5. Enviar resumen a Atlas OS (API interna o tabla dashboard).

## WF-03: `seo_actions_weekly` (Lunes 08:30)
1. Tomar top N oportunidades P1/P2.
2. Generar tareas accionables por plantilla.
3. Crear backlog operativo (tabla `seo_tasks`).
4. Notificar en canal interno (opcional Telegram/Slack).

## WF-04: `seo_report_monthly` (día 1, 09:00)
1. Consolidar KPIs mes anterior.
2. Comparar MoM/YoY (si hay historial).
3. Preparar informe markdown/html + CSV anexos.
4. Publicar en Atlas OS + enviar resumen ejecutivo.

---

## 4) Esquema de datos (Postgres)

## Tablas de ingesta (staging)
- `stg_gsc_query_page_daily`  
  (`date`,`query`,`page`,`country`,`device`,`clicks`,`impressions`,`ctr`,`position`)
- `stg_ga4_landing_daily`  
  (`date`,`landing_page`,`sessions`,`users`,`engaged_sessions`,`conversions`,`revenue`)
- `stg_shopify_products_daily`  
  (`date`,`product_id`,`handle`,`title`,`status`,`inventory`,`price`,`updated_at`,`collection_ids`)
- `stg_trends_daily`  
  (`date`,`keyword`,`trend_index`,`geo`,`source`)

## Tablas core
- `dim_page` (`page_id`,`url`,`type`,`lang`,`collection`,`product_id`,`is_indexable`)
- `dim_keyword` (`keyword_id`,`keyword`,`intent`,`cluster`,`priority_market`)
- `fact_seo_page_daily` (métricas consolidadas por página/día)
- `fact_seo_keyword_daily` (métricas por keyword/día)

## Oportunidades / ejecución
- `seo_opportunities`
  - `opp_id`, `date_detected`, `opp_type`, `entity_type` (page/keyword/collection/product)
  - `entity_id`, `title`, `hypothesis`
  - `impact_score`, `confidence_score`, `effort_score`, `business_score`, `final_score`
  - `priority` (P1/P2/P3), `status` (open/planned/done/discarded), `owner`
- `seo_tasks`
  - `task_id`, `opp_id`, `action_type`, `instructions`, `risk_level`, `eta_hours`, `status`
- `seo_run_log`
  - `run_id`, `workflow`, `started_at`, `ended_at`, `status`, `rows_in`, `rows_out`, `error`

---

## 5) Scoring de oportunidades (Ruta A)

**Fórmula base (0-100):**

`final_score = 0.35*impact + 0.25*confidence + 0.25*business + 0.15*(100-effort)`

### Impact (0-100)
- Alto volumen de impresiones sin clic.
- Keywords en posición 4–20 (quick wins).
- CTR por debajo de benchmark de posición.
- Caídas recientes de tráfico en URLs clave.

### Confidence (0-100)
- Calidad de señal en 28/90 días.
- Consistencia entre GSC y GA4.
- Estabilidad de tendencia (evitar ruido puntual).

### Business (0-100)
- Relación con colecciones/productos de margen alto.
- Disponibilidad de stock.
- Prioridad comercial activa.

### Effort (0-100, menor es mejor)
- 10-30: title/meta, enlazado interno simple.
- 30-60: mejora de contenido, FAQ, schema básico.
- 60-90: cambios técnicos en tema/plantilla, arquitectura.

**Reglas de priorización:**
- P1: `final_score >= 75`
- P2: `55-74`
- P3: `<55`

---

## 6) Reporte mensual (estructura)

1. **Resumen ejecutivo (1 página)**
   - Tráfico orgánico, clics, ingresos atribuidos SEO, top cambios MoM.
2. **Wins / Losses**
   - Top 10 URLs/queries ganadoras y perdedoras.
3. **Pipeline de oportunidades**
   - Abiertas, ejecutadas, descartadas, aging.
4. **Impacto por tipo de acción**
   - Meta tags, contenido, enlazado, técnico.
5. **Riesgos y bloqueos**
   - Dependencias (dev, contenido, catálogo, stock).
6. **Plan del próximo mes**
   - Top 5 apuestas con expected impact y esfuerzo.

---

## 7) Panel en Atlas OS (MVP)

## Vistas
- **Overview SEO**: KPIs 28d (clics, impresiones, CTR, posición, revenue orgánico).
- **Opportunity Board**: tabla + filtros (priority/status/type/owner).
- **Execution Funnel**: open → planned → done + lead time.
- **Entity Detail**: página/keyword con serie temporal + tareas asociadas.
- **Run Health**: estado workflows n8n, latencia y errores.

## Widgets mínimos
- Tarjetas KPI + delta MoM.
- Top oportunidades P1 (top 15).
- Alertas (caída >20% en URLs críticas).
- Último run y error más reciente.

---

## 8) Plan de implementación (4 semanas)

## Semana 1 — Base de datos + ingesta
- Crear esquema Postgres + índices básicos.
- Implementar WF-01 y logging.
- Validar calidad de datos (nulls, duplicados, mapping URLs).

## Semana 2 — Scoring + backlog
- Implementar WF-02 + fórmula.
- Definir catálogo de `opp_type` y `action_type`.
- Probar priorización con datos reales (ajuste de pesos).

## Semana 3 — Tareas + panel MVP
- Implementar WF-03.
- Construir vistas MVP en Atlas OS.
- Añadir filtros y drill-down página/keyword.

## Semana 4 — Reporte mensual + hardening
- Implementar WF-04.
- Añadir alertas críticas + reintentos n8n.
- Documentar runbooks operativos.

---

## 9) Documentación operativa requerida

- `docs/seo-squad/architecture.md`
- `docs/seo-squad/data-dictionary.md`
- `docs/seo-squad/scoring-model.md`
- `docs/seo-squad/workflows-n8n.md`
- `docs/seo-squad/runbook.md` (incidentes + recuperación)
- `docs/seo-squad/monthly-report-template.md`

---

## 10) Próximos pasos accionables (inmediatos)

1. Confirmar credenciales/API scopes (GSC, GA4, Shopify).
2. Aprobar DDL inicial en Postgres.
3. Construir WF-01 (ingesta diaria) y verificar 7 días de backfill.
4. Activar scoring con pesos iniciales y revisar top 30 oportunidades.
5. Definir owners por tipo de acción (SEO, contenido, dev).
6. Publicar panel MVP en Atlas OS con 5 widgets mínimos.
7. Ejecutar primer reporte mensual de prueba (dry-run).

---

## 11) Riesgos y mitigación (Ruta A)
- **Sampling/lag de datos** → usar ventanas 28/90d y thresholds mínimos.
- **Ruido en tendencias** → clusters en vez de keywords aisladas.
- **Cambios SEO de alto riesgo** → aprobación humana obligatoria.
- **Coste de operación** → 1 corrida diaria + 1 semanal + 1 mensual, sin LLM intensivo por defecto.

---

## 12) KPI de éxito del sistema
- % oportunidades P1 ejecutadas/mes.
- Tiempo medio de detección → ejecución.
- Lift orgánico en URLs intervenidas vs control.
- Incremento de clics e ingresos atribuibles SEO (MoM/trim).
- Tasa de errores workflows < 2%.
