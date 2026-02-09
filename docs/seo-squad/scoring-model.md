# SEO Squad — Scoring Model (Ruta A)

## Fórmula principal
`final_score = 0.35*impact + 0.25*confidence + 0.25*business + 0.15*(100-effort)`

Rango 0-100. Se redondea a entero.

## Definición de sub-scores
### 1) Impact (0-100)
- Posición media entre 4-20: +30
- Impresiones altas sin clic (`impressions > p75`, `ctr < benchmark`): +25
- Caída WoW de clics >15% en URL crítica: +20
- Tendencia de demanda positiva (Trends > media 90d): +10
- Multiplicador por estacionalidad activa: +0..15

### 2) Confidence (0-100)
- Consistencia señal 28d vs 90d: +0..35
- Correlación GSC y GA4 en landing: +0..30
- Volumen mínimo robusto (`impressions >= 100`/28d): +0..20
- Datos completos (sin gaps ni nulls críticos): +0..15

### 3) Business (0-100)
- Margen/categoría prioritaria: +0..40
- Stock suficiente (Shopify): +0..30
- Campaña/comercial activa: +0..20
- Conversión histórica orgánica de la entidad: +0..10

### 4) Effort (0-100, menor es mejor)
- Meta/title/internal links simples: 10-30
- Contenido/FAQ/schema básico: 30-60
- Cambios técnicos de theme/arquitectura: 60-90

## Priorización
- **P1**: `final_score >= 75`
- **P2**: `55-74`
- **P3**: `<55`

## Reglas de exclusión
- Excluir entidades no indexables.
- Excluir productos sin stock prolongado.
- Excluir señal con menos de 14 días efectivos.

## Calibración mensual
1. Evaluar lift real de oportunidades `done` (4 semanas post).
2. Ajustar pesos ±5pp máximo por mes.
3. Registrar cambios de pesos en changelog del modelo.
