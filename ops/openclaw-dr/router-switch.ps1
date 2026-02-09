param(
  [ValidateSet('primary','standby')]
  [string]$Mode = 'primary',
  [int]$ListenPort = 18788
)

# Nota: se usa 18788 para evitar conflicto con primary activo en 18789.
# Si más adelante primary cambia de puerto, este router puede migrarse a 18789.

$TargetPort = if ($Mode -eq 'primary') { 18789 } else { 28789 }
$ListenAddress = '127.0.0.1'
$TargetAddress = '127.0.0.1'

netsh interface portproxy delete v4tov4 listenport=$ListenPort listenaddress=$ListenAddress | Out-Null
netsh interface portproxy add v4tov4 listenport=$ListenPort listenaddress=$ListenAddress connectport=$TargetPort connectaddress=$TargetAddress | Out-Null

Write-Output "router_mode=$Mode listen=${ListenAddress}:$ListenPort target=${TargetAddress}:$TargetPort"
