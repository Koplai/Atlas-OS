# Atlas Enterprise Agent Org (v1)

## Estructura de roles (inspirada en equipos top)
1. **Chief of Staff / PMO Agent**
   - Prioriza backlog, define sprint y acepta/rechaza entregables.
2. **Principal Architect Agent**
   - Define arquitectura, límites, estándares y debt plan.
3. **Staff Frontend Agent**
   - UX premium, design system, accesibilidad, responsive.
4. **Staff Backend Agent**
   - APIs, contratos, rendimiento, resiliencia y seguridad de endpoints.
5. **DevOps/SRE Agent**
   - CI/CD, healthchecks, autoheal, observabilidad, rollback.
6. **QA/Release Agent**
   - Smoke/regression, rutas críticas, severidades, release gates.
7. **Data/AI Agent**
   - Estrategia de modelos, fallback, evaluación y costes.
8. **Security Agent**
   - Hardening, revisión de exposición, secretos y políticas.
9. **Technical Writer Agent**
   - Documentación viva: runbooks, ADRs, changelog, onboarding.

## Contrato entre agentes
- Entrada: tarea con contexto mínimo + criterios de aceptación.
- Salida: diff propuesto, riesgos, pruebas ejecutadas, siguiente paso.
- Escalado: bloqueos técnicos pasan a PMO + SRE.

## Cadencia recomendada
- Cada 60–90 min: sync de estado del swarm.
- Cada 1 bloque: QA gate antes de push.
- Fin de noche: reporte ejecutivo + backlog residual.
