import os
import json
import urllib.parse
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from models.schemas import (
  JobCreate, JobUpdate, JobResponse, JobAnalysisResponse,
  CandidateCreate, CandidateUpdate, CandidateResponse, CandidateApplicationCreate, ResumeParseResponse,
  RankRequest, RankResponse, MatchAnalysisRequest, MatchAnalysisResponse,
  BiasAnalyzeRequest, BiasAnalyzeResponse, ApplySuggestionsRequest, BiasIssue,
  SkillGapRequest, SkillGapResponse, MatchInput, MatchResponse,
  ProjectEvidence, Certification, SAPLearningEvidence,
  UserProfileCreate, UserProfileUpdate, UserRoleUpdate, UserProfileResponse
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Services & Database
from database.db import init_db
from services.user_service import UserService
from services.skill_extractor import SkillExtractor
from services.resume_parser import ResumeParser
from services.job_analyzer import JobAnalyzer
from services.bias_analyzer import BiasAnalyzer
from services.matcher import Matcher
from services.ranker import Ranker

app = FastAPI(
  title="EvolveVita Intelligence Engine",
  description="AI-powered inclusive workforce intelligence backend providing skills parsing, explainable matchmaking, and bias analysis.",
  version="1.0.0"
)

# CORS configurations
# Includes localhost (development) and SAP BTP US10-001 origins (production)
_BTP_ORIGINS = [
  # SAP BTP US10-001 — HTML5 App Repository & Approuter
  "https://evolvita.cfapps.us10-001.hana.ondemand.com",
  "https://evolvita-approuter.cfapps.us10-001.hana.ondemand.com",
  "https://evolvita-ui.cfapps.us10-001.hana.ondemand.com",
  # Allow any BTP subdomain dynamically (Launchpad, Workzone, etc.)
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *_BTP_ORIGINS,
  ],
  # Allow localhost for dev AND *.hana.ondemand.com for BTP production
  allow_origin_regex=r"(http://(localhost|127\.0\.0\.1)(:[0-9]+)?|https://.*\.hana\.ondemand\.com)",
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# JSON Helper Paths
DATA_DIR = Path(__file__).parent / "data"
JOBS_FILE = DATA_DIR / "sample_jobs.json"
CANDIDATES_FILE = DATA_DIR / "sample_candidates.json"

# In-Memory DB loaded from files
db_jobs: List[Dict[str, Any]] = []
db_candidates: List[Dict[str, Any]] = []

def load_db():
  global db_jobs, db_candidates
  try:
    if JOBS_FILE.exists():
      with open(JOBS_FILE, "r", encoding="utf-8") as f:
        db_jobs = json.load(f)
    else:
      db_jobs = []

    if CANDIDATES_FILE.exists():
      with open(CANDIDATES_FILE, "r", encoding="utf-8") as f:
        db_candidates = json.load(f)
    else:
      db_candidates = []
  except Exception as e:
    print(f"Error loading mock database: {str(e)}")

def save_db_jobs():
  try:
    with open(JOBS_FILE, "w", encoding="utf-8") as f:
      json.dump(db_jobs, f, indent=2, ensure_ascii=False)
  except Exception as e:
    print(f"Error saving jobs: {str(e)}")

def save_db_candidates():
  try:
    with open(CANDIDATES_FILE, "w", encoding="utf-8") as f:
      json.dump(db_candidates, f, indent=2, ensure_ascii=False)
  except Exception as e:
    print(f"Error saving candidates: {str(e)}")

# Load databases on startup
@app.on_event("startup")
def startup_event():
  load_db()

# --- Root route ---
@app.get("/")
def read_root():
  return {
    "status": "Online",
    "service": "EvolveVita Backend Intelligence Engine",
    "docs_url": "/docs"
  }

# --- Health Check (required by SAP BTP Cloud Foundry HTTP health check) ---
@app.get("/health")
def health_check():
  return {
    "status": "healthy",
    "service": "evolvita-backend",
    "version": "1.0.0",
    "environment": os.environ.get("ENVIRONMENT", "development")
  }


# --- FEATURE 1: JOB DESCRIPTION ANALYZER ---
@app.post("/api/jobs/analyze", response_model=JobAnalysisResponse)
def analyze_job(request: BiasAnalyzeRequest):
  try:
    analysis = JobAnalyzer.analyze_job_description(
      job_title="Job Requisition Analysis",
      job_description=request.job_description
    )
    return analysis
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Linguistic analysis failed: {str(e)}")

# --- FEATURE 2 & 9: RESUME PARSER ---
@app.post("/api/resumes/parse", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)):
  filename = file.filename.lower() if file.filename else ""
  if not (filename.endswith(".pdf") or filename.endswith(".docx") or filename.endswith(".txt")):
    raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")
  
  try:
    file_bytes = await file.read()
    parsed_data = ResumeParser.parse_resume(file_bytes, filename)
    return parsed_data
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")

