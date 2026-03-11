$ErrorActionPreference = "Stop"

$backupRoot = "C:/Users/ZDS/.claude/backups"
$latest = Get-ChildItem $backupRoot -Directory -Filter "rtk-win-hook-*" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $latest) {
  Write-Error "No RTK Windows hook backup found."
}

$settingsBackup = Join-Path $latest.FullName "settings.json"
$hookBackup = Join-Path $latest.FullName "rtk-hook.cjs"

if (-not (Test-Path $settingsBackup)) {
  Write-Error "Missing settings backup: $settingsBackup"
}

if (-not (Test-Path $hookBackup)) {
  Write-Error "Missing hook backup: $hookBackup"
}

Copy-Item $settingsBackup "C:/Users/ZDS/.claude/settings.json" -Force
Copy-Item $hookBackup "C:/Users/ZDS/.claude/hooks/rtk/rtk-hook.cjs" -Force

Write-Output "Restored from $($latest.FullName)"
