# Fly.io Secrets Setup Script
# This script helps you set all required secrets for your backend

Write-Host "=== Fly.io Backend Secrets Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if flyctl is available
if (-not (Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "Error: flyctl is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install it with: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

# Make sure we're in the backend directory
$currentDir = (Get-Location).Path
if (-not $currentDir.EndsWith("backend")) {
    Write-Host "Warning: Not in backend directory. Changing to backend..." -ForegroundColor Yellow
    cd backend
}

Write-Host "Please provide the following values (press Enter to skip optional ones):" -ForegroundColor Green
Write-Host ""

# Database URL
$DATABASE_URL = Read-Host "DATABASE_URL (from flyctl postgres create)"
if ([string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    Write-Host "Error: DATABASE_URL is required!" -ForegroundColor Red
    exit 1
}

# JWT Secret
$JWT_SECRET = Read-Host "JWT_SECRET (random string, keep it secret!)"
if ([string]::IsNullOrWhiteSpace($JWT_SECRET)) {
    $JWT_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "Generated random JWT_SECRET: $JWT_SECRET" -ForegroundColor Yellow
}

# Frontend URL
Write-Host ""
Write-Host "What's your FRONTEND URL? (e.g., https://my-portfolio.fly.dev)" -ForegroundColor Cyan
$FRONTEND_URL = Read-Host "Frontend URL"
if ([string]::IsNullOrWhiteSpace($FRONTEND_URL)) {
    $FRONTEND_URL = "https://personal-portfolio-web.fly.dev"
    Write-Host "Using default: $FRONTEND_URL" -ForegroundColor Yellow
}

# SendGrid Configuration
Write-Host ""
Write-Host "=== SendGrid Email Configuration ===" -ForegroundColor Cyan
$SMTP_PASS = Read-Host "SendGrid API Key (from SendGrid dashboard)"
$SMTP_FROM = Read-Host "Verified sender email (verified in SendGrid)"

if ([string]::IsNullOrWhiteSpace($SMTP_PASS)) {
    Write-Host "Warning: No SendGrid API key provided. Email notifications will not work." -ForegroundColor Yellow
    $setupEmail = Read-Host "Continue without email? (y/n)"
    if ($setupEmail -ne 'y') {
        Write-Host "Please set up SendGrid first and run this script again." -ForegroundColor Yellow
        exit 0
    }
}

# Admin Email
Write-Host ""
$ADMIN_EMAIL = Read-Host "Admin email for notifications (default: KaylasSideQuests@pm.me)"
if ([string]::IsNullOrWhiteSpace($ADMIN_EMAIL)) {
    $ADMIN_EMAIL = "KaylasSideQuests@pm.me"
}

Write-Host ""
Write-Host "=== Setting Fly.io Secrets ===" -ForegroundColor Green
Write-Host "This may take a minute and will restart your app..." -ForegroundColor Yellow
Write-Host ""

# Build the secrets command
$secrets = @(
    "DATABASE_URL=$DATABASE_URL",
    "JWT_SECRET=$JWT_SECRET",
    "CORS_ORIGIN=$FRONTEND_URL",
    "NEXT_PUBLIC_SITE_URL=$FRONTEND_URL",
    "SMTP_HOST=smtp.sendgrid.net",
    "SMTP_PORT=587",
    "SMTP_SECURE=false",
    "SMTP_USER=apikey",
    "ADMIN_EMAIL=$ADMIN_EMAIL",
    "MAX_FILE_SIZE=52428800",
    "ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,mp4,mov,webm,pdf,doc,docx"
)

if (-not [string]::IsNullOrWhiteSpace($SMTP_PASS)) {
    $secrets += "SMTP_PASS=$SMTP_PASS"
}

if (-not [string]::IsNullOrWhiteSpace($SMTP_FROM)) {
    $secrets += "SMTP_FROM=$SMTP_FROM"
}

# Set secrets
try {
    flyctl secrets set $secrets
    Write-Host ""
    Write-Host "✓ Secrets set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app should now be configured. Check status with: flyctl status" -ForegroundColor Cyan
} catch {
    Write-Host "Error setting secrets: $_" -ForegroundColor Red
    exit 1
}