# --- FEATURE 4: RESUME RANKING ENGINE ---
@app.post("/api/matching/rank", response_model=RankResponse)
def rank_candidates(request: RankRequest):
  load_db() # Reload to get latest states
  
  # Find job
  job_data = next((j for j in db_jobs if j["id"] == request.job_id), None)
  if not job_data:
    raise HTTPException(status_code=404, detail="Job requisition not found.")
    
  # Convert job dict to mock object for Matcher/Ranker
  class JobObj:
    def __init__(self, d):
      self.id = d["id"]
      self.title = d["title"]
      self.requiredSkills = d["requiredSkills"]
      self.preferredSkills = d["preferredSkills"]
      self.experienceMin = d["experienceMin"]
      self.experienceMax = d["experienceMax"]
  
  job = JobObj(job_data)

  # Find candidates
  candidates_to_rank = []
  for c_id in request.candidate_ids:
    cand_data = next((c for c in db_candidates if c["id"] == c_id), None)
    if cand_data:
      # Convert candidate dict to mock objects
      class SkillObj:
        def __init__(self, name, value):
          self.name = name
          self.value = value
      class ProjObj:
        def __init__(self, name, description, technologies, evidenceUrl, evidenceType):
          self.name = name
          self.description = description
          self.technologies = technologies
          self.evidenceUrl = evidenceUrl
          self.evidenceType = evidenceType
      class CertObj:
        def __init__(self, name, issuer, date=None, hasBadge=False):
          self.name = name
          self.issuer = issuer
          self.date = date
          self.hasBadge = hasBadge
      class SAPObj:
        def __init__(self, title, completion, badgeUrl=None):
          self.title = title
          self.completion = completion
          self.badgeUrl = badgeUrl

      class CandObj:
        def __init__(self, d):
          self.id = d["id"]
          self.name = d["name"]
          self.targetRole = d["targetRole"]
          self.skillsDNA = [SkillObj(s["name"], s["value"]) for s in d["skillsDNA"]]
          self.projects = [ProjObj(p["name"], p["description"], p["technologies"], p.get("evidenceUrl"), p.get("evidenceType")) for p in d["projects"]]
          self.certifications = [CertObj(c["name"], c["issuer"]) for c in d["certifications"]]
          self.sapLearningEvidence = [SAPObj(s["title"], s["completion"]) for s in d["sapLearningEvidence"]]
          self.decisionStatus = d.get("decisionStatus", "Needs Review")
          self.recruiterNotes = d.get("recruiterNotes", "")

      candidates_to_rank.append(CandObj(cand_data))

  ranked = Ranker.rank_candidates(job, candidates_to_rank)
  return RankResponse(job_id=request.job_id, ranked_candidates=ranked)

