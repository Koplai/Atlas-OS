# Standby Docker Runbook

## 0) Prechecks
```bash
cat /mnt/d/AtlasVault/manifests/LATEST_GOOD
cat /mnt/d/AtlasVault/manifests/last-known-good.json | head
```

## 1) Materializar sin arrancar (create)
```bash
docker compose -f /mnt/d/AtlasVault/standby/docker-compose.yml create
docker ps -a --format 'table {{.Names}}\t{{.Status}}' | grep atlas-standby
```

## 2) Arranque standby manual (solo DR)
```bash
docker compose -f /mnt/d/AtlasVault/standby/docker-compose.yml up -d atlas-standby-db atlas-standby-qdrant atlas-standby-gateway
curl -s http://127.0.0.1:28789/health
```

## 3) Apagar standby
```bash
docker compose -f /mnt/d/AtlasVault/standby/docker-compose.yml down
```

## 4) Router local (Windows PowerShell)
```powershell
# puerto estable 18788 -> primary/standby
& "D:\AtlasVault\standby\router-switch.ps1" -Mode primary
& "D:\AtlasVault\standby\router-switch.ps1" -Mode standby
```

## 5) Failover automático (witness)
- task cada 60s
- umbral de caída consecutiva: 3
- al disparar: `docker compose up -d` standby + health check + switch router

## 6) Failback manual (no automático)
1. Confirmar primary healthy estable
2. Cambiar router a primary
3. `docker compose down` standby
4. Registrar evento de failback en auditoría

## 7) Diagnóstico rápido
```bash
docker logs atlas-standby-gateway --tail 100
docker inspect atlas-standby-gateway | head
curl -s http://127.0.0.1:28789/manifest | head
```
