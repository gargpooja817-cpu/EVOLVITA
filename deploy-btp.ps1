# ═══════════════════════════════════════════════════════════════════════════════
#  EvolveVita — SAP BTP Deployment Script
#  Region : US10-001
#  CF API  : https://api.cf.us10-001.hana.ondemand.com
#
#  Usage:
#    .\deploy-btp.ps1                  # Full deploy (all 3 layers)
#    .\deploy-btp.ps1 -Target frontend # Deploy only the React SPA
#    .\deploy-btp.ps1 -Target backend  # Deploy only the FastAPI backend
#    .\deploy-btp.ps1 -Target cap      # Deploy only the CAP service
#    .\deploy-btp.ps1 -Target mta      # Full MTA deploy (recommended)
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [ValidateSet("all", "frontend", "backend", "cap", "mta")]
    [string]$Target = "mta"
)

# ─── Configuration ────────────────────────────────────────────────────────────
$CF_API      = "https://api.cf.us10-001.hana.ondemand.com"
$CF_ORG      = ""          # ← Fill in your CF Organization name
$CF_SPACE    = ""          # ← Fill in your CF Space name (e.g. "dev" or "trial")
$APP_NAME    = "evolvita"
$BTP_DOMAIN  = "cfapps.us10-001.hana.ondemand.com"

# ─── Colors ───────────────────────────────────────────────────────────────────
function Write-Step   { param($msg) Write-Host "`n▶  $msg" -ForegroundColor Cyan }
function Write-Ok     { param($msg) Write-Host "  ✔ $msg" -ForegroundColor Green }
function Write-Warn   { param($msg) Write-Host "  ⚠  $msg" -ForegroundColor Yellow }
function Write-Err    { param($msg) Write-Host "  ✘ $msg" -ForegroundColor Red }
function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║   EvolveVita — SAP BTP Deployment  (US10-001)       ║" -ForegroundColor Magenta
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

# ─── Prerequisite Check ───────────────────────────────────────────────────────
function Check-Prerequisites {
    Write-Step "Checking prerequisites..."

    $missing = @()

    if (-not (Get-Command "cf" -ErrorAction SilentlyContinue)) {
        $missing += "cf CLI  → https://github.com/cloudfoundry/cli/releases"
    }
    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        $missing += "Node.js → https://nodejs.org"
    }
    if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        $missing += "npm     → bundled with Node.js"
    }

    # Optional but recommended
    if (-not (Get-Command "mbt" -ErrorAction SilentlyContinue)) {
        Write-Warn "mbt (MTA Build Tool) not found. Install: npm i -g mbt"
        Write-Warn "Without mbt, using manual cf push instead of mta deploy."
        $global:USE_MTA = $false
    } else {
        $global:USE_MTA = $true
        Write-Ok "mbt found: $(mbt --version)"
    }

    if (-not (Get-Command "cds" -ErrorAction SilentlyContinue)) {
        Write-Warn "@sap/cds-dk not found. Install: npm i -g @sap/cds-dk"
    } else {
        Write-Ok "cds found: $(cds --version)"
    }

    if ($missing.Count -gt 0) {
        Write-Err "Missing required tools:"
        $missing | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        exit 1
    }

    Write-Ok "cf CLI:   $(cf version)"
    Write-Ok "node:     $(node --version)"
    Write-Ok "npm:      $(npm --version)"
}

# ─── CF Login ─────────────────────────────────────────────────────────────────
function Login-CF {
    Write-Step "Connecting to SAP BTP Cloud Foundry..."

    cf api $CF_API
    if ($LASTEXITCODE -ne 0) { Write-Err "Failed to set CF API"; exit 1 }

    Write-Host "`n  Enter your SAP BTP credentials when prompted:" -ForegroundColor Yellow
    cf login

    if ($LASTEXITCODE -ne 0) { Write-Err "CF login failed"; exit 1 }

    # Set org and space if provided
    if ($CF_ORG -ne "" -and $CF_SPACE -ne "") {
        cf target -o $CF_ORG -s $CF_SPACE
        if ($LASTEXITCODE -ne 0) { Write-Err "Failed to target org/space"; exit 1 }
    } else {
        Write-Warn "CF_ORG and CF_SPACE not set in script. Select them interactively above."
    }

    Write-Ok "Connected to SAP BTP US10-001"
}