# --- FEATURE 5 & 6: CANDIDATE MATCHING ENGINE & EXPLAINABLE AI ---
@app.post("/api/matching/analyze", response_model=MatchAnalysisResponse)
def analyze_match(request: MatchAnalysisRequest):
  load_db()
  
  # Find job
  job_data = next((j for j in db_jobs if j["id"] == request.job_id), None)
  if not job_data:
    raise HTTPException(status_code=404, detail="Job requisition not found.")
    
  # Find candidate
  cand_data = next((c for c in db_candidates if c["id"] == request.candidate_id), None)
  if not cand_data:
    raise HTTPException(status_code=404, detail="Candidate profile not found.")

  # Mock classes
  class JobObj:
    def __init__(self, d):
      self.id = d["id"]
      self.title = d["title"]
      self.requiredSkills = d["requiredSkills"]
      self.preferredSkills = d["preferredSkills"]
      self.experienceMin = d["experienceMin"]
      self.experienceMax = d["experienceMax"]
  
  class SkillObj:
    def __init__(self, name, value):
      self.name = name
      self.value = value
  class ProjObj:
    def __init__(self, name, description, technologies, evidenceUrl, evidenceType):
      self.name = name
      self.description = description
      self.technologies = technologies
      self.evidenceUrl = evidenceUrl
      self.evidenceType = evidenceType
  class CertObj:
    def __init__(self, name, issuer, date=None, hasBadge=False):
      self.name = name
      self.issuer = issuer
      self.date = date
      self.hasBadge = hasBadge
  class SAPObj:
    def __init__(self, title, completion, badgeUrl=None):
      self.title = title
      self.completion = completion
      self.badgeUrl = badgeUrl

  class CandObj:
    def __init__(self, d):
      self.id = d["id"]
      self.name = d["name"]
      self.targetRole = d["targetRole"]
      self.skillsDNA = [SkillObj(s["name"], s["value"]) for s in d["skillsDNA"]]
      self.projects = [ProjObj(p["name"], p["description"], p["technologies"], p.get("evidenceUrl"), p.get("evidenceType")) for p in d["projects"]]
      self.certifications = [CertObj(c["name"], c["issuer"]) for c in d["certifications"]]
      self.sapLearningEvidence = [SAPObj(s["title"], s["completion"]) for s in d["sapLearningEvidence"]]
      self.decisionStatus = d.get("decisionStatus", "Needs Review")
      self.recruiterNotes = d.get("recruiterNotes", "")

  job = JobObj(job_data)
  cand = CandObj(cand_data)

  res = Matcher.calculate_match(job, cand)
  
  # convert back to schema response
  return MatchAnalysisResponse(
    candidate_id=res["candidate_id"],
    job_id=res["job_id"],
    overall_match_score=res["overall_match_score"],
    score_breakdown=res["score_breakdown"],
    confidence=res["confidence"],
    recommendation=res["recommendation"],
    why_matched=res["why_matched"],
    strengths=res["strengths"],
    concerns=res["concerns"],
    skill_gaps=res["skill_gaps"],
    sap_evidence=[SAPLearningEvidence(title=s.title, completion=s.completion) for s in cand.sapLearningEvidence],
    human_review_required=res["human_review_required"]
  )

# --- FEATURE 7: BIAS ANALYZER ---
@app.post("/api/bias/analyze", response_model=BiasAnalyzeResponse)
def analyze_bias(request: BiasAnalyzeRequest):
  try:
    res = BiasAnalyzer.analyze_bias(request.job_description)
    return BiasAnalyzeResponse(
      fairness_score=res["fairness_score"],
      issues=res["issues"],
      inclusive_version=res["inclusive_version"]
    )
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Linguistic bias check failed: {str(e)}")

@app.post("/api/bias/apply-suggestions", response_model=Dict[str, str])
def apply_bias_suggestions(request: ApplySuggestionsRequest):
  try:
    clean_text = BiasAnalyzer.apply_suggestions(request.job_description, request.issues)
    return {"inclusive_version": clean_text}
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to rewrite description: {str(e)}")

# --- FEATURE 8: JOB CRUD APIs ---
@app.get("/api/jobs", response_model=List[JobResponse])
def get_jobs():
  load_db()
  return db_jobs

