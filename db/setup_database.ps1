# Medicare Database Setup Script
param([string]$Password = "")

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Medicare Database Setup" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$DB_NAME = "medicare"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"

if ([string]::IsNullOrEmpty($Password)) {
    $securePassword = Read-Host "Enter PostgreSQL password for user postgres" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$env:PGPASSWORD = $Password
Write-Host "Connecting to: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`n" -ForegroundColor Yellow

$files = @("schema.sql", "functions.sql", "triggers.sql", "indexes_and_views.sql", "seed.sql")
$success = $true

foreach ($file in $files) {
    Write-Host "Running: $file..." -ForegroundColor Yellow
    $output = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $file 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Success!`n" -ForegroundColor Green
    } else {
        Write-Host "  Failed!`n" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        $success = $false
        break
    }
}

$env:PGPASSWORD = $null

if ($success) {
    Write-Host "`n======================================" -ForegroundColor Green
    Write-Host "Database setup complete!" -ForegroundColor Green
    Write-Host "======================================`n" -ForegroundColor Green
} else {
    Write-Host "`nSetup failed!`n" -ForegroundColor Red
    exit 1
}
