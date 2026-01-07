# ============================================================================
# QUICK DEPLOY - LOCAL DOCKER ENVIRONMENT
# ============================================================================
# This script deploys the entire stack locally using Docker Compose
# ============================================================================

param(
    [switch]$Fresh,
    [switch]$Seed,
    [switch]$NoBuild,
    [switch]$Logs
)

Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host "Personal Portfolio - Local Docker Deployment" -ForegroundColor Cyan
Write-Host "============================================================================`n" -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker info 2>&1 | Out-Null
if (-not $?) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Load environment variables
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "WARNING: No .env file found. Using default values." -ForegroundColor Yellow
}

# Stop existing containers if fresh install
if ($Fresh) {
    Write-Host "`nStopping and removing existing containers..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "Containers removed`n" -ForegroundColor Green
}

# Build and start containers
if ($NoBuild) {
    Write-Host "`nStarting containers (no build)..." -ForegroundColor Yellow
    docker-compose up -d
} else {
    Write-Host "`nBuilding and starting containers..." -ForegroundColor Yellow
    docker-compose up -d --build
}

if (-not $?) {
    Write-Host "`nERROR: Failed to start containers" -ForegroundColor Red
    exit 1
}

Write-Host "`nWaiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Deploy database schema
Write-Host "`nDeploying database schema..." -ForegroundColor Yellow
$dbArgs = @()
if ($Fresh) { $dbArgs += "--fresh" }
if ($Seed) { $dbArgs += "--seed" }
$dbArgs += "--skip-confirm"

$env:DATABASE_URL = "postgresql://$($env:DB_USER ?? 'postgres'):$($env:DB_PASSWORD ?? 'postgres')@localhost:$($env:DB_PORT ?? '5432')/$($env:DB_NAME ?? 'portfolio')"

node deploy/deploy-database.js $dbArgs

if (-not $?) {
    Write-Host "`nERROR: Database deployment failed" -ForegroundColor Red
    exit 1
}

# Display deployment summary
Write-Host "`n============================================================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================================================`n" -ForegroundColor Green

Write-Host "Services available at:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  API:       http://localhost:3001" -ForegroundColor White
Write-Host "  Database:  localhost:$($env:DB_PORT ?? '5432')" -ForegroundColor White

Write-Host "`nUseful commands:" -ForegroundColor Cyan
Write-Host "  View logs:      docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop all:       docker-compose down" -ForegroundColor White
Write-Host "  Restart API:    docker-compose restart api" -ForegroundColor White
Write-Host "  Restart Web:    docker-compose restart web" -ForegroundColor White

if ($Logs) {
    Write-Host "`nShowing container logs (Ctrl+C to exit)..." -ForegroundColor Yellow
    docker-compose logs -f
}
