# gcloud-check-deployed.ps1
# Lists currently deployed resources for the active (or supplied) project:
# - Cloud Functions (Gen 2)
# - Cloud Run services
# - Cloud Scheduler jobs
# Usage:
#   pwsh scripts/gcloud-check-deployed.ps1
#   pwsh scripts/gcloud-check-deployed.ps1 -Project my-project -Region us-central1

param(
    [string]$Project,
    [string]$Region
)

$ErrorActionPreference = "Stop"

function Get-ConfigValue {
    param(
        [string]$Key
    )
    try {
        $value = (gcloud config get-value $Key 2>$null)
        if ($value) {
            $value = $value.Trim()
        }
        if ($value -and $value -ne "(unset)") {
            return $value
        }
    } catch {
        # ignore lookup errors
    }
    return $null
}

function Resolve-Project {
    param(
        [string]$Project
    )
    if ($Project) {
        return $Project
    }
    $fromConfig = Get-ConfigValue "core/project"
    if ($fromConfig) {
        return $fromConfig
    }
    throw "No project set. Provide -Project or set core/project in gcloud config."
}

function Resolve-Region {
    param(
        [string]$Region
    )
    if ($Region) {
        return $Region
    }
    $candidates = @(
        "functions/region",
        "run/region",
        "scheduler/location",
        "compute/region"
    )
    foreach ($key in $candidates) {
        $val = Get-ConfigValue $key
        if ($val) {
            return $val
        }
    }
    return $null
}

function Run-Command {
    param(
        [string]$Label,
        [string]$Command
    )
    Write-Host "`n$Label" -ForegroundColor Cyan
    Write-Host "  $Command" -ForegroundColor DarkGray
    try {
        Invoke-Expression $Command
    } catch {
        Write-Warning "  Failed: $($_.Exception.Message)"
    }
}

$project = Resolve-Project $Project
$region = Resolve-Region $Region

Write-Host "Inspecting project: $project" -ForegroundColor Yellow
if ($region) {
    Write-Host "Using region/location: $region" -ForegroundColor Yellow
} else {
    Write-Host "No region/location resolved; listing globally where supported." -ForegroundColor Yellow
}

# Cloud Functions (Gen 2)
$fnRegionFlag = ""
if ($region) {
    $fnRegionFlag = "--regions=$region"
}
Run-Command "Cloud Functions (Gen 2)" "gcloud functions list --v2 --project $project $fnRegionFlag --format=""table(name,region,status.state,status.environment)"""

# Cloud Run services
$runRegionFlag = ""
if ($region) {
    $runRegionFlag = "--region $region"
}
Run-Command "Cloud Run services" "gcloud run services list --platform=managed --project $project $runRegionFlag --format=""table(name,region,url,status.state)"""

# Cloud Scheduler jobs
$schedLocFlag = ""
if ($region) {
    $schedLocFlag = "--location $region"
}
Run-Command "Cloud Scheduler jobs" "gcloud scheduler jobs list --project $project $schedLocFlag --format=""table(name,locationId,schedule,state)"""
