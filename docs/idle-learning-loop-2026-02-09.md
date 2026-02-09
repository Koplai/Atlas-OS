# Idle Learning Loop — 2026-02-09 09:30 (Europe/Madrid)

## Contexto
No se detectó una tarea P0/P1 explícita en este turno, así que ejecuté aprendizaje aplicado con mejoras de bajo riesgo.

## Fuentes consultadas (recientes/fiables)
1. Azure DevOps Roadmap (Microsoft)
   - https://learn.microsoft.com/en-us/azure/devops/release-notes/features-timeline
2. Playwright Release Notes
   - https://playwright.dev/docs/release-notes
3. OpenTelemetry Semantic Conventions 1.39.0
   - https://opentelemetry.io/docs/specs/semconv/
4. W3C WCAG 2.2 (Recommendation)
   - https://www.w3.org/TR/WCAG22/

## Hallazgos accionables por rol

### UI / Visual
- WCAG 2.2 recomienda foco visible más claro y consistente para navegación por teclado.
- Acción práctica: estandarizar `:focus-visible` global con alto contraste y offset.

### DevOps
- Azure DevOps sigue reforzando seguridad de credenciales (menos PATs, más políticas) y expansión de Advanced Security.
- Acción práctica: priorizar controles de secretos/CodeQL/dependencias en repos críticos.

### QA
- Playwright incorpora mejoras de productividad (Speedboard/Timeline) y cambios breaking en selectores antiguos.
- Acción práctica: mantener tests con `locator()` moderno y añadir gates de calidad ligeros (lint + typecheck).

### Backend / Security
- OpenTelemetry semconv sigue creciendo (incluye áreas modernas como GenAI/CICD).
- Acción práctica: definir esquema semántico consistente para trazas/métricas/logs y evitar nombres ad-hoc.

## Cambios aplicados (seguros, bajo riesgo)

### 1) Mejora de accesibilidad (UI)
**Archivo:** `jpmarquezcom/src/index.css`
- Se añadió estilo global `:focus-visible`:
  - `outline: 3px solid hsl(var(--ring))`
  - `outline-offset: 2px`
  - `border-radius: 0.375rem`

**Impacto esperado:**
- Mejor visibilidad de foco por teclado (alineado con WCAG 2.2).
- Casi nulo riesgo funcional.

### 2) Mejora de quality gate (QA)
**Archivo:** `jpmarquezcom/package.json`
- Se añadió script: `"typecheck": "tsc --noEmit"`

**Impacto esperado:**
- Validación rápida de tipos TS en CI/local sin generar artefactos.
- Reduce regresiones de tipado.

## Decisiones
- **Ejecutado ahora:** sólo cambios de bajo riesgo (CSS y script de calidad).
- **No ejecutado sin aprobación:** instalaciones nuevas, cambios de seguridad con impacto operativo, migraciones o hardening potencialmente disruptivo.

## Siguiente experimento propuesto (requiere validación mínima)
1. Añadir job CI no bloqueante inicial con:
   - `npm run lint`
   - `npm run typecheck`
2. En segunda fase, activar bloqueo de merge si estabilidad >95% en 2 semanas.
3. Definir mini guía de instrumentación OTel (nombres de spans/atributos) para servicios activos.
