# SAP HANA Cloud — Persistence Layer Architecture

**Layer Classification**: Enterprise Persistence Layer  
**Architecture Status**: `HANA Cloud Ready`  
**Target Database**: SAP HANA Cloud (In-Memory Multi-Model Database)  

---

## 1. Executive Summary

EvolveVita's data persistence architecture is designed from the ground up for **SAP HANA Cloud**. SAP HANA Cloud combines in-memory column-oriented transactional processing (OLTP) with analytical capabilities (OLAP), graph engines, full-text search, and vector storage for AI-powered semantic similarity.

> **Honest Architecture Status**:  
> SAP HANA Cloud live connectivity was not established due to tenant availability during the prototype phase. The existing local database and schema definitions map **1-to-1** with SAP HANA Cloud tables, ensuring zero schema refactoring upon provisioning.

---

## 2. Persistence Abstraction: Prototype to Production

```
DEVELOPMENT PROTOTYPE:
Local Persistence Layer (SQLite / Fast In-Memory Store)
  ├── Fast development cycle
  ├── Local schema migrations
  └── Zero external cloud dependencies

PRODUCTION TARGET:
SAP HANA Cloud In-Memory Multi-Model Database
  ├── Native columnar storage for lightning-fast aggregation
  ├── Calculation Views for real-time recruiter analytics
  ├── SAP HANA Vector Engine for embedding-based skill similarity
  └── Enterprise ACID compliance, multi-tenant isolation, & backup encryption
```

---

## 3. Entity Mapping to SAP HANA Cloud Column Tables

| Entity | HANA Table Name | Storage Type | Key Optimization Features |
| :--- | :--- | :--- | :--- |
| `Users` | `EVOLVEVITA_USERS` | Column Store | Unique hash index on `email`, indexed `firebaseUid` |
| `Candidates` | `EVOLVEVITA_CANDIDATES` | Column Store | Inverted index on `targetRole`, foreign key cascade |
| `Resumes` | `EVOLVEVITA_RESUMES` | Large Column | `LOB` column for extracted text, full-text search index |
| `Skills` | `EVOLVEVITA_SKILLS` | Column Store | Unique code index, category partitioning |
| `CandidateSkills` | `EVOLVEVITA_CANDIDATE_SKILLS`| Column Store | Composite index on `(candidate_id, skill_id)` |
| `Jobs` | `EVOLVEVITA_JOBS` | Column Store | Partitioned by `status` ('Active', 'Draft', 'Closed') |
| `JobRequirements` | `EVOLVEVITA_JOB_REQUIREMENTS` | Column Store | Fast foreign key joins for requirement coefficients |
| `CandidateMatches` | `EVOLVEVITA_CANDIDATE_MATCHES`| Column Store | Real-time analytical calculation views |
| `BiasAudits` | `EVOLVEVITA_BIAS_AUDITS` | Column Store | Historical audit trail, JSON column for issue breakdown |
| `HumanDecisions` | `EVOLVEVITA_HUMAN_DECISIONS` | Column Store | Audit compliance logging, immutable timestamping |

---

## 4. SAP HANA Cloud Advanced Capabilities for EvolveVita

### A. SAP HANA Vector Engine
SAP HANA Cloud natively supports **vector embeddings** (`REAL_VECTOR` data type). In production:
- Candidate skill profiles and project descriptions are converted into dense vector embeddings.
- Job descriptions are similarly embedded.
- Fast Cosine Similarity search (`COSINE_SIMILARITY`) is executed directly inside the in-memory database engine, returning nearest-neighbor skill matches in sub-millisecond query times without moving data out of the database.

### B. Analytical Calculation Views
Recruiter pipeline analytics (e.g., strong match ratios, time-to-decision, department diversity indices) are modeled as graphical **HANA Calculation Views (`.hdbcalculationview`)**, enabling multi-dimensional slicing without runtime recalculation overhead.

### C. Full-Text Search and Fuzzy Matching
SAP HANA Cloud's `FUZZY SEARCH` engine handles synonyms, typos, and variations in skill nomenclature (e.g., matching "PostgreSQL" with "Postgres" or "K8s" with "Kubernetes") directly at the SQL level.

---

## 5. DDL Compilation Reference

The CDS schema compiles directly to SAP HANA Cloud DDL without modification:

```sql
-- Example generated SAP HANA Cloud DDL
CREATE COLUMN TABLE "EVOLVEVITA_CANDIDATES" (
  "ID" NVARCHAR(36) NOT NULL,
  "CREATEDAT" TIMESTAMP,
  "CREATEDBY" NVARCHAR(255),
  "MODIFIEDAT" TIMESTAMP,
  "MODIFIEDBY" NVARCHAR(255),
  "USER_ID" NVARCHAR(36),
  "TARGETROLE" NVARCHAR(100),
  "LOCATION" NVARCHAR(100),
  "AVAILABILITY" NVARCHAR(100),
  "BIOGRAPHY" NCLOB,
  "MATCHSCORE" INTEGER DEFAULT 0,
  "CONFIDENCELEVEL" NVARCHAR(20),
  "DECISIONSTATUS" NVARCHAR(50) DEFAULT 'Needs Review',
  "RECRUITERNOTES" NCLOB,
  PRIMARY KEY ("ID")
);
```
