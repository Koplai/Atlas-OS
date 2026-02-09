# SEO Squad Shopify ES — Arquitectura (Ruta A)

## Objetivo
Sistema SEO operativo de bajo coste para detectar, priorizar y ejecutar oportunidades en Shopify ES usando n8n + Postgres + Atlas OS.

## Componentes
1. **Fuentes**
   - Google Search Console (query/page)
   - Google Analytics 4 (landing performance)
   - Shopify Admin API (catálogo, stock, estado)
   - Google Trends (demanda relativa)
2. **Orquestación**
   - n8n como scheduler + ETL + reglas + notificaciones
3. **Persistencia**
   - Postgres (staging + core + oportunidades + logs)
4. **Capa de producto**
   - Atlas OS panel para visibilidad y ejecución

## Agentes lógicos
- **collector**: ingesta/normalización diaria
- **scorer**: cálculo de features y score de oportunidades
- **planner**: convierte oportunidades en tareas accionables
- **reporter**: informe mensual + resumen ejecutivo
- **orchestrator**: control de flujos, retries, locks y salud

## Flujo de datos
1. WF-01 `seo_ingest_daily` escribe staging y facts diarios
2. WF-02 `seo_scoring_daily` calcula score y prioridad
3. WF-03 `seo_actions_weekly` crea backlog semanal
4. WF-04 `seo_report_monthly` publica informe

## Guardrails
- Humano-en-loop obligatorio para cambios masivos de plantillas/canonicals/redirects.
- Umbral mínimo de datos para scoring (evitar ruido).
- Backfill controlado (máx. 90 días por tanda).
- Sin LLM intensivo por defecto (optimización de coste).
