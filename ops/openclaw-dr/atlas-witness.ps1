param(
  [switch]$DryRun = $false,
  [int]$FailThreshold = 3,
  [string]$PrimaryHealthUrl = 'http://127.0.0.1:18789/health',
  [string]$StandbyHealthUrl = 'http://127.0.0.1:28789/health'
)

$ErrorActionPreference = 'Stop'
$Vault = 'D:\AtlasVault'
$StandbyDir = Join-Path $Vault 'standby'
$LogDir = Join-Path $Vault 'logs'
$WitnessLog = Join-Path $LogDir 'witness.log'
$AuditLog = Join-Path $LogDir 'audit.log'
$StateFile = Join-Path $StandbyDir 'witness-state.json'
$RouterScript = Join-Path $StandbyDir 'router-switch.ps1'

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
if (-not (Test-Path $StateFile)) {
  @{ consecutiveFails = 0; lastAction = 'init'; updatedAt = (Get-Date).ToString('o') } | ConvertTo-Json | Set-Content -Path $StateFile -Encoding UTF8
}

function Write-Log([string]$msg) {
  $line = "$(Get-Date -Format o) | $msg"
  Add-Content -Path $WitnessLog -Value $line -Encoding UTF8
}

function Write-Audit([string]$msg) {
  $line = "$(Get-Date -Format o) | PHASE4 | $msg"
  Add-Content -Path $AuditLog -Value $line -Encoding UTF8
}

function Test-Health([string]$url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300)
  } catch {
    return $false
  }
}

$state = Get-Content $StateFile -Raw | ConvertFrom-Json
$primaryOk = Test-Health $PrimaryHealthUrl
Write-Log "heartbeat primary_ok=$primaryOk fail_count=$($state.consecutiveFails) dryrun=$DryRun"

if ($primaryOk) {
  if ($state.consecutiveFails -ne 0) {
    Write-Log "primary_healthy reset_fail_counter from=$($state.consecutiveFails)"
  }
  $state.consecutiveFails = 0
  $state.lastAction = 'primary_healthy'
  $state.updatedAt = (Get-Date).ToString('o')
  $state | ConvertTo-Json | Set-Content -Path $StateFile -Encoding UTF8
  exit 0
}

$state.consecutiveFails = [int]$state.consecutiveFails + 1
Write-Log "primary_unhealthy fail_count=$($state.consecutiveFails) threshold=$FailThreshold dryrun=$DryRun"

if ($state.consecutiveFails -lt $FailThreshold) {
  $state.lastAction = 'wait_threshold'
  $state.updatedAt = (Get-Date).ToString('o')
  $state | ConvertTo-Json | Set-Content -Path $StateFile -Encoding UTF8
  exit 0
}

if ($DryRun) {
  Write-Log 'DRYRUN failover_triggered would_start_standby'
  Write-Audit 'witness dry-run triggered failover path (no changes applied)'
  $state.lastAction = 'dryrun_failover'
  $state.updatedAt = (Get-Date).ToString('o')
  $state | ConvertTo-Json | Set-Content -Path $StateFile -Encoding UTF8
  exit 0
}

Push-Location $StandbyDir
try {
  docker compose up -d | Out-Null
  Start-Sleep -Seconds 3
  $standbyOk = Test-Health $StandbyHealthUrl
  if ($standbyOk) {
    if (Test-Path $RouterScript) {
      try {
        & $RouterScript -Mode standby | Out-Null
        Write-Log 'router_switched_to_standby'
      } catch {
        Write-Log "router_switch_error $($_.Exception.Message)"
      }
    }
    Write-Log 'failover_success standby_healthy'
    Write-Audit 'witness executed failover; standby healthy on 28789'
    $state.lastAction = 'failover_success'
    $state.consecutiveFails = 0
  } else {
    Write-Log 'failover_error standby_unhealthy'
    Write-Audit 'witness failover attempted but standby health failed'
    $state.lastAction = 'failover_error'
  }
} finally {
  Pop-Location
}

$state.updatedAt = (Get-Date).ToString('o')
$state | ConvertTo-Json | Set-Content -Path $StateFile -Encoding UTF8
