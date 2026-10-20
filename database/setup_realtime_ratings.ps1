param(
    [string]$ServiceName = "MongoDB",
    [string]$ReplicaSetName = "traveltaste-rs"
)

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Run this script from PowerShell as Administrator. It backs up mongod.cfg and restarts MongoDB."
}

$service = Get-CimInstance Win32_Service -Filter "Name='$ServiceName'"
if (-not $service) {
    throw "Windows service '$ServiceName' was not found."
}

$configMatch = [regex]::Match($service.PathName, '(?:--config|-f)\s+(?:"([^"]+)"|(\S+))')
if (-not $configMatch.Success) {
    throw "Could not find the MongoDB config path in the service command."
}

$configPath = $configMatch.Groups[1].Value
if (-not $configPath) {
    $configPath = $configMatch.Groups[2].Value
}
if (-not (Test-Path -LiteralPath $configPath)) {
    throw "MongoDB config was not found: $configPath"
}

$config = Get-Content -LiteralPath $configPath -Raw
$replicationMatch = [regex]::Match($config, '(?m)^replication\s*:\s*(?:#.*)?$')

if ($replicationMatch.Success) {
    $replicationContents = $config.Substring($replicationMatch.Index + $replicationMatch.Length)
    $nextSection = [regex]::Match($replicationContents, '(?m)^\S')
    if ($nextSection.Success) {
        $replicationContents = $replicationContents.Substring(0, $nextSection.Index)
    }
    $setNameMatch = [regex]::Match($replicationContents, '(?m)^\s+replSetName\s*:\s*(\S+)\s*$')
    if (-not $setNameMatch.Success -or $setNameMatch.Groups[1].Value -ne $ReplicaSetName) {
        throw "mongod.cfg already has a replication section. Review it manually; this script will not overwrite it."
    }
} else {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = "$configPath.$timestamp.bak"
    Copy-Item -LiteralPath $configPath -Destination $backupPath
    $config = $config.TrimEnd() + "`r`n`r`nreplication:`r`n  replSetName: $ReplicaSetName`r`n"
    Set-Content -LiteralPath $configPath -Value $config -Encoding UTF8
    Write-Output "Backed up MongoDB config to $backupPath"
}

Restart-Service -Name $ServiceName
$deadline = (Get-Date).AddSeconds(60)
do {
    Start-Sleep -Seconds 1
    $service = Get-Service -Name $ServiceName
} while ($service.Status -ne "Running" -and (Get-Date) -lt $deadline)

if ($service.Status -ne "Running") {
    throw "MongoDB service did not return to Running state."
}

Push-Location $PSScriptRoot
try {
    npm run init-replica-set
    if ($LASTEXITCODE -ne 0) {
        throw "Replica set initialization failed with exit code $LASTEXITCODE."
    }

    Write-Output "Starting the rating watcher. Leave this window open; press Ctrl+C to stop it."
    npm run watch-ratings
    if ($LASTEXITCODE -ne 0) {
        throw "Rating watcher stopped with exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}
