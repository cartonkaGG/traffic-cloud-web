# Звільняє порти локальної розробки перед dev:full (Windows).
$ports = @(3000, 5174, 8787)
$killed = @{}

foreach ($port in $ports) {
  $lines = netstat -ano | Select-String "LISTENING" | Select-String ":$port\s"
  foreach ($line in $lines) {
    if ($line -match '\s+(\d+)\s*$') {
      $procId = [int]$matches[1]
      if ($procId -le 0 -or $killed.ContainsKey($procId)) { continue }
      $killed[$procId] = $true
      Write-Host "[free-dev-ports] port $port -> PID $procId"
      taskkill /PID $procId /F 2>$null | Out-Null
    }
  }
}

if ($killed.Count -eq 0) {
  Write-Host '[free-dev-ports] ports 3000, 5174, 8787 are free'
} else {
  Start-Sleep -Milliseconds 400
  Write-Host "[free-dev-ports] killed $($killed.Count) process(es)"
}
