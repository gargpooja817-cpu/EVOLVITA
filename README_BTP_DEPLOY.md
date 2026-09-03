# EvolveVita — SAP BTP Deployment Guide
**Region: US10-001 | CF API: `https://api.cf.us10-001.hana.ondemand.com`**

---

## Files Created for BTP Deployment

| File | Purpose |
|---|---|
| [`mta.yaml`](./mta.yaml) | **Master** MTA descriptor — deploys all layers in one command |
| [`xs-security.json`](./xs-security.json) | XSUAA security descriptor (candidate/recruiter/admin roles) |
| [`manifest.json`](./manifest.json) | HTML5 Application Repository app descriptor |
| [`xs-app.json`](./xs-app.json) | AppRouter routing (UI → CAP → FastAPI) |
| [`vite.config.js`](./vite.config.js) | Updated with `base: './'` for BTP hosting |
| [`backend/manifest.yml`](./backend/manifest.yml) | CF manifest for FastAPI Python app |
| [`backend/Procfile`](./backend/Procfile) | CF process declaration for uvicorn |
| [`backend/runtime.txt`](./backend/runtime.txt) | Python 3.11 buildpack spec |
| [`backend/main.py`](./backend/main.py) | Updated CORS + `/health` endpoint |
| [`sap/cap/package.json`](./sap/cap/package.json) | CAP Node.js dependencies + CDS config |
| [`sap/cap/.cdsrc.json`](./sap/cap/.cdsrc.json) | CDS runtime config (HANA prod / SQLite dev) |
| [`sap/cap/manifest.yml`](./sap/cap/manifest.yml) | CF manifest for CAP Node.js service |
| [`deploy-btp.ps1`](./deploy-btp.ps1) | PowerShell deployment script |

---

## Prerequisites — Install These First

```powershell
# 1. SAP CF CLI
# Download: https://github.com/cloudfoundry/cli/releases/latest
# Verify:
cf version

# 2. MTA Build Tool (mbt)
npm install -g mbt
mbt --version

# 3. SAP CDS Development Kit
npm install -g @sap/cds-dk
cds --version

# 4. MultiApps CF CLI Plugin (for cf deploy)
cf install-plugin multiapps
```

---

## Step 1 — Fill in Your BTP Details

Open [`deploy-btp.ps1`](./deploy-btp.ps1) and set your org and space:

```powershell
$CF_ORG   = "your-org-name"    # ← from BTP Cockpit → Cloud Foundry → Org
$CF_SPACE = "dev"              # ← typically "dev" or "trial"
```

---

## Step 2 — Check Entitlements in BTP Cockpit

Your BTP subaccount needs these service entitlements:

| Service | Plan | Required For |
|---|---|---|
| `hana` | `hdi-shared` | SAP HANA Cloud schema deployment |
| `xsuaa` | `application` | Authentication & role management |
| `destination` | `lite` | Service routing between apps |
| `html5-apps-repo` | `app-host` | Hosting the React SPA |
| `html5-apps-repo` | `app-runtime` | Serving the React SPA at runtime |

> **BTP Cockpit** → Your Subaccount → Entitlements → Edit → Add all above

---

## Step 3 — Deploy (Recommended: MTA)

```powershell
# Navigate to project root
cd "c:\Users\pooja garg\OneDrive\EVOLVITA"

# Run the deployment script (MTA — deploys everything at once)
.\deploy-btp.ps1

# Or deploy individual layers:
.\deploy-btp.ps1 -Target backend   # FastAPI only
.\deploy-btp.ps1 -Target cap       # CAP service only
.\deploy-btp.ps1 -Target frontend  # React SPA only
```

### Alternative: Manual Step-by-Step

```powershell
# 1. Login
cf api https://api.cf.us10-001.hana.ondemand.com
cf login
cf target -o YOUR_ORG -s YOUR_SPACE

# 2. Create services
cf create-service hana hdi-shared evolvita-hana
cf create-service xsuaa application evolvita-xsuaa -c xs-security.json
cf create-service destination lite evolvita-destination
cf create-service html5-apps-repo app-host evolvita-html5-repo-host
cf create-service html5-apps-repo app-runtime evolvita-html5-repo-rt

# 3. Build MTA
mbt build --mtar evolvita.mtar

# 4. Deploy MTA
cf deploy evolvita.mtar
```

---

## Step 4 — Set Frontend Environment Variable

After deploy, set your BTP backend URL in the frontend:

```powershell
# Set the API URL environment variable for the deployed frontend
# (Edit .env.production before build, or set via BTP Cockpit)
VITE_API_URL=https://evolvita-backend.cfapps.us10-001.hana.ondemand.com
```

> **For Firebase Auth**: Add your Firebase credentials to `.env.production` before running `npm run build`.

---

## Post-Deploy URLs

| What | URL |
|---|---|
| 🌐 **Main App (Approuter)** | `https://evolvita.cfapps.us10-001.hana.ondemand.com` |
| 🤖 **FastAPI Backend** | `https://evolvita-backend.cfapps.us10-001.hana.ondemand.com` |
| 📖 **FastAPI Swagger Docs** | `https://evolvita-backend.cfapps.us10-001.hana.ondemand.com/docs` |
| ❤️ **Health Check** | `https://evolvita-backend.cfapps.us10-001.hana.ondemand.com/health` |
| 🗄️ **CAP OData V4** | `https://evolvita-cap.cfapps.us10-001.hana.ondemand.com/odata/v4/` |

---

## Troubleshooting

```powershell
# View live logs
cf logs evolvita-backend --recent
cf logs evolvita-cap --recent

# Check app status
cf apps
cf services

# Restart an app
cf restart evolvita-backend

# Check env variables
cf env evolvita-backend

# SSH into container for debugging
cf ssh evolvita-backend
```

### Common Issues

| Error | Fix |
|---|---|
| `App failed to start` — FastAPI | Check `cf logs evolvita-backend --recent`. Usually a missing Python dep in `requirements.txt` |
| `Service not found` | Check BTP Cockpit entitlements — add missing service plans |
| `CORS error` in browser | Verify your BTP approuter URL is in `backend/main.py` `_BTP_ORIGINS` |
| `CDS build failed` | Run `npm install` in `sap/cap/` then `npx cds build --production` |
| `HDI deploy failed` | HANA Cloud instance needs to be running — check BTP Cockpit |