@app.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str):
  load_db()
  job = next((j for j in db_jobs if j["id"] == job_id), None)
  if not job:
    raise HTTPException(status_code=404, detail="Job listing not found.")
  return job

@app.post("/api/jobs", response_model=JobResponse)
def create_job(job: JobCreate):
  load_db()
  new_id = f"job-{len(db_jobs) + 1}"
  
  # Format dates
  import datetime
  created_date = datetime.date.today().isoformat()
  
  new_job_dict = job.dict()
  new_job_dict["id"] = new_id
  new_job_dict["createdDate"] = created_date
  new_job_dict["applicantsCount"] = 0
  new_job_dict["strongMatches"] = 0
  
  db_jobs.append(new_job_dict)
  save_db_jobs()
  return new_job_dict

@app.put("/api/jobs/{job_id}", response_model=JobResponse)
def update_job(job_id: str, job_update: JobUpdate):
  load_db()
  job_idx = next((idx for idx, j in enumerate(db_jobs) if j["id"] == job_id), None)
  if job_idx is None:
    raise HTTPException(status_code=404, detail="Job listing not found.")
    
  update_data = job_update.dict(exclude_unset=True)
  for key, value in update_data.items():
    db_jobs[job_idx][key] = value
    
  save_db_jobs()
  return db_jobs[job_idx]

@app.delete("/api/jobs/{job_id}", response_model=Dict[str, str])
def delete_job(job_id: str):
  load_db()
  global db_jobs
  job_exists = any(j for j in db_jobs if j["id"] == job_id)
  if not job_exists:
    raise HTTPException(status_code=404, detail="Job listing not found.")
    
  db_jobs = [j for j in db_jobs if j["id"] != job_id]
  save_db_jobs()
  return {"message": "Job requisition deleted successfully."}

# --- FEATURE 9: CANDIDATE APIs & REAL JOB APPLICATIONS ---
@app.get("/api/candidates", response_model=List[CandidateResponse])
def get_candidates(role: Optional[str] = None, job_id: Optional[str] = None):
  load_db()
  results = db_candidates
  if job_id:
    results = [c for c in results if c.get("appliedJobId") == job_id]
  if role:
    results = [c for c in results if c.get("targetRole", "").lower() == role.lower() or role.lower() in c.get("targetRole", "").lower()]
  return results

