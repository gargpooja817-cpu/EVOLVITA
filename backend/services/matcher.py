from typing import Dict, List, Any, Set
from models.schemas import MatchAnalysisResponse, MatchScoreBreakdown, SAPLearningEvidence
from services.skill_extractor import SkillExtractor

class Matcher:
  @classmethod
  def calculate_match(cls, job: Any, candidate: Any) -> Dict[str, Any]:
    # Extract candidate skill names
    candidate_skills = [sk.name for sk in candidate.skillsDNA]
    
    # 1. Skills Match Score (45% weight)
    matched_required = []
    missing_required = []
    
    for req_skill in job.requiredSkills:
      # Compare case insensitively
      if any(req_skill.lower() == cand_sk.lower() for cand_sk in candidate_skills):
        matched_required.append(req_skill)
      else:
        missing_required.append(req_skill)
        
    matched_preferred = []
    for pref_skill in job.preferredSkills:
      if any(pref_skill.lower() == cand_sk.lower() for cand_sk in candidate_skills):
        matched_preferred.append(pref_skill)
        
    # Calculate required skills ratio
    req_count = len(job.requiredSkills)
    if req_count > 0:
      skills_ratio = len(matched_required) / req_count
    else:
      skills_ratio = 1.0
      
    skills_score = int(40 * skills_ratio)
    # Add bonus points for preferred skills
    pref_count = len(job.preferredSkills)
    if pref_count > 0:
      pref_ratio = len(matched_preferred) / pref_count
      skills_score = min(45, skills_score + int(5 * pref_ratio))
    else:
      skills_score = min(45, skills_score + 5)

    # 2. Project Relevance Score (20% weight)
    project_score = 0
    relevant_projects_count = 0
    project_details_list = []
    
    job_all_skills = set(job.requiredSkills + job.preferredSkills)
    
    for proj in candidate.projects:
      # check overlap of project tech with job requirements
      tech_overlap = [t for t in proj.technologies if any(t.lower() == js_sk.lower() for js_sk in job_all_skills)]
      if tech_overlap:
        relevant_projects_count += 1
        project_details_list.append(proj.name)
        # points based on depth of overlap
        if len(tech_overlap) >= 3:
          project_score += 10
        else:
          project_score += 7
          
    project_score = min(20, project_score)
    # Give base project points if candidate has projects but tech was parsed slightly differently
    if len(candidate.projects) > 0 and project_score == 0:
      project_score = 10

    # 3. Experience Relevance Score (15% weight)
    # Mock experience lookup based on targetRole
    candidate_exp = cls.estimate_experience(candidate)
    
    exp_score = 0
    if candidate_exp >= job.experienceMin and candidate_exp <= job.experienceMax:
      exp_score = 15
    elif candidate_exp < job.experienceMin:
      # Partial points for lower experience
      exp_score = int(15 * (candidate_exp / max(1, job.experienceMin)))
    else:
      # Overqualified candidate - slight penalty or full points
      exp_score = 13
      
    # 4. Certifications & Learning Score (10% weight)
    learning_score = 0
    sap_evidence_completed = []
    
    for sap in candidate.sapLearningEvidence:
      if sap.completion == 100:
        learning_score += 5
        sap_evidence_completed.append(sap.title)
      else:
        learning_score += 2
        
    for cert in candidate.certifications:
      if cert.issuer == "SAP" or cert.hasBadge:
        learning_score += 3
      else:
        learning_score += 2
        
    learning_score = min(10, learning_score)

    # 5. Project Evidence Quality (10% weight)
    evidence_score = 0
    for proj in candidate.projects:
      if proj.evidenceUrl and ("github.com" in proj.evidenceUrl.lower() or "figma.com" in proj.evidenceUrl.lower() or "demo" in proj.evidenceUrl.lower()):
        evidence_score += 5
    evidence_score = min(10, evidence_score)
    if not candidate.projects:
      evidence_score = 0

    # Overall Match Score Sum
    overall_match = skills_score + project_score + exp_score + learning_score + evidence_score
    overall_match = min(100, max(30, overall_match))

    # Determine recommendation
    if overall_match >= 90:
      recommendation = "Strong Match"
      confidence = "High"
    elif overall_match >= 80:
      recommendation = "Matches Requisition"
      confidence = "High" if len(matched_required) >= len(job.requiredSkills) - 1 else "Medium"
    elif overall_match >= 65:
      recommendation = "Needs Review"
      confidence = "Medium"
    else:
      recommendation = "Low Fit"
      confidence = "Low"

    # 6. Explainable reasons
    strengths = []
    if len(matched_required) == len(job.requiredSkills):
      strengths.append("Meets 100% of required technical skills.")
    elif len(matched_required) >= 3:
      strengths.append(f"Demonstrates proficiency in {len(matched_required)} core skills including {', '.join(matched_required[:3])}.")
      
    if relevant_projects_count >= 2:
      strengths.append(f"Holds {relevant_projects_count} verified projects directly using matching technology architectures.")
      
    if len(sap_evidence_completed) > 0:
      strengths.append(f"Completed SAP learning journey validating cloud/AI foundations: {', '.join(sap_evidence_completed[:1])}.")

    concerns = []
    if missing_required:
      concerns.append(f"Lacks verified project evidence for: {', '.join(missing_required)}.")
    if candidate_exp < job.experienceMin:
      concerns.append(f"Years of experience ({candidate_exp} yrs) falls below job requirement ({job.experienceMin} yrs).")

    why_matched = f"Candidate matches {len(matched_required)} out of {len(job.requiredSkills)} required skills. "
    if relevant_projects_count > 0:
      why_matched += f"Demonstrates strong technical alignment through projects like {', '.join(project_details_list[:2])}. "
    if sap_evidence_completed:
      why_matched += f"Upskilled in verified courses including {sap_evidence_completed[0]}. "
    
    why_matched += "AI recommendation only. Human review required."

    # Skill gaps analysis recommendation
    recommended_upskilling = []
    for miss in missing_required:
      if "sap" in miss.lower():
        recommended_upskilling.append(f"SAP BTP Learning Academy Course: {miss}")
      else:
        recommended_upskilling.append(f"Hands-on Developer Labs: {miss} Essentials")
        
    if not recommended_upskilling:
      recommended_upskilling.append("Advanced enterprise cloud scaling strategies")

    return {
      "candidate_id": candidate.id,
      "job_id": job.id,
      "overall_match_score": overall_match,
      "score_breakdown": MatchScoreBreakdown(
        skills_match=skills_score,
        project_relevance=project_score,
        experience_relevance=exp_score,
        learning=learning_score,
        evidence=evidence_score
      ),
      "confidence": confidence,
      "recommendation": recommendation,
      "why_matched": why_matched,
      "strengths": strengths,
      "concerns": concerns,
      "skill_gaps": missing_required,
      "sap_evidence": candidate.sapLearningEvidence,
      "human_review_required": True
    }

  @staticmethod
  def estimate_experience(candidate: Any) -> int:
    # Compute candidate experience dynamically from candidate profile or parsed experience list
    if hasattr(candidate, "experience") and candidate.experience:
      if isinstance(candidate.experience, list):
        return max(1, len(candidate.experience) * 2)
    if hasattr(candidate, "projects") and candidate.projects:
      return max(1, len(candidate.projects))
    return 2
