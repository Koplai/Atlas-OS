# SEO Squad — Runbook Operativo

## Salud diaria (checklist)
- Último `seo_ingest_daily` en estado `ok`.
- `rows_out > 0` en GSC y GA4.
- Sin backlog de errores >24h.
- Panel Atlas actualizado hoy.

## Incidentes típicos
### 1) Error autenticación API
- Síntoma: HTTP 401/403 en GSC/GA4/Shopify.
- Acción: rotar token/refresh, validar scopes, relanzar WF.

### 2) Caída de volumen súbita
- Síntoma: `rows_out` < 30% baseline.
- Acción: verificar ventanas de consulta, sampling, filtros país/dispositivo.

### 3) Duplicados en staging
- Síntoma: crecimiento anómalo y métricas infladas.
- Acción: revisar claves de upsert (`date+query+page+country+device`).

### 4) Scoring vacío
- Síntoma: 0 oportunidades nuevas.
- Acción: revisar reglas de exclusión y umbrales mínimos.

## Recovery
1. Pausar WF afectado.
2. Corregir credencial/query/esquema.
3. Reprocesar ventana de 7 días.
4. Verificar consistencia en facts y oportunidades.
5. Reactivar scheduler.

## SLO iniciales
- Disponibilidad workflows: 98% mensual.
- Tasa error runs: <2%.
- Latencia de detección de oportunidades: <24h.