@app.get("/api/candidates/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str):
  load_db()
  cand = next((c for c in db_candidates if c["id"] == candidate_id), None)
  if not cand:
    raise HTTPException(status_code=404, detail="Candidate profile not found.")
  return cand

@app.put("/api/candidates/{candidate_id}", response_model=CandidateResponse)
def update_candidate(candidate_id: str, update_data: CandidateUpdate):
  load_db()
  cand_idx = next((idx for idx, c in enumerate(db_candidates) if c["id"] == candidate_id), None)
  if cand_idx is None:
    raise HTTPException(status_code=404, detail="Candidate profile not found.")
    
  dict_data = update_data.dict(exclude_unset=True)
  for key, value in dict_data.items():
    db_candidates[cand_idx][key] = value
    
  save_db_candidates()
  return db_candidates[cand_idx]

@app.post("/api/jobs/{job_id}/apply", response_model=Dict[str, Any])
def apply_to_job(job_id: str, app_data: CandidateApplicationCreate):
  load_db()
  import datetime
  
  job_idx = next((idx for idx, j in enumerate(db_jobs) if j["id"] == job_id), None)
  if job_idx is None:
    raise HTTPException(status_code=404, detail="Job requisition not found.")
  
  job = db_jobs[job_idx]
  
  # Calculate real match score against this job's actual requirements
  cand_skills_lower = [s.lower() for s in app_data.skills]
  req_skills = job.get("requiredSkills", [])
  pref_skills = job.get("preferredSkills", [])
  
  req_matched = [s for s in req_skills if s.lower() in cand_skills_lower]
  pref_matched = [s for s in pref_skills if s.lower() in cand_skills_lower]
  
  skill_score = 0
  if req_skills:
    skill_score = int((len(req_matched) / len(req_skills)) * 50)
  else:
    skill_score = 35
    
  if pref_skills and len(pref_skills) > 0:
    skill_score += int((len(pref_matched) / len(pref_skills)) * 10)
    
  # Projects evidence bonus
  proj_score = min(20, len(app_data.projects or []) * 7)
  # Experience bonus
  exp_years = len(app_data.experience or []) * 1.5 if app_data.experience else 2.0
  exp_min = job.get("experienceMin", 0)
  exp_max = job.get("experienceMax", 10)
  exp_score = 15 if exp_min <= exp_years <= exp_max else 10
  
  match_score = min(98, max(25, skill_score + proj_score + exp_score + 5))
  confidence = "High" if match_score >= 85 else ("Medium" if match_score >= 60 else "Low")
  
  new_cand_id = f"candidate-{len(db_candidates) + 1}"
  encoded_name = urllib.parse.quote(app_data.candidate_name or "Applicant")
  avatar_url = app_data.avatar or f"https://api.dicebear.com/7.x/initials/svg?seed={encoded_name}"
  
  new_candidate = {
    "id": new_cand_id,
    "name": app_data.candidate_name,
    "targetRole": job["title"],
    "appliedJobId": job_id,
    "location": job.get("location", "Remote"),
    "avatar": avatar_url,
    "availability": app_data.availability or "Immediate (2 weeks notice)",
    "biography": app_data.biography or f"Applicant for {job['title']}. Holds {len(app_data.skills)} verified skills and {len(app_data.projects or [])} portfolio project records.",
    "skillsDNA": [{"name": s, "value": 85} for s in app_data.skills],
    "projects": [p.dict() if hasattr(p, "dict") else p for p in (app_data.projects or [])],
    "certifications": [c.dict() if hasattr(c, "dict") else c for c in (app_data.certifications or [])],
    "sapLearningEvidence": [],
    "decisionStatus": "Needs Review",
    "recruiterNotes": "",
    "matchScore": match_score,
    "confidence": confidence,
    "appliedAt": datetime.date.today().isoformat()
  }
  
  db_candidates.append(new_candidate)
  save_db_candidates()
  
  # Increment job counts
  db_jobs[job_idx]["applicantsCount"] = db_jobs[job_idx].get("applicantsCount", 0) + 1
  if match_score >= 85:
    db_jobs[job_idx]["strongMatches"] = db_jobs[job_idx].get("strongMatches", 0) + 1
  save_db_jobs()
  
  return {
    "success": True,
    "message": f"Successfully applied to {job['title']}.",
    "candidate_id": new_cand_id,
    "match_score": match_score,
    "candidate": new_candidate
  }

@app.post("/api/applications", response_model=Dict[str, Any])
def submit_application_alias(app_data: CandidateApplicationCreate):
  return apply_to_job(app_data.job_id, app_data)

@app.post("/api/candidates", response_model=CandidateResponse)
def create_candidate(candidate: CandidateCreate):
  load_db()
  new_id = f"candidate-{len(db_candidates) + 1}"
  
  match_score = 75
  if candidate.sapLearningEvidence:
    match_score += 10
  if candidate.projects:
    match_score += 8
  match_score = min(98, match_score)

  new_cand_dict = candidate.dict()
  new_cand_dict["id"] = new_id
  new_cand_dict["matchScore"] = match_score
  new_cand_dict["confidence"] = "High" if match_score >= 85 else "Medium"
  
  db_candidates.append(new_cand_dict)
  save_db_candidates()
  return new_cand_dict

# --- INTEGRATION ENDPOINTS ---

@app.get("/health")
def health_check():
  return {"status": "healthy"}

@app.post("/api/candidates/match", response_model=MatchResponse)
def match_candidate(request: MatchInput):
  try:
    cand_skills_lower = [s.lower() for s in request.skills]
    req_skills_matched = [s for s in request.required_skills if s.lower() in cand_skills_lower]
    pref_skills_matched = [s for s in request.preferred_skills if s.lower() in cand_skills_lower]
    
    # 1. Skill Match (45%)
    skill_score = 0
    if request.required_skills:
      skill_score = int((len(req_skills_matched) / len(request.required_skills)) * 45)
    
    # 2. Project Evidence (20%)
    proj_score = 0
    relevant_projects = []
    for proj in request.projects:
      proj_tech_lower = [t.lower() for t in proj.technologies]
      matches_tech = any(s.lower() in proj_tech_lower for s in request.required_skills + request.preferred_skills)
      if matches_tech:
        proj_score += 7
        relevant_projects.append(proj.name)
    proj_score = min(20, proj_score)
    
    # 3. Experience Evidence (20%)
    exp_score = 0
    if request.experience_min <= request.experience_years <= request.experience_max:
      exp_score = 20
    elif request.experience_years > request.experience_max:
      exp_score = 17
    else:
      if request.experience_min > 0:
        exp_score = int((request.experience_years / request.experience_min) * 15)
        
    # 4. Learning Evidence (10%)
    learning_score = 0
    for sap in request.sap_learning_evidence:
      if sap.completion >= 100:
        learning_score += 5
    learning_score = min(10, learning_score)
    
    # 5. Profile Completeness (5%)
    completeness = 5 if request.skills and request.projects else 3
    
    total_score = skill_score + proj_score + exp_score + learning_score + completeness
    total_score = min(100, max(0, total_score))
    
    missing_skills = [s for s in request.required_skills if s.lower() not in cand_skills_lower]
    
    strengths = []
    gaps = []
    explanation = []
    
    if req_skills_matched:
      strengths.append(f"Demonstrates required skills: {', '.join(req_skills_matched[:3])}")
    if relevant_projects:
      strengths.append(f"Technical validation found in projects: {', '.join(relevant_projects)}")
    if exp_score == 20:
      strengths.append(f"Experience length ({request.experience_years} years) matches job parameters.")
      
    if missing_skills:
      gaps.append(f"Missing required skills: {', '.join(missing_skills)}")
    if request.experience_years < request.experience_min:
      gaps.append(f"Experience ({request.experience_years} years) is below minimum of {request.experience_min} years.")
      
    explanation.append(f"Candidate match calculated at {total_score}% score.")
    explanation.append("Skills overlap contributes major fit signals.")
    explanation.append("AI-generated decision support. Final decisions remain with human reviewers.")
    
    return MatchResponse(
      match_score=total_score,
      matched_skills=req_skills_matched + pref_skills_matched,
      missing_skills=missing_skills,
      project_evidence=relevant_projects,
      strengths=strengths,
      gaps=gaps,
      explanation=explanation
    )
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Candidate matchmaking failed: {str(e)}")

@app.post("/api/rank", response_model=RankResponse)
def rank_candidates_alias(request: RankRequest):
  return rank_candidates(request)

@app.post("/api/skills/gap", response_model=SkillGapResponse)
def get_skills_gap(request: SkillGapRequest):
  try:
    cand_skills_lower = [s.lower() for s in request.candidate_skills]
    matched = [s for s in request.required_skills if s.lower() in cand_skills_lower]
    missing = [s for s in request.required_skills if s.lower() not in cand_skills_lower]
    
    developing = []
    if "ai" in request.target_role.lower():
      developing = ["Transformers", "Deep Learning"]
    elif "frontend" in request.target_role.lower():
      developing = ["Framer Motion", "TypeScript"]
    elif "cloud" in request.target_role.lower():
      developing = ["Terraform", "Go"]
    else:
      developing = ["Continuous Integration"]
      
    growth_path = []
    if missing:
      growth_path.append(f"Learn missing foundation: study core documentation for {', '.join(missing[:2])}.")
      growth_path.append(f"Practice with project: build a sample repository verifying {missing[0]} capability.")
    else:
      growth_path.append("Review modern extensions: learn advanced architecture libraries.")
      
    growth_path.append("Build evidence: upload source code files to your profiles portfolio.")
    growth_path.append("Add verified achievements: record SAP learning extensions to demonstrate continuous progress.")
    
    return SkillGapResponse(
      matched_skills=matched,
      developing_skills=developing,
      missing_skills=missing,
      growth_path=growth_path
    )
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Skills gap analysis failed: {str(e)}")

@app.post("/api/candidates/rank")
async def rank_uploaded_resumes(
    job_id: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    files: List[UploadFile] = File(...)
):
    load_db()
    
    # 1. Resolve Job Requisition
    job_req = None
    if job_id:
        job_data = next((j for j in db_jobs if j["id"] == job_id), None)
        if job_data:
            class JobObj:
                def __init__(self, d):
                    self.id = d["id"]
                    self.title = d["title"]
                    self.requiredSkills = d["requiredSkills"]
                    self.preferredSkills = d.get("preferredSkills", [])
                    self.experienceMin = d.get("experienceMin", 0)
                    self.experienceMax = d.get("experienceMax", 10)
            job_req = JobObj(job_data)
            
    if not job_req and job_description:
        # Analyze job description on the fly
        analysis = JobAnalyzer.analyze_job_description(
            job_title="Pasted Job Description Requisition",
            job_description=job_description
        )
        class PastedJobObj:
            def __init__(self, a, desc):
                self.id = "pasted-job"
                self.title = "Pasted Role"
                self.requiredSkills = a.get("required_skills", [])
                self.preferredSkills = a.get("preferred_skills", [])
                self.experienceMin = 0
                self.experienceMax = 10
                self.description = desc
        job_req = PastedJobObj(analysis, job_description)
        
    if not job_req:
        raise HTTPException(status_code=400, detail="Please select a job or provide a job description.")
        
    # 2. Parse Resumes
    parsed_candidates = []
    for idx, f in enumerate(files):
        try:
            file_bytes = await f.read()
            parsed = ResumeParser.parse_resume(file_bytes, f.filename)
            
            class SkillObj:
                def __init__(self, name, value):
                    self.name = name
                    self.value = value
            class ProjObj:
                def __init__(self, name, description, technologies, evidenceUrl, evidenceType):
                    self.name = name
                    self.description = description
                    self.technologies = technologies
                    self.evidenceUrl = evidenceUrl
                    self.evidenceType = evidenceType
            class CertObj:
                def __init__(self, name, issuer, date=None, hasBadge=False):
                    self.name = name
                    self.issuer = issuer
                    self.date = date
                    self.hasBadge = hasBadge
                    
            class TempCandObj:
                def __init__(self, p, c_id):
                    self.id = c_id
                    self.name = p["candidate_name"] or f"Candidate #{c_id.split('-')[-1]}"
                    self.email = p["email"]
                    self.targetRole = "Candidate Profile"
                    self.skillsDNA = [SkillObj(s, 85) for s in p["skills"]]
                    self.projects = [ProjObj(pr.name, pr.description, pr.technologies, pr.evidenceUrl, pr.evidenceType) for pr in p["projects"]]
                    self.certifications = [CertObj(cr.name, cr.issuer, None, cr.hasBadge) for cr in p["certifications"]]
                    self.sapLearningEvidence = []
                    self.decisionStatus = "Needs Review"
                    self.recruiterNotes = ""
                    
            cand_id = f"uploaded-candidate-{idx + 1}"
            parsed_candidates.append(TempCandObj(parsed, cand_id))
        except Exception as parse_err:
            print(f"Skipped parsing file {f.filename}: {str(parse_err)}")
            continue
            
    if not parsed_candidates:
        raise HTTPException(status_code=400, detail="Failed to parse any of the uploaded resumes. Please check file formats.")
        
    # 3. Match and Rank
    ranked = Ranker.rank_candidates(job_req, parsed_candidates)
    
    # 4. Map to response list with dynamic explanations
    results = []
    for item in ranked:
        cand_obj = next((c for c in parsed_candidates if c.id == item.candidate_id), None)
        
        skills_matched_str = ", ".join(item.matched_skills[:3])
        explanation = f"High match because the candidate demonstrates strong alignment with {skills_matched_str or 'the required skills'}."
        if item.overall_match_score < 60:
            explanation = "Low match profile. Candidate has significant skill gaps or lacks verified technical project evidence."
        elif item.overall_match_score < 80:
            explanation = f"Moderate match profile showing solid foundation in {skills_matched_str or 'some required skills'} but with notable missing elements."
            
        results.append({
            "candidate_id": item.candidate_id,
            "name": item.name,
            "email": cand_obj.email if cand_obj else None,
            "overall_match_score": item.overall_match_score,
            "ranking": item.ranking,
            "score_breakdown": {
                "skills": item.score_breakdown.skills_match,
                "experience": item.score_breakdown.experience_relevance,
                "keywords": item.score_breakdown.evidence + item.score_breakdown.learning
            },
            "matched_skills": item.matched_skills,
            "missing_skills": item.missing_skills,
            "strengths": item.strengths,
            "skill_gaps": item.skill_gaps,
            "recommendation": item.recommendation,
            "explanation": explanation,
            "raw_text_preview": cand_obj.name + "'s uploaded resume parsed successfully." if cand_obj else ""
        })
        
    return {
        "success": True,
        "job_id": job_id,
        "results": results
    }

# --- FEATURE 10: USER PROFILE & AUTH APIs ---
security = HTTPBearer(auto_error=False)

def get_current_user_uid(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security), uid: Optional[str] = None) -> str:
    if uid:
        return uid
    if credentials:
        token = credentials.credentials
        try:
            import base64
            parts = token.split(".")
            if len(parts) == 3:
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                payload_json = base64.urlsafe_b64decode(padded.encode()).decode("utf-8", errors="ignore")
                payload = json.loads(payload_json)
                if "user_id" in payload:
                    return payload["user_id"]
                if "sub" in payload:
                    return payload["sub"]
                if "uid" in payload:
                    return payload["uid"]
        except Exception:
            pass
        return token
    return "guest-dev-user"

