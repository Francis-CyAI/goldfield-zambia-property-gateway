# gcloud-full-wipeout.ps1
# WARNING: This script IRREVERSIBLY deletes:
# - All Cloud Run services
# - All Cloud Functions (Gen 1 and Gen 2)
# - All Cloud Scheduler jobs
# - All Pub/Sub topics
# Make sure the active gcloud project is correct BEFORE running.

$ErrorActionPreference = "Stop"

# Optional: set a default region to use if gcloud configs are unset
# $DefaultRegion = "us-central1"

Write-Host "===== Google Cloud Full Wipeout Starting =====" -ForegroundColor Yellow

# Optional: uncomment and set your project explicitly
# $projectId = "your-project-id-here"
# gcloud config set project $projectId | Out-Null

# Helper to run a gcloud list command and split results safely
function Get-GcloudListValues {
    param(
        [string]$Command
    )
    $output = Invoke-Expression $Command
    if (-not $output) {
        return @()
    }
    # Ensure we return an array of non-empty lines
    return $output -split "`n" | Where-Object { $_.Trim() -ne "" }
}

function Normalize-Region {
    param(
        [string]$Region
    )
    $trimmed = $Region
    if ($trimmed) {
        $trimmed = $trimmed.Trim()
    }
    if (-not $trimmed -or $trimmed -eq "(unset)") {
        return $null
    }
    return $trimmed
}

function Parse-NameRegion {
    param(
        [string]$Line
    )
    $parts = $Line -split ","
    $name = $parts[0].Trim()
    $region = $null
    if ($parts.Count -gt 1 -and $parts[1].Trim().Length -gt 0) {
        $region = Normalize-Region $parts[1]
    }
    return @{ Name = $name; Region = $region }
}

# Helper to delete with --region/--location if provided
function Run-GcloudCommand {
    param(
        [string]$BaseCommand,
        [string]$Region,
        [string]$LocationFlag = "--region"
    )
    $Region = Normalize-Region $Region
    if (-not $Region) {
        if ($LocationFlag -eq "--region") {
            $Region = Normalize-Region $DefaultRegion
            if (-not $Region) {
                $Region = Normalize-Region (gcloud config get-value run/region 2>$null)
            }
            if (-not $Region) {
                $Region = Normalize-Region (gcloud config get-value functions/region 2>$null)
            }
            if (-not $Region) {
                $Region = Normalize-Region (gcloud config get-value compute/region 2>$null)
            }
        } elseif ($LocationFlag -eq "--location") {
            $Region = Normalize-Region $DefaultRegion
            if (-not $Region) {
                $Region = Normalize-Region (gcloud config get-value scheduler/location 2>$null)
            }
        }
    }
    if ($Region) {
        Invoke-Expression "$BaseCommand $LocationFlag=$Region"
    } else {
        Write-Warning "    Skipping because region/location missing for: $BaseCommand"
    }
}

# 1) Delete all Cloud Run services
Write-Host "`n[1/4] Deleting Cloud Run services..." -ForegroundColor Cyan
$runServices = Get-GcloudListValues 'gcloud run services list --platform=managed --format="csv[no-heading](name,region)" --quiet'

if ($runServices.Count -eq 0) {
    Write-Host "  No Cloud Run services found."
} else {
    foreach ($service in $runServices) {
        $parsed = Parse-NameRegion $service
        Write-Host "  Deleting Cloud Run service: $($parsed.Name) [$($parsed.Region)]"
        Run-GcloudCommand "gcloud run services delete $($parsed.Name) --platform=managed --quiet" $parsed.Region "--region"
    }
}

# 2) Delete all Cloud Functions (Gen 1)
# Write-Host "`n[2/4] Deleting Cloud Functions (Gen 1)..." -ForegroundColor Cyan
# $cfGen1 = Get-GcloudListValues 'gcloud functions list --format="csv[no-heading](name,region)" --quiet'

# if ($cfGen1.Count -eq 0) {
#    Write-Host "  No Gen 1 Cloud Functions found."
# } else {
#    foreach ($fn in $cfGen1) {
#        $parsed = Parse-NameRegion $fn
#        Write-Host "  Deleting Gen 1 Cloud Function: $($parsed.Name) [$($parsed.Region)]"
#        Run-GcloudCommand "gcloud functions delete $($parsed.Name) --quiet" $parsed.Region "--region"
#    }
# }

# 3) Delete all Cloud Functions (Gen 2)
Write-Host "`n[3/4] Deleting Cloud Functions (Gen 2)..." -ForegroundColor Cyan
$cfGen2 = Get-GcloudListValues 'gcloud functions list --v2 --format="csv[no-heading](name,location)" --quiet'

if ($cfGen2.Count -eq 0) {
    Write-Host "  No Gen 2 Cloud Functions found."
} else {
    foreach ($fn in $cfGen2) {
        $parsed = Parse-NameRegion $fn
        Write-Host "  Deleting Gen 2 Cloud Function: $($parsed.Name) [$($parsed.Region)]"
        Run-GcloudCommand "gcloud functions delete $($parsed.Name) --gen2 --quiet" $parsed.Region "--region"
    }
}

# 4) Delete all Cloud Scheduler jobs
Write-Host "`n[4/4] Deleting Cloud Scheduler jobs..." -ForegroundColor Cyan
$schedJobs = Get-GcloudListValues 'gcloud scheduler jobs list --format="csv[no-heading](name,locationId)" --quiet'

if ($schedJobs.Count -eq 0) {
    Write-Host "  No Cloud Scheduler jobs found."
} else {
    foreach ($job in $schedJobs) {
        $parsed = Parse-NameRegion $job
        Write-Host "  Deleting Cloud Scheduler job: $($parsed.Name) [$($parsed.Region)]"
        Run-GcloudCommand "gcloud scheduler jobs delete $($parsed.Name) --quiet" $parsed.Region "--location"
    }
}

# 5) Delete all Pub/Sub topics (optional, but included)
Write-Host "`n[Optional] Deleting Pub/Sub topics..." -ForegroundColor Cyan
$topics = Get-GcloudListValues 'gcloud pubsub topics list --format="value(name)" --quiet'

if ($topics.Count -eq 0) {
    Write-Host "  No Pub/Sub topics found."
} else {
    foreach ($topic in $topics) {
        Write-Host "  Deleting Pub/Sub topic: $topic"
        gcloud pubsub topics delete $topic --quiet
    }
}

Write-Host "`n===== Google Cloud Full Wipeout Complete =====" -ForegroundColor Green
