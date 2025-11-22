# gcloud-full-wipeout.ps1
# WARNING: This script IRREVERSIBLY deletes:
# - All Cloud Run services
# - All Cloud Functions (Gen 1 and Gen 2)
# - All Cloud Scheduler jobs
# - All Pub/Sub topics
# Make sure the active gcloud project is correct BEFORE running.

$ErrorActionPreference = "Stop"

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

# 1) Delete all Cloud Run services
Write-Host "`n[1/4] Deleting Cloud Run services..." -ForegroundColor Cyan
$runServices = Get-GcloudListValues 'gcloud run services list --platform=managed --format="value(name)" --quiet'

if ($runServices.Count -eq 0) {
    Write-Host "  No Cloud Run services found."
} else {
    foreach ($service in $runServices) {
        Write-Host "  Deleting Cloud Run service: $service"
        gcloud run services delete $service --platform=managed --quiet
    }
}

# 2) Delete all Cloud Functions (Gen 1)
Write-Host "`n[2/4] Deleting Cloud Functions (Gen 1)..." -ForegroundColor Cyan
$cfGen1 = Get-GcloudListValues 'gcloud functions list --format="value(name)" --quiet'

if ($cfGen1.Count -eq 0) {
    Write-Host "  No Gen 1 Cloud Functions found."
} else {
    foreach ($fn in $cfGen1) {
        Write-Host "  Deleting Gen 1 Cloud Function: $fn"
        gcloud functions delete $fn --quiet
    }
}

# 3) Delete all Cloud Functions (Gen 2)
Write-Host "`n[3/4] Deleting Cloud Functions (Gen 2)..." -ForegroundColor Cyan
$cfGen2 = Get-GcloudListValues 'gcloud functions list --gen2 --format="value(name)" --quiet'

if ($cfGen2.Count -eq 0) {
    Write-Host "  No Gen 2 Cloud Functions found."
} else {
    foreach ($fn in $cfGen2) {
        Write-Host "  Deleting Gen 2 Cloud Function: $fn"
        gcloud functions delete $fn --gen2 --quiet
    }
}

# 4) Delete all Cloud Scheduler jobs
Write-Host "`n[4/4] Deleting Cloud Scheduler jobs..." -ForegroundColor Cyan
$schedJobs = Get-GcloudListValues 'gcloud scheduler jobs list --format="value(name)" --quiet'

if ($schedJobs.Count -eq 0) {
    Write-Host "  No Cloud Scheduler jobs found."
} else {
    foreach ($job in $schedJobs) {
        Write-Host "  Deleting Cloud Scheduler job: $job"
        gcloud scheduler jobs delete $job --quiet
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