@app.post("/api/users/profile", response_model=UserProfileResponse)
def create_or_sync_profile(data: UserProfileCreate):
    user = UserService.create_or_sync_user(
        firebase_uid=data.firebase_uid,
        email=data.email,
        full_name=data.full_name,
        avatar=data.avatar,
        role=data.role
    )
    if not user:
        raise HTTPException(status_code=400, detail="Failed to create or sync user profile.")
    return user

@app.get("/api/users/me", response_model=UserProfileResponse)
def get_current_user_profile(
    uid: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    user_uid = get_current_user_uid(credentials, uid)
    user = UserService.get_user_by_uid(user_uid)
    if not user:
        if user_uid:
            user = UserService.create_or_sync_user(
                firebase_uid=user_uid,
                email=f"{user_uid}@evolvevita.com" if "@" not in user_uid else user_uid,
                full_name="EvolveVita Member"
            )
        else:
            raise HTTPException(status_code=404, detail="User profile not found.")
    return user

@app.put("/api/users/me", response_model=UserProfileResponse)
def update_user_profile_endpoint(
    data: UserProfileUpdate,
    uid: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    user_uid = get_current_user_uid(credentials, uid)
    updated = UserService.update_user_profile(user_uid, data.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User profile not found.")
    return updated

@app.post("/api/users/role", response_model=UserProfileResponse)
def set_role_endpoint(
    data: UserRoleUpdate,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    user_uid = data.firebase_uid or get_current_user_uid(credentials)
    user = UserService.set_user_role(user_uid, data.role)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found to set role.")
    return user


