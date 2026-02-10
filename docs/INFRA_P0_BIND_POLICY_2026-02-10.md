# INFRA P0 — Política de cierre/bind por servicio (2026-02-10)

## Evidencia base (captura 09:xx Europe/Madrid)
- `ss -tulpen` muestra listeners públicos en: `18789`, `3000`, `6333`, `5678`, `8188`.
- `docker ps` mapea:
  - `atlas-dashboard-dashboard-1` → `0.0.0.0:3000->3000/tcp`
  - `qdrant` → `0.0.0.0:6333->6333/tcp`
  - `n8n` → `0.0.0.0:5678->5678/tcp`
  - `comfyui` → `0.0.0.0:8188->8189/tcp`
- OpenClaw Gateway escucha en `0.0.0.0:18789`.

## Política P0 (default deny + Access/Tunnel only)
1. **Servicios internos** (dashboard, qdrant, n8n, comfyui): bind exclusivo a loopback (`127.0.0.1`).
2. **Exposición externa** solo mediante Cloudflare Access/Tunnel o reverse proxy autenticado.
3. **Puertos públicos directos** en host: permitidos únicamente por excepción aprobada.

## Matriz de acción por puerto

### 18789 — openclaw-gateway
- Riesgo: Alto (control plane).
- Política: limitar a localhost o IP de gestión dedicada + firewall restrictivo.
- Owner: Infra/Atlas.
- Need: confirmar si hay clientes remotos directos (si no, mover a `127.0.0.1`).

### 3000 — atlas-dashboard
- Riesgo: Alto (UI de operación).
- Política: `127.0.0.1:3000:3000`.
- Owner: Dashboard stack.
- Need: editar compose y recrear servicio.

### 6333 — qdrant
- Riesgo: Alto (datos/vector DB).
- Política: `127.0.0.1:6333:6333`.
- Owner: Data/IA stack.
- Need: actualizar publicación de puerto y reiniciar contenedor.

### 5678 — n8n
- Riesgo: Alto (automatización con credenciales).
- Política: `127.0.0.1:5678:5678`.
- Owner: Automatización.
- Need: migrar publicación a loopback y validar webhooks via tunnel.

### 8188 — comfyui (riesgo adicional detectado)
- Riesgo: Alto (ejecución y recursos).
- Política: `127.0.0.1:8188:8189`.
- Owner: Media/GenAI.
- Need: mantener acceso externo solo por Cloudflare.

## Plan de ejecución controlada (siguiente ventana)
1. Backup de compose actual.
2. Cambiar bindings `0.0.0.0` → `127.0.0.1` por servicio.
3. `docker compose up -d` por stack.
4. Validar salud por URL interna + ruta Cloudflare.
5. Verificación final con `ss -tulpen` (sin listeners públicos en 3000/6333/5678/8188).
6. Rollback inmediato si hay impacto funcional.
