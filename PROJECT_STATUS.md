# EvolveVita — Project Status Audit

**Audit date:** 31 August 2026  
**Scope:** Existing React + Vite frontend and FastAPI backend. No architecture rewrite. No major UI work.

---

## Current folder structure

```
EVOLVITA/
  package.json, vite.config.js, index.html, .env
  src/
    App.jsx, main.jsx, index.css, App.css
    context/AuthContext.jsx
    lib/firebase.js
    services/api.js, authService.js, recruiterService.js, candidateService.js
    data/mockRecruiterData.js
    styles/globals.css, recruiter.css, resume-ranker-light.css
    pages/ Landing, Login, Signup, ChooseRole
    pages/recruiter/ dashboard, jobs, create-job, candidates, details, resume ranker, bias, decisions, settings
    pages/candidate/ dashboard, profile, resume, jobs, skill-gap, learning, settings
    components/layout/, recruiter/, common/, three/
  backend/
    main.py          (all HTTP routes live here; no routers/ package)
    models/schemas.py
    database/db.py   (SQLite users)
    services/        resume_parser, ranker, matcher, job_analyzer, bias_analyzer, skill_extractor, user_service
    data/            sample_jobs.json, sample_candidates.json, evolvevita.db
    requirements.txt
  .venv/             (project Python used for uvicorn on 8001)
  backend/venv/      (second local venv)
```

There is **no git repository** in this workspace, so recent change history is inferred from code, not commits.

---

## 1. What is already working

### Runtime (verified this audit)

- Frontend: `npm run dev` starts Vite 8.2.2. Port **5173 was already in use**; this session bound **http://localhost:5174/**.
- Backend: the specified command starts Uvicorn on **http://127.0.0.1:8001**.
- Live checks: `GET /` (Online), `GET /health` (`healthy`), `GET /api/jobs` (**6 jobs**), `GET /api/candidates` (**10 candidates**).
- OpenAPI docs: `/docs` (app loads; 29 routes registered).

### Backend intelligence (implemented in `backend/main.py` + services)

- Resume parse: `POST /api/resumes/parse` (PDF/DOCX via PyMuPDF + python-docx).
- Job analysis: `POST /api/jobs/analyze`.
- Job CRUD: `GET/POST /api/jobs`, `GET/PUT/DELETE /api/jobs/{id}` (JSON file store).
- Candidate CRUD-ish: list/get/create/update (`decisionStatus`, `recruiterNotes`).
- Matching: `POST /api/matching/analyze`, `POST /api/candidates/match`.
- Ranking: `POST /api/matching/rank`, alias `POST /api/rank`.
- Recruiter bulk resume rank: `POST /api/candidates/rank` (multipart files + job_id or pasted JD).
- Bias: `POST /api/bias/analyze`, `POST /api/bias/apply-suggestions`.
- Skill gap: `POST /api/skills/gap`.
- User profile APIs: `POST /api/users/profile`, `GET/PUT /api/users/me`, `POST /api/users/role`.
- SQLite `users` table is created on import of `database/db.py`. Jobs/candidates persist in JSON, not SQLite.

### Frontend that actually talks to the API (with mock fallback when offline)

- `src/services/api.js` — `VITE_API_URL` or `http://127.0.0.1:8001`.
- Recruiter **Resume Intelligence / ranker** (`/recruiter/resume-intelligence`) → `/api/candidates/rank` + `/health` + jobs list.
- Candidate **Resume Intelligence** (`/candidate/resume`) → `candidateService.parseResume` → `/api/resumes/parse`.
- Create Job AI audit → `/api/jobs/analyze` + `/api/bias/analyze`; create job POST.
- Hiring Decisions → list/update candidates.
- Candidate Job Matches → jobs + `/api/matching/analyze`.
- Skill Gap page → `/api/skills/gap`.
- Candidate dashboard loads jobs from API (match scores still locally heuristic).

### Routing and demo auth

- Public: `/`, `/login`, `/signup`, `/choose-role`.
- Recruiter (role-gated): dashboard, create-job, jobs, candidates, candidates/:id, bias-audit, resume-intelligence, decisions, settings.
- Candidate (role-gated): dashboard, profile, resume, jobs, skill-gap, learning, settings.
- `ProtectedRoute` + `authService` (localStorage `evolvevita_user` / `evolvevita_token`) — demo login and demo recruiter/candidate shortcuts work **without Firebase**.

### UI shell

- Recruiter and candidate layouts (sidebar + navbar + outlet).
- Shared recruiter components: cards, match score, filters, Three.js dashboard core, Recharts.
- `globals.css` is a **light enterprise** token set; recruiter workspace CSS still exists.

---

## 2. What is partially implemented

| Area | Status |
| --- | --- |
| **Firebase Auth** | `src/lib/firebase.js` + `src/context/AuthContext.jsx` exist. `.env` Firebase keys are **empty**, so Firebase stays disabled and AuthContext uses a simulated path. **`AuthProvider` is not mounted** in `main.jsx` / `App.jsx`. **No page calls `useAuth`.** Live login still uses `authService` only. |
| **Auth tokens vs API** | `api.js` reads `evolvevita_auth_token`. `authService` writes `evolvevita_token`. User APIs therefore usually see Bearer token from AuthContext (unused) or none. Backend `get_current_user_uid` is a **JWT payload decode without signature verification**, plus query `uid` and a `guest-dev-user` fallback. |
| **SQLite users** | Schema + `UserService` work. Not used by login/signup UI. Jobs/candidates remain JSON. |
| **Create Job** | Analyze/bias/create hit the API; listing after create may not show on Jobs page (that page is mock). |
| **Candidate dashboard / profile / learning / settings** | Pages exist; most content is hardcoded (Marcus Vance) or mock, not the logged-in user’s parsed resume. |
| **recruiterService.analyzeBias fallback** | Offline mock uses Python `issues.append` instead of `issues.push` — would throw if backend is down and JD contains “young” / “digital native”. |
| **ResumeIntelligence.jsx** | Unused default import: `import candidateService from '../../services/api'` (does not crash; parse uses `candidateService` named `service`). |
| **Backend README** | Still documents port **8000**; project runs on **8001**. |