# ─── Create BTP Services ──────────────────────────────────────────────────────
function Create-Services {
    Write-Step "Creating BTP service instances..."

    $services = @(
        @{ Name="evolvita-hana";           Service="hana";           Plan="hdi-shared"   },
        @{ Name="evolvita-xsuaa";          Service="xsuaa";          Plan="application"  },
        @{ Name="evolvita-destination";    Service="destination";    Plan="lite"         },
        @{ Name="evolvita-html5-repo-host";Service="html5-apps-repo";Plan="app-host"     },
        @{ Name="evolvita-html5-repo-rt";  Service="html5-apps-repo";Plan="app-runtime"  }
    )

    foreach ($svc in $services) {
        $exists = cf service $svc.Name 2>&1
        if ($exists -match "OK") {
            Write-Ok "$($svc.Name) already exists — skipping"
        } else {
            Write-Host "  Creating $($svc.Name)..." -ForegroundColor Gray
            if ($svc.Name -eq "evolvita-xsuaa") {
                cf create-service $svc.Service $svc.Plan $svc.Name -c xs-security.json
            } else {
                cf create-service $svc.Service $svc.Plan $svc.Name
            }
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "Could not create $($svc.Name) — may not be available in trial. Continuing..."
            } else {
                Write-Ok "$($svc.Name) created"
            }
        }
    }
}

# ─── Build Frontend ───────────────────────────────────────────────────────────
function Build-Frontend {
    Write-Step "Building React/Vite frontend..."
    $rootDir = $PSScriptRoot

    Push-Location $rootDir
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Err "npm install failed"; Pop-Location; exit 1 }

    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Err "npm run build failed"; Pop-Location; exit 1 }
    Pop-Location

    Write-Ok "Frontend built → dist/"
}

# ─── Deploy Frontend (HTML5 App Repository) ───────────────────────────────────
function Deploy-Frontend {
    Build-Frontend

    Write-Step "Deploying frontend to HTML5 Application Repository..."

    # The HTML5 App Repo requires a zip of the dist folder + manifest.json
    $distPath = Join-Path $PSScriptRoot "dist"
    $zipPath  = Join-Path $PSScriptRoot "evolvita-ui.zip"

    if (Test-Path $zipPath) { Remove-Item $zipPath }

    # Copy manifest.json into dist for packaging
    Copy-Item (Join-Path $PSScriptRoot "manifest.json") $distPath -Force

    Compress-Archive -Path "$distPath\*" -DestinationPath $zipPath
    Write-Ok "Zipped dist → evolvita-ui.zip"

    Write-Warn "Upload evolvita-ui.zip to HTML5 Application Repository via BTP Cockpit:"
    Write-Host "  → https://cockpit.us10.hana.ondemand.com/" -ForegroundColor Yellow
    Write-Host "  → Subaccount → HTML5 Applications → Upload" -ForegroundColor Yellow
}

# ─── Deploy Backend (FastAPI) ─────────────────────────────────────────────────
function Deploy-Backend {
    Write-Step "Deploying FastAPI AI backend to Cloud Foundry..."

    $backendDir = Join-Path $PSScriptRoot "backend"
    Push-Location $backendDir

    cf push evolvita-backend -f manifest.yml
    if ($LASTEXITCODE -ne 0) { Write-Err "Backend deploy failed"; Pop-Location; exit 1 }

    Pop-Location
    Write-Ok "Backend deployed → https://evolvita-backend.$BTP_DOMAIN"
}

