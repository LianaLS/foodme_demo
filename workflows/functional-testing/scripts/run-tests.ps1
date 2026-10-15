<#
.SYNOPSIS
  Step 08 (Run) of the functional testing workflow: runs the automated tests of a feature
  and saves the results as JSON for step 10 (Report).

.DESCRIPTION
  1. Reads the run command of the feature from workflows/functional-testing/runs/<Feature>/automation.yaml (run.feature).
  2. Wakes the test object first (the free Render instance can take minutes to start) by polling /actuator/health.
  3. Runs the tests from apps/web with the list reporter (console) and the JSON reporter (file).
  4. Writes runs/<Feature>/results.json and prints a short summary.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File workflows/functional-testing/scripts/run-tests.ps1 -Feature SCRUM-9
#>
param(
  [string]$Feature = "SCRUM-9",
  [string]$BaseUrl = "https://foodme-lianals.onrender.com",
  [int]$WakeTimeoutMinutes = 15
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$runDir = Join-Path $repo "workflows\functional-testing\runs\$Feature"
$automation = Join-Path $runDir "automation.yaml"
$results = Join-Path $runDir "results.json"

if (-not (Test-Path $automation)) { throw "Not found: $automation - step 06 is not finished." }

# 1. The run command recorded in step 06 (run: feature: npx playwright test ...).
$runLine = Select-String -Path $automation -Pattern '^\s+feature:\s*(npx playwright test .+)$' | Select-Object -First 1
if (-not $runLine) { throw "No 'run.feature' command in $automation." }
$testArgs = ($runLine.Matches[0].Groups[1].Value -replace '^npx playwright test\s+', '').Trim()
Write-Host "Feature $Feature - tests: $testArgs"

# 2. Wake the test object (condition-based: wait until health is UP, not a fixed time).
$deadline = (Get-Date).AddMinutes($WakeTimeoutMinutes)
while ($true) {
  try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/actuator/health" -TimeoutSec 30
    if ($health.status -eq "UP") { Write-Host "Test object is UP: $BaseUrl"; break }
  } catch { }
  if ((Get-Date) -gt $deadline) { throw "Test object $BaseUrl is not UP after $WakeTimeoutMinutes minutes - suspend the run (plan: suspension criteria)." }
  Write-Host "Waiting for $BaseUrl to wake up..."
  Start-Sleep -Seconds 20
}

# 3. Run the tests: list reporter for the console, JSON reporter for the file.
$env:PLAYWRIGHT_JSON_OUTPUT_NAME = $results
Push-Location (Join-Path $repo "apps\web")
try {
  $started = Get-Date
  & npx playwright test $testArgs.Split(' ', [StringSplitOptions]::RemoveEmptyEntries) --reporter=list,json
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
  Remove-Item Env:PLAYWRIGHT_JSON_OUTPUT_NAME -ErrorAction SilentlyContinue
}

# 4. Short summary from the JSON file.
if (-not (Test-Path $results)) { throw "Playwright did not write $results." }
$json = Get-Content $results -Raw | ConvertFrom-Json
$s = $json.stats
Write-Host ""
Write-Host "Results ($Feature, started $($started.ToString('u'))): passed $($s.expected), failed $($s.unexpected), flaky $($s.flaky), skipped $($s.skipped)"
Write-Host "Saved: $results"
exit $exitCode