---

## 3. What is broken (or inconsistent enough to look broken)

- **Visual split:** Landing, Login, Signup, Choose Role are **dark** (`#05070a`). Workspace `globals.css` is **light**. Recruiter Resume Ranker has a **separate light** stylesheet. This matches the report that recent AI work damaged visual consistency — not a startup crash.
- **Jobs Management, Candidate Discovery, Recruiter Dashboard, Bias Audit, Recruiter Settings/Navbar/Sidebar** still use **`mockRecruiterData.js`**, not `/api/jobs` or `/api/candidates` / `/api/bias/analyze`. Creating a job in the API does not update the Jobs list UI.
- **Bias Audit page** is client-side keyword scoring only; does not call the working bias API.
- **Dual auth systems** (Firebase context vs simulated `authService`) are disconnected; wiring AuthProvider later without unifying storage keys would confuse API auth.
- **No git** — cannot verify diffs; nothing is “broken” as an import graph: App routes resolve, backend `from main import app` succeeds.
- **PyMuPDF** deprecation warning: `import fitz` (non-blocking).
- **Vite** may land on 5174 if 5173 is already occupied.

Nothing found that **prevents** `npm run dev` or uvicorn from starting.

---

## 4. What was recently changed (inferred)

Likely last-agent work (Firebase in `package.json`/`package-lock.json`, new auth files, user APIs, ranker UI):

- Added `firebase` dependency and `src/lib/firebase.js`.
- Added `AuthContext` + backend user profile/role endpoints + SQLite.
- Recruiter Resume Ranker + `resume-ranker-light.css` + `/api/candidates/rank`.
- API base URL standardized to `127.0.0.1:8001`.
- Theme tokens in `globals.css` shifted to light; public pages left dark.
- Auth pages still on simulated `authService`, so Firebase/SQLite work is **parallel**, not integrated.

---

## 5. Missing features

- Real Firebase config and verified ID-token auth on the API.
- Unified session: one storage key, `AuthProvider` wrapping the tree, ProtectedRoute using it.
- Persist parsed resumes into candidate profiles (SQLite or JSON) instead of one-off parse UI.
- Wire Jobs, Candidates, Dashboard, Bias Audit to existing APIs (rule: no mock when API exists).
- Persist hiring decisions only works when API is up; discovery list is still mock.
- Password reset, remember-me, Google button on Login (AuthContext has Google; Login page does not).
- Notifications/settings save to backend.
- Candidate-specific match using the logged-in profile, not hardcoded `candidate-1`.
- Tests, git remote, production env, LLM-based ranking (current matching is rule/heuristic).
- `backend/routers/` (not needed; everything is in `main.py`).

---

## 6. Recommended continuation plan

Do **not** rebuild. Work in this order:

1. **UI consistency (incremental):** Align public pages with workspace tokens *or* restore the previous polished dark/glass system — page by page, reuse `glass-panel` / layout CSS. Do not replace App routing.
2. **Connect mock pages to live APIs:** Jobs Management → `recruiterService.getJobs`; Candidate Discovery → `candidateService.getCandidates`; Bias Audit → `analyzeBias`; Recruiter dashboard stats from those lists.
3. **Auth integration (inspect first, then one path):** Either finish Firebase + AuthProvider **or** keep demo `authService` and later swap. Unify token keys with `api.js`. Do not delete demo shortcuts until Firebase `.env` is filled.
4. **Identity:** After login/role, persist role via `/api/users/role`; show real name/avatar in sidebars instead of `mockRecruiter`.
5. **Resume Intelligence:** Keep `/api/resumes/parse` and `/api/candidates/rank` as-is. Optionally save parse results onto the candidate record.
6. **Cleanup (small):** `issues.push` in recruiterService fallback; remove unused Resume Intelligence import; README port 8001.

---

## package.json (frontend)

**Runtime:** react 19, react-dom, react-router-dom 7, framer-motion, lucide-react, recharts, three, @react-three/fiber, @react-three/drei, **firebase**.  
**Dev:** vite 8, @vitejs/plugin-react, oxlint.

## .env

- `VITE_API_URL=http://127.0.0.1:8001` (used).
- `VITE_FIREBASE_*` present but **blank** → `isFirebaseConfigured === false`.

## Database

- **JSON:** `backend/data/sample_jobs.json`, `sample_candidates.json` (runtime source of truth for jobs/candidates).
- **SQLite:** `backend/data/evolvevita.db`, table `users` only. `init_db()` runs on module load.

## Auth state (current)

- **Active in UI:** simulated `authService` + `ProtectedRoute`.
- **Inactive:** `AuthProvider` / Firebase.
- Demo emails in `authService`: `recruiter@evolvevita.com`, `candidate@evolvevita.com`.

---

## Blocking errors fixed in this audit

**None.** Import of `main:app` succeeded; Vite started; health and list APIs returned data. No code changes were required to run the stack.
