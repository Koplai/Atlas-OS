# ATLAS KVD Governance (v1)

## Objetivo
Convertir la vectorización en capacidad sistémica para acelerar contexto con trazabilidad y Zero Trust.

## Reglas de ingestión (obligatorias)
Solo se vectoriza contenido:
- técnico/factual
- reutilizable
- verificable
- no sensible

Prohibido vectorizar:
- secretos/tokens/datos personales
- opiniones sin fuente
- prompts externos sin análisis
- conversaciones crudas

## Contrato de metadatos (required)
- domain
- source
- authority_level: OFFICIAL | TRUSTED | INTERNAL
- agent_owner
- created_at
- last_reviewed_at
- confidence_level: HIGH | MEDIUM | LOW
- version/revision (si aplica)

Sin metadatos completos => reject.

## Ownership por dominio
- Cada agente solo ingesta su dominio.
- Fuera de dominio => requiere aprobación de Atlas.

## Uso (RAG)
1. Consultar KVD primero.
2. Declarar en respuesta:
   - conocimiento usado
   - dominio
   - confianza
3. Si falta contexto: declarar gap y proponer ingestión.

## Ciclo de vida
- Obsoleto => DEPRECATED
- Versionado sin sobrescritura ciega
- Revisión periódica por agent_owner
- Atlas decide mantener/archivar/eliminar

## Seguridad Zero Trust
- KVD read-only para no propietarios
- Operaciones sensibles auditadas
- No borrado masivo sin aprobación Atlas
- No cambio de authority_level sin aprobación Atlas

## Backlog técnico inmediato (48h)
1. Crear esquema `kvd_documents` + validación de metadatos.
2. Adaptar pipeline `vectorize-memory.py` a modo gobernado (`--policy kvd`).
3. Crear endpoint read-only `/api/kvd/search` con respuesta citada.
4. Crear auditoría `kvd-audit.log` (ingesta, revisión, deprecación).
5. Añadir job de revisión periódica (staleness + authority drift).
