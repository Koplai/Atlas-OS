# MEMORIA (curada)

## Infra / Atlas-OS
- Dashboard Atlas-OS: por ahora single-user (JPMarquez) y base de datos Postgres en infra propia (Docker). Supabase se considerará más adelante cuando el producto sea más robusto.
- Acceso a servicios vía Cloudflare Access como capa de autenticación en URLs públicas.
- Baseline operativo de agentes (acordado): persistentes ATLAS-SEC + ATLAS-GRC + BOARD-COORD; resto del board por ciclos. Enrutado de modelos mixto local/cloud (SEC/CFO/EU-REG en cloud; GRC/Board operativo en local) con objetivo de eficiencia sobre límite real WSL.
