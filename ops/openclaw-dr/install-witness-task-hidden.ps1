$TaskName = 'AtlasWitness'

# Reinstala en modo oculto/background (sin popup)
schtasks /Delete /TN $TaskName /F 2>$null | Out-Null

$Cmd = 'powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File D:\AtlasVault\standby\atlas-witness.ps1'

schtasks /Create /TN $TaskName /TR $Cmd /SC MINUTE /MO 1 /RU SYSTEM /RL HIGHEST /F | Out-Null

Write-Output 'AtlasWitness instalado en modo hidden/background.'
Write-Output 'Validar:'
Write-Output 'schtasks /Query /TN AtlasWitness /V /FO LIST'