# ─── Deploy CAP Service ───────────────────────────────────────────────────────
function Deploy-CAP {
    Write-Step "Building and deploying SAP CAP service..."

    $capDir = Join-Path $PSScriptRoot "sap\cap"
    Push-Location $capDir

    # Install CAP dependencies
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Err "CAP npm install failed"; Pop-Location; exit 1 }

    # Build CDS for production
    npx cds build --production
    if ($LASTEXITCODE -ne 0) { Write-Err "CDS build failed"; Pop-Location; exit 1 }

    Write-Ok "CDS compiled successfully"

    # Push the CAP service
    cf push evolvita-cap -f manifest.yml
    if ($LASTEXITCODE -ne 0) { Write-Err "CAP service deploy failed"; Pop-Location; exit 1 }

    Pop-Location
    Write-Ok "CAP service deployed → https://evolvita-cap.$BTP_DOMAIN"
}

# ─── Full MTA Deploy ──────────────────────────────────────────────────────────
function Deploy-MTA {
    Write-Step "Running full MTA build and deploy..."
    $rootDir = $PSScriptRoot
    Push-Location $rootDir

    # Build the MTA archive
    Write-Host "  Building MTA archive..." -ForegroundColor Gray
    mbt build --mtar evolvita.mtar
    if ($LASTEXITCODE -ne 0) { Write-Err "MTA build failed"; Pop-Location; exit 1 }
    Write-Ok "MTA archive built → evolvita.mtar"

    # Deploy the MTA archive
    Write-Host "  Deploying to SAP BTP..." -ForegroundColor Gray
    cf deploy evolvita.mtar --strategy blue-green
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Blue-green deploy failed, trying standard deploy..."
        cf deploy evolvita.mtar
        if ($LASTEXITCODE -ne 0) { Write-Err "MTA deploy failed"; Pop-Location; exit 1 }
    }

    Pop-Location
    Write-Ok "MTA deployed successfully"
}

# ─── Post-Deploy Status ───────────────────────────────────────────────────────
function Show-Status {
    Write-Step "Deployment Status"

    cf apps
    Write-Host ""
    Write-Host "  🌐 Application URLs:" -ForegroundColor Cyan
    Write-Host "     Approuter (Main):  https://evolvita.$BTP_DOMAIN" -ForegroundColor White
    Write-Host "     FastAPI Backend:   https://evolvita-backend.$BTP_DOMAIN" -ForegroundColor White
    Write-Host "     FastAPI Docs:      https://evolvita-backend.$BTP_DOMAIN/docs" -ForegroundColor White
    Write-Host "     CAP OData:         https://evolvita-cap.$BTP_DOMAIN/odata/v4/" -ForegroundColor White
    Write-Host "     CAP Metadata:      https://evolvita-cap.$BTP_DOMAIN/odata/v4/candidate/\$metadata" -ForegroundColor White
    Write-Host ""
    Write-Host "  📋 Useful CF commands:" -ForegroundColor Cyan
    Write-Host "     cf logs evolvita-backend --recent" -ForegroundColor Gray
    Write-Host "     cf logs evolvita-cap --recent" -ForegroundColor Gray
    Write-Host "     cf env evolvita-backend" -ForegroundColor Gray
    Write-Host "     cf services" -ForegroundColor Gray
}

# ─── MAIN ─────────────────────────────────────────────────────────────────────
Write-Banner
Check-Prerequisites
Login-CF
Create-Services

switch ($Target) {
    "frontend" { Deploy-Frontend }
    "backend"  { Deploy-Backend  }
    "cap"      { Deploy-CAP      }
    "mta"      {
        if ($global:USE_MTA) {
            Deploy-MTA
        } else {
            Write-Warn "mbt not found. Falling back to individual cf push deploys..."
            Build-Frontend
            Deploy-Backend
            Deploy-CAP
        }
    }
    "all"      {
        if ($global:USE_MTA) {
            Deploy-MTA
        } else {
            Build-Frontend
            Deploy-Backend
            Deploy-CAP
        }
    }
}

Show-Status

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✔  EvolveVita deployed to SAP BTP US10-001!        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Green
