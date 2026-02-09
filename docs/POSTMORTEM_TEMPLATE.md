# Postmortem de Incidente (Plantilla 1 página)

- **Fecha/hora detección:**
- **Servicio/Módulo afectado:**
- **Severidad:** (P0/P1/P2)
- **Reportado por:**
- **Estado actual:** (Abierto/Cerrado/Monitorizando)

## 1) Resumen ejecutivo
- Qué pasó en 2-3 líneas.
- Impacto real en usuario/negocio.

## 2) Causa raíz
- Causa técnica principal.
- Factores contribuyentes.

## 3) Fallo de proceso
- Qué control faltó (QA, PR checklist, CI, observabilidad, etc.).
- Por qué no se detectó antes.

## 4) Acciones correctivas inmediatas (hoy)
- [ ] Hotfix aplicado
- [ ] Validación manual mínima (casos críticos)
- [ ] Pruebas automáticas mínimas añadidas/actualizadas
- [ ] Smoke post-fix ejecutado

## 5) Guardrails permanentes
- Checklist de PR obligatorio
- Tests bloqueantes (golden-path)
- Release gate (no-pass, no-deploy)
- Monitoreo/alertas/SLO relacionados

## 6) Evidencias
- Commits:
- PRs:
- Logs/screen/video:
- Rutas/Endpoints probados:

## 7) Dueños y fechas
- Owner técnico:
- Owner QA:
- Fecha objetivo de cierre total:

## 8) Lecciones aprendidas
- Qué cambiamos para que no se repita.
- Qué deuda técnica/documental queda.
