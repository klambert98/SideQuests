# ============================================================================
# HEALTH CHECK SCRIPT
# ============================================================================
# Checks the health of all deployed services
# ============================================================================

param(
    [string]$Environment = "local"  # local, flyio, or custom URL
)

Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host "Personal Portfolio - Health Check" -ForegroundColor Cyan
Write-Host "============================================================================`n" -ForegroundColor Cyan

# Set URLs based on environment
if ($Environment -eq "local") {
    $apiUrl = "http://localhost:3001"
    $webUrl = "http://localhost:3000"
    $dbHost = "localhost"
    $dbPort = $env:DB_PORT ?? "5432"
} elseif ($Environment -eq "flyio") {
    # Update these with your actual Fly.io app names
    $apiUrl = "https://your-api-app.fly.dev"
    $webUrl = "https://your-web-app.fly.dev"
} else {
    Write-Host "ERROR: Invalid environment. Use 'local' or 'flyio'" -ForegroundColor Red
    exit 1
}

Write-Host "Environment: $Environment`n" -ForegroundColor Yellow

# Check API health
Write-Host "Checking API ($apiUrl)..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "$apiUrl/health" -TimeoutSec 10 -UseBasicParsing
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "  ✓ API is healthy" -ForegroundColor Green
        Write-Host "  Status: $($apiResponse.StatusCode)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ API returned unexpected status: $($apiResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ API is not reachable" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Frontend
Write-Host "`nChecking Frontend ($webUrl)..." -ForegroundColor Yellow
try {
    $webResponse = Invoke-WebRequest -Uri $webUrl -TimeoutSec 10 -UseBasicParsing
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend is healthy" -ForegroundColor Green
        Write-Host "  Status: $($webResponse.StatusCode)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Frontend returned unexpected status: $($webResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Frontend is not reachable" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Database (local only)
if ($Environment -eq "local") {
    Write-Host "`nChecking Database ($dbHost:$dbPort)..." -ForegroundColor Yellow
    
    $dbUser = $env:DB_USER ?? "postgres"
    $dbPassword = $env:DB_PASSWORD ?? "postgres"
    $dbName = $env:DB_NAME ?? "portfolio"
    $connectionString = "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}"
    
    $env:DATABASE_URL = $connectionString
    
    $checkScript = @"
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query('SELECT NOW()'))
  .then(() => { console.log('OK'); client.end(); })
  .catch(err => { console.error('ERROR'); process.exit(1); });
"@
    
    $result = $checkScript | node
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Database is healthy" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Database is not reachable" -ForegroundColor Red
    }
}

# Check Docker containers (local only)
if ($Environment -eq "local") {
    Write-Host "`nDocker Container Status:" -ForegroundColor Yellow
    $containers = docker ps --filter "name=portfolio" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers) {
        Write-Host $containers -ForegroundColor Gray
    } else {
        Write-Host "  No running containers found" -ForegroundColor Red
    }
}

Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host "Health Check Complete" -ForegroundColor Cyan
Write-Host "============================================================================`n" -ForegroundColor Cyan
