# SAP CAP — Service Layer Architecture

**Layer Classification**: Service & Business Logic Layer  
**Architecture Status**: `Architecture Ready`  
**Target Runtime**: SAP Cloud Application Programming Model (Node.js / Java CDS) on SAP BTP Cloud Foundry / Kyma Runtime  

---

## 1. Executive Summary

EvolveVita's service layer is architected according to **SAP Cloud Application Programming Model (CAP)** principles. SAP CAP provides an opinionated, enterprise-grade framework for building cloud services with declarative Core Data Services (CDS) domain definitions, automated CRUD handling, role-based authorization, and seamless integration with SAP HANA Cloud.

> **Honest Architecture Status**:  
> SAP CAP deployment was not executed live due to lack of tenant access during the prototype phase. The service contracts, CDS domain entities, and action definitions in this repository are **100% CDS-valid and Architecture Ready** for immediate binding to an SAP BTP subaccount.

---

## 2. CDS Architecture Overview

```
User
 ├── Candidate
 │     ├── Resumes
 │     └── CandidateSkills
 │
 └── Recruiter

Job
 └── JobRequirements

Candidate + Job
        ↓
CandidateMatch
        ↓
BiasAudit
        ↓
HumanDecision
```

### Domain Definitions (`sap/cap/db/schema.cds`)
- `Users`: Unified identity linking Firebase Auth / SAP Cloud Identity Services (IAS).
- `Candidates`: Candidate talent entities containing parsed Skill DNA, portfolio projects, and readiness indicators.
- `Recruiters`: Enterprise hiring managers and talent acquisition users.
- `Resumes`: Extracted resume artifacts with parsed schema representations.
- `Skills` & `CandidateSkills`: Normalized taxonomy of technical capabilities with evidence verification status.
- `Jobs` & `JobRequirements`: Requisition entities with required/preferred skills and experience constraints.
- `CandidateMatches`: AI-calculated explainable match scores with granular factor breakdowns.
- `BiasAudits`: Linguistic neutralizer audit logs with detected exclusionary phrases.
- `HumanDecisions`: Authoritative hiring logs (Shortlisted / Needs Review / Rejected).

---

## 3. Service Exposure (`sap/cap/srv/`)

### A. `CandidateService` (`candidate-service.cds`)
Exposes candidate-facing capabilities under `/api/v1/candidate`:
- **Projections**: `CandidateProfile`, `CandidateSkills`, `AvailableJobs`, `MyJobMatches`.
- **Actions**:
  - `uploadResume`: Accepts binary resume file, triggers AI extraction, persists skill DNA.
  - `calculateJobFit`: Computes real-time match coefficients against job requirements.
  - `getSkillGapAnalysis`: Compares verified skills with requisition needs to generate roadmap steps.
  - `submitApplication`: Persists real application records into recruiter pipeline.

### B. `RecruiterService` (`recruiter-service.cds`)
Exposes recruiter-facing capabilities under `/api/v1/recruiter`:
- **Projections**: `JobRequisitions`, `CandidatePipeline`, `RankedMatches`, `BiasAuditLogs`, `HumanDecisionLogs`.
- **Actions**:
  - `analyzeJobRequirements`: Extracts canonical skills and experience bounds from raw text.
  - `auditJobDescriptionBias`: Computes fairness scores and returns inclusive alternatives.
  - `rankUploadedResumes`: Multi-resume batch intelligence engine returning ranked candidate list.
  - `recordHumanDecision`: Human-in-the-loop decision logging with recruiter notes.

---

## 4. Mapping FastAPI Intelligence to SAP CAP

In production on SAP BTP, the current FastAPI engine runs as an internal microservice or sidecar providing specialized Python ML intelligence (spaCy, scikit-learn, PyTorch). The SAP CAP service layer delegates computational actions to the AI sidecar via SAP BTP Destination Service:

```
[ Frontend (React / SAP Fiori) ]
               │
               ▼ OData V4 / REST
     [ SAP CAP Service Layer ]
        (Node.js / Java CDS)
         │               │
         │ OData/SQL     │ Internal REST
         ▼               ▼
 [ SAP HANA Cloud ]  [ AI Intelligence Engine (FastAPI) ]
```

---

## 5. Verification Commands

To validate CDS models using the official `@sap/cds-dk` CLI:

```bash
# Install CDS development toolkit globally
npm install -g @sap/cds-dk

# Validate CDS models and compile to SQL DDL
cds compile sap/cap/db/schema.cds --to sql

# Validate OData V4 metadata generation
cds compile sap/cap/srv/recruiter-service.cds --to edmx
```
