# EvolveVita Backend Intelligence Engine

Welcome to the EvolveVita Backend Intelligence Engine. This Python-based FastAPI service handles the core workforce algorithms for EvolveVita: inclusive skill extraction, parsing resumes, scoring candidate matching, and auditing job description linguistics for potential bias.

---

## 🛠️ Tech Stack
- **Framework:** FastAPI (Python)
- **Web Server:** Uvicorn
- **Validation:** Pydantic v2
- **Document Extractors:** PyMuPDF (`fitz`), `python-docx`

---

## 🚀 Setup & Execution

### 1. Set Up Virtual Environment
From the `/backend` directory, initialize a Python virtual environment:

**On Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 2. Install Package Dependencies
With the virtual environment active, run:
```bash
pip install -r requirements.txt
```

### 3. Run the Backend Server
Launch the FastAPI development environment using Uvicorn:
```bash
uvicorn main:app --reload
```
The backend server will run on `http://localhost:8000`.

---

## 📜 API Documentation

Interactive Swagger documentation is auto-generated and accessible at:
- **Interactive docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative docs (ReDoc):** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🛣️ Core Endpoint Summaries

### 💼 Job Requisition APIs
- `GET /api/jobs` - List all active job postings.
- `GET /api/jobs/{job_id}` - Retrieve details of a specific job posting.
- `POST /api/jobs` - Create a new job requisition.
- `PUT /api/jobs/{job_id}` - Update a job posting.
- `DELETE /api/jobs/{job_id}` - Remove a job requisition.
- `POST /api/jobs/analyze` - Parses a job description text case-insensitively, returns detected skills, experience ranges, and seniority levels.

### 👤 Candidate APIs
- `GET /api/candidates` - Get list of candidate profiles.
- `GET /api/candidates/{candidate_id}` - Get detailed candidate credentials.
- `POST /api/candidates` - Log a new candidate profile.
- `POST /api/resumes/parse` - Accepts `.pdf` or `.docx` file uploads, extracts text, contact info, and matches skills against EvolveVita's taxonomy.

### 🎯 Matching & Sourcing APIs
- `POST /api/matching/rank` - Scores a batch of candidates for a specific job, sorting them in descending order based on skills overlap (45%), project relevance (20%), experience alignment (15%), learning certificates (10%), and code evidence (10%).
- `POST /api/matching/analyze` - Generates a deep matching report between one candidate and a job, outputting strengths, gaps, and human-readable explanation texts.

### ⚖️ Linguistic Bias Check APIs
- `POST /api/bias/analyze` - Analyzes descriptions for ageist vocabulary, gendered adjectives, and degree restrictions, outputting a fairness score out of 100.
- `POST /api/bias/apply-suggestions` - Rewrites description strings by replacing flagged phrases with inclusive alternatives.
