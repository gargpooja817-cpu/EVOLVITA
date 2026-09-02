from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Any, Optional

# --- Skill Schemas ---
class SkillDetail(BaseModel):
  name: str
  value: int = 50  # proficiency level (0-100)

class SkillExtractionResponse(BaseModel):
  all_skills: List[str]
  languages: List[str]
  frameworks: List[str]
  backend: List[str]
  databases: List[str]
  cloud_devops: List[str]
  ai_ml: List[str]
  tools: List[str]
  sap_skills: List[str]

# --- Job Schemas ---
class ExperienceRange(BaseModel):
  minimum: int
  maximum: int

class JobBase(BaseModel):
  title: str
  department: str
  location: str
  type: str
  workMode: str
  experienceMin: int
  experienceMax: int
  requiredSkills: List[str]
  preferredSkills: List[str]
  description: str
  status: str = "Active"

class JobCreate(JobBase):
  pass

class JobUpdate(BaseModel):
  title: Optional[str] = None
  department: Optional[str] = None
  location: Optional[str] = None
  type: Optional[str] = None
  workMode: Optional[str] = None
  experienceMin: Optional[int] = None
  experienceMax: Optional[int] = None
  requiredSkills: Optional[List[str]] = None
  preferredSkills: Optional[List[str]] = None
  description: Optional[str] = None
  status: Optional[str] = None

class JobResponse(JobBase):
  id: str
  createdDate: str
  applicantsCount: int = 0
  strongMatches: int = 0

class JobAnalysisResponse(BaseModel):
  job_title: str
  required_skills: List[str]
  preferred_skills: List[str]
  experience_required: ExperienceRange
  seniority_level: str
  detected_categories: Dict[str, List[str]]
  analysis_summary: str

# --- Candidate Schemas ---
class ProjectEvidence(BaseModel):
  name: str
  description: str
  technologies: Optional[List[str]] = []
  evidenceUrl: Optional[str] = None
  evidenceType: Optional[str] = None  # e.g., GitHub, Live Demo

class Certification(BaseModel):
  name: str
  issuer: str
  date: Optional[str] = None
  hasBadge: bool = False

class SAPLearningEvidence(BaseModel):
  title: str
  completion: int  # percentage (0-100)
  badgeUrl: Optional[str] = None

class CandidateBase(BaseModel):
  name: str
  targetRole: str
  location: str
  avatar: Optional[str] = None
  availability: str
  biography: str
  skillsDNA: List[SkillDetail]
  projects: List[ProjectEvidence]
  certifications: List[Certification]
  sapLearningEvidence: List[SAPLearningEvidence]
  decisionStatus: str = "Needs Review"
  recruiterNotes: Optional[str] = ""

class CandidateCreate(CandidateBase):
  pass

class CandidateUpdate(BaseModel):
  decisionStatus: Optional[str] = None
  recruiterNotes: Optional[str] = None

class CandidateApplicationCreate(BaseModel):
  job_id: str
  candidate_name: str
  email: Optional[str] = None
  phone: Optional[str] = None
  skills: List[str] = []
  projects: Optional[List[ProjectEvidence]] = []
  certifications: Optional[List[Certification]] = []
  education: Optional[List[str]] = []
  experience: Optional[List[str]] = []
  availability: Optional[str] = "Immediate (2 weeks notice)"
  biography: Optional[str] = ""
  avatar: Optional[str] = None

class CandidateResponse(CandidateBase):
  id: str
  matchScore: Optional[int] = 0
  confidence: Optional[str] = "Medium"
  appliedJobId: Optional[str] = None
  appliedAt: Optional[str] = None

# --- Resume Parsing Schemas ---
class ResumeParseResponse(BaseModel):
  candidate_name: str
  email: Optional[str] = None
  phone: Optional[str] = None
  skills: List[str]
  projects: List[ProjectEvidence]
  certifications: List[Certification]
  education: List[str]
  experience: List[str]
  raw_text_preview: str

# --- Matching & Sourcing Schemas ---
class MatchScoreBreakdown(BaseModel):
  skills_match: int
  project_relevance: int
  experience_relevance: int
  learning: int
  evidence: int

class RankRequest(BaseModel):
  job_id: str
  candidate_ids: List[str]

class MatchAnalysisRequest(BaseModel):
  job_id: str
  candidate_id: str

class RankedCandidateDetail(BaseModel):
  candidate_id: str
  name: str
  overall_match_score: int
  ranking: int
  score_breakdown: MatchScoreBreakdown
  matched_skills: List[str]
  missing_skills: List[str]
  strengths: List[str]
  skill_gaps: List[str]
  recommendation: str

class RankResponse(BaseModel):
  job_id: str
  ranked_candidates: List[RankedCandidateDetail]

class MatchAnalysisResponse(BaseModel):
  candidate_id: str
  job_id: str
  overall_match_score: int
  score_breakdown: MatchScoreBreakdown
  confidence: str
  recommendation: str
  why_matched: str
  strengths: List[str]
  concerns: List[str]
  skill_gaps: List[str]
  sap_evidence: List[SAPLearningEvidence]
  human_review_required: bool = True

# --- Bias Auditing Schemas ---
class BiasIssue(BaseModel):
  id: Optional[str] = None
  category: str
  phrase: str
  severity: str  # low, medium, high
  explanation: str
  suggestion: str

class BiasAnalyzeRequest(BaseModel):
  job_description: str

class BiasAnalyzeResponse(BaseModel):
  fairness_score: int
  issues: List[BiasIssue]
  inclusive_version: str

class ApplySuggestionsRequest(BaseModel):
  job_description: str
  issues: List[BiasIssue]

# --- New Integration Schemas ---
class SkillGapRequest(BaseModel):
  candidate_skills: List[str]
  target_role: str
  required_skills: List[str]

class SkillGapResponse(BaseModel):
  matched_skills: List[str]
  developing_skills: List[str]
  missing_skills: List[str]
  growth_path: List[str]

class MatchInput(BaseModel):
  candidate_name: str
  skills: List[str]
  experience_years: float
  projects: List[ProjectEvidence]
  certifications: List[Certification]
  sap_learning_evidence: List[SAPLearningEvidence]
  job_title: str
  required_skills: List[str]
  preferred_skills: List[str]
  experience_min: int
  experience_max: int

class MatchResponse(BaseModel):
  match_score: int
  matched_skills: List[str]
  missing_skills: List[str]
  project_evidence: List[str]
  strengths: List[str]
  gaps: List[str]
  explanation: List[str]

# --- User & Auth Schemas ---
class UserProfileCreate(BaseModel):
  firebase_uid: str
  email: str
  full_name: Optional[str] = None
  avatar: Optional[str] = None
  role: Optional[str] = None

class UserProfileUpdate(BaseModel):
  full_name: Optional[str] = None
  title: Optional[str] = None
  avatar: Optional[str] = None

class UserRoleUpdate(BaseModel):
  firebase_uid: Optional[str] = None
  role: str

class UserProfileResponse(BaseModel):
  id: int
  firebase_uid: str
  full_name: Optional[str] = None
  email: str
  role: Optional[str] = None
  profile_completed: bool
  avatar: Optional[str] = None
  title: Optional[str] = None
  created_at: str
  updated_at: str

