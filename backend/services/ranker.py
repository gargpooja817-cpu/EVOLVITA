from typing import List, Dict, Any
from models.schemas import RankedCandidateDetail, MatchScoreBreakdown
from services.matcher import Matcher

class Ranker:
  @classmethod
  def rank_candidates(cls, job: Any, candidates: List[Any]) -> List[RankedCandidateDetail]:
    scored_candidates = []
    
    for cand in candidates:
      match_res = Matcher.calculate_match(job, cand)
      
      # Extract required skill list details
      candidate_skills = [sk.name for sk in cand.skillsDNA]
      
      matched_skills = []
      missing_skills = []
      for req_skill in job.requiredSkills:
        if any(req_skill.lower() == cand_sk.lower() for cand_sk in candidate_skills):
          matched_skills.append(req_skill)
        else:
          missing_skills.append(req_skill)

      scored_candidates.append({
        "candidate_id": cand.id,
        "name": cand.name,
        "overall_match_score": match_res["overall_match_score"],
        "score_breakdown": match_res["score_breakdown"],
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "strengths": match_res["strengths"],
        "skill_gaps": match_res["skill_gaps"],
        "recommendation": match_res["recommendation"],
        "candidate_obj": cand
      })

    # Sort scored candidates by match score descending
    scored_candidates.sort(key=lambda x: x["overall_match_score"], reverse=True)

    ranked_results = []
    for idx, cand_score in enumerate(scored_candidates):
      ranked_results.append(RankedCandidateDetail(
        candidate_id=cand_score["candidate_id"],
        name=cand_score["name"],
        overall_match_score=cand_score["overall_match_score"],
        ranking=idx + 1,
        score_breakdown=cand_score["score_breakdown"],
        matched_skills=cand_score["matched_skills"],
        missing_skills=cand_score["missing_skills"],
        strengths=cand_score["strengths"],
        skill_gaps=cand_score["skill_gaps"],
        recommendation=cand_score["recommendation"]
      ))

    return ranked_results
