# EvolveVita — Enterprise Workforce Intelligence Architecture

**Author**: Senior Full-Stack Engineer & SAP Solution Architect  
**Project**: EvolveVita Workforce Intelligence Platform  
**Target Environment**: SAP BTP / SAP CAP / SAP HANA Cloud / SAP Fiori  

---

## 1. System Philosophy

> **"AI understands skills. SAP provides enterprise architecture. Humans make the final hiring decision."**

EvolveVita eliminates keyword-based black-box filtering by evaluating candidates on verified skill DNA, repository evidence, and transparent match coefficients. Final hiring decisions are strictly preserved for human reviewers, providing an auditable, bias-conscious talent intelligence system.

---

## 2. High-Level Enterprise Architecture

```
                     ┌────────────────────────────────┐
                     │          EVOLVITA              │
                     └───────────────┬────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                       │
 ┌───────▼──────────────┐                                ┌───────▼──────────────┐
 │ CANDIDATE EXPERIENCE │                                │ RECRUITER EXPERIENCE │
 │  Talent & Learning   │                                │  SAP Fiori / SAPUI5  │
 └───────┬──────────────┘                                └───────┬──────────────┘
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   AI INTELLIGENCE     │
                         │ Linguistic & Matcher  │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │       SAP CAP         │
                         │    Service Layer      │
                         │  Architecture Ready   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    SAP HANA CLOUD     │
                         │   Persistence Layer   │
                         │   HANA Cloud Ready    │
                         └───────────────────────┘
```

---

## 3. Technology Alignment (Exactly 3 SAP Technologies)

EvolveVita is intentionally built around **three foundational SAP technologies**:

### 1. SAP CAP (Cloud Application Programming Model)
- **Role**: Declarative service layer, domain data modeling, OData V4 exposure, and business service coordination.
- **Artifacts**: 
  - [`sap/cap/db/schema.cds`](file:///sap/cap/db/schema.cds)
  - [`sap/cap/srv/candidate-service.cds`](file:///sap/cap/srv/candidate-service.cds)
  - [`sap/cap/srv/recruiter-service.cds`](file:///sap/cap/srv/recruiter-service.cds)
- **Architecture Status**: `SAP CAP — Architecture Ready`

### 2. SAP HANA Cloud
- **Role**: Enterprise in-memory columnar database, real-time calculation views, and vector embedding similarity engine.
- **Artifacts**: 
  - [`sap/HANA_ARCHITECTURE.md`](file:///sap/HANA_ARCHITECTURE.md)
- **Architecture Status**: `SAP HANA Cloud — HANA Cloud Ready`

### 3. SAP Fiori / SAPUI5
- **Role**: Enterprise UX design principles governing the recruiter experience: structured Page Headers, Filter Bars, responsive Data Tables with semantic Status Indicators, and Object Page candidate inspection.
- **Artifacts**: Recruiter Experience implementation in `src/pages/recruiter/` and `src/styles/recruiter.css`.
- **Architecture Status**: `SAP Fiori / SAPUI5 — Fiori-inspired Prototype`

---

## 4. Current Prototype vs. Production Target

```
CURRENT PROTOTYPE (Hackathon Delivery):
┌──────────────────────────────────────────────────────────────┐
│ Frontend (React 19 + Vite + Framer Motion + Fiori Patterns)   │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP / REST
┌──────────────────────────────▼───────────────────────────────┐
│ FastAPI Intelligence Engine (Resume Parser, NLP, Matcher)     │
└──────────────────────────────┬───────────────────────────────┘
                               │ Local Persistence
┌──────────────────────────────▼───────────────────────────────┐
│ SQLite & In-Memory JSON Store (HANA-Ready Schema Mapping)     │
└──────────────────────────────────────────────────────────────┘

SAP-READY ENTERPRISE TARGET (BTP Production):
┌──────────────────────────────────────────────────────────────┐
│ SAP Fiori / SAPUI5 & Enterprise Web Application              │
└──────────────────────────────┬───────────────────────────────┘
                               │ OData V4
┌──────────────────────────────▼───────────────────────────────┐
│ SAP CAP Service Layer (Node.js/Java CDS on SAP BTP)           │
│  ├── CandidateService (/api/v1/candidate)                    │
│  └── RecruiterService (/api/v1/recruiter)                    │
└──────────────┬───────────────────────────────┬───────────────┘
               │ Internal Microservice Binding │ Native OData/SQL
┌──────────────▼──────────────┐ ┌──────────────▼───────────────┐
│ AI Engine Sidecar (FastAPI)  │ │ SAP HANA Cloud Database       │
│ Python ML & Vector Scoring   │ │ Column Store + Vector Engine │
└─────────────────────────────┘ └──────────────────────────────┘
```

> **Technical Implementation Note**:  
> SAP environment access was unavailable during the prototype phase. EvolveVita is architected for seamless integration with SAP CAP, SAP HANA Cloud, and SAP Fiori/SAPUI5 when the required SAP environment is provisioned.

---

## 5. End-to-End Workflow Verification

### Candidate Flow
1. **Authentication**: Sign up with email or Google; role persisted.
2. **Profile Creation**: Name, target role, contact information.
3. **Resume Parsing**: Real PDF/DOCX parsed by AI engine; skills & projects extracted.
4. **Job Discovery**: Real active job requisitions listed from database.
5. **Explainable Matchmaking**: Real-time evaluation against job parameters.
6. **Skill Gap & Roadmap**: Dynamic gaps and step-by-step roadmap computed strictly from missing requirements.

### Recruiter Flow
1. **Requisition Authoring**: Structured job creation with multi-column layout.
2. **Linguistic Bias Audit**: One-click analysis detecting exclusionary phrasing with neutral recommendations.
3. **Resume Intelligence / Ranker**: Batch upload of candidate resumes, parsed and ranked against job requirements in an enterprise table.
4. **Candidate Inspection**: Object Page view showing verified Skill DNA, project evidence, and match rationale.
5. **Human Decision Logging**: Shortlist, keep in review, or reject with immutable audit comments.
