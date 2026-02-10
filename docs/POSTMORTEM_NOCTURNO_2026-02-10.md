# Postmortem nocturno — 2026-02-10

## Resumen
- Hubo actividad y planificación, pero pocos cierres E2E visibles.
- Falló el reporting periódico prometido al usuario.

## Qué falló
1. Exceso de frentes abiertos.
2. Demasiado trabajo de diseño/documentación frente a entregables cerrados.
3. Dependencias críticas sin cierre temprano.
4. Reporting no automatizado desde el inicio.
5. Falta inicial de regla "sin evidencia no cuenta".

## Impacto
- Pérdida de confianza operativa.
- Baja visibilidad de progreso durante la noche.

## Causas raíz
- Modelo de reporte event-driven en lugar de time-driven.
- PMO y WIP estricto activados tarde.
- Gate de evidencia no aplicado desde T0.

## Acciones correctivas (activadas)
1. Cron reporte obligatorio cada 30 min al chat principal.
2. Ping de cumplimiento cada 45 min.
3. Regla WIP=2 por equipo.
4. Regla "sin evidencia no cuenta".
5. Reasignación automática si no hay output verificable en 60–90 min.

## Próxima verificación
- Revisión de cumplimiento de SLA de reportes en las próximas 24h.
