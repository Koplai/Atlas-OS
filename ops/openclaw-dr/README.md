# OpenClaw DR bootstrap bundle

Scripts y plantillas para levantar DR warm-standby en otra máquina.

## Incluye
- snapshot/validate pipeline (RPO 15m)
- compose standby (gateway/db/qdrant + n8n opcional)
- witness PowerShell + tarea oculta
- router switch local para conmutación

## Notas
- No incluye secretos.
- Configurar envs en `D:\AtlasVault\secrets\*.env` con referencias seguras (1Password CLI recomendado).
- Aplicar ACL de Windows en `D:\AtlasVault\logs` y `D:\AtlasVault\secrets`.
