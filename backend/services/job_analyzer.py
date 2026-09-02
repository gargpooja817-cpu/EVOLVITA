import re
from typing import Dict, List, Any
from models.schemas import ExperienceRange
from services.skill_extractor import SkillExtractor

class JobAnalyzer:
  @classmethod
  def analyze_job_description(cls, job_title: str, job_description: str) -> Dict[str, Any]:
    # 1. Skill Extraction
    extracted = SkillExtractor.extract_skills(job_description)
    all_skills = extracted["all_skills"]

    # 2. Separate Required vs Preferred
    # Heuristic: Skills in the title or appearing early/frequently are required.
    # For matching, we will mark the first 60% of parsed skills as required, the rest as preferred.
    # Also, we explicitly match skills from the job title.
    required_skills = []
    preferred_skills = []

    # Parse title words for direct skills (e.g. React in "React Developer")
    title_skills = []
    for skill in all_skills:
      if skill.lower() in job_title.lower():
        title_skills.append(skill)

    required_skills.extend(title_skills)

    for skill in all_skills:
      if skill in required_skills:
        continue
      # If we have less than 5 required skills, add to required
      if len(required_skills) < 5:
        required_skills.append(skill)
      else:
        preferred_skills.append(skill)

    # If no skills parsed at all, provide general defaults based on title keywords
    if not required_skills:
      if "frontend" in job_title.lower() or "developer" in job_title.lower():
        required_skills = ["React", "JavaScript", "HTML", "CSS"]
        preferred_skills = ["TypeScript"]
      elif "ai" in job_title.lower() or "ml" in job_title.lower():
        required_skills = ["Python", "PyTorch", "Machine Learning"]
        preferred_skills = ["Transformers", "FastAPI"]
      else:
        required_skills = ["JavaScript", "Git"]

    # 3. Detect Experience Requirements
    exp_min, exp_max = cls.extract_experience(job_description, job_title)

    # 4. Determine Seniority Level
    seniority = cls.detect_seniority(job_title, job_description, exp_min)

    # 5. Formulate Analysis Summary
    summary = f"This is a {seniority} level role in the {formData_department(job_title)} department requiring proficiency in " \
              f"{', '.join(required_skills[:3])}. Candidates should demonstrate practical experience through verified project evidence."

    return {
      "job_title": job_title,
      "required_skills": required_skills,
      "preferred_skills": preferred_skills,
      "experience_required": {
        "minimum": exp_min,
        "maximum": exp_max
      },
      "seniority_level": seniority,
      "detected_categories": {
        "languages": extracted["languages"],
        "frameworks": extracted["frameworks"],
        "databases": extracted["databases"],
        "cloud": extracted["cloud_devops"]
      },
      "analysis_summary": summary
    }

  @staticmethod
  def extract_experience(description: str, title: str) -> (int, int):
    # Regex 1: "X to Y years" or "X-Y years"
    match_range = re.search(r'(\d+)\s*[-to]+\s*(\d+)\s*years?', description, re.IGNORECASE)
    if match_range:
      return int(match_range.group(1)), int(match_range.group(2))

    # Regex 2: "X+ years"
    match_plus = re.search(r'(\d+)\s*\+\s*years?', description, re.IGNORECASE)
    if match_plus:
      val = int(match_plus.group(1))
      return val, val + 4

    # Regex 3: "minimum of X years"
    match_min = re.search(r'minimum\s+(?:of\s+)?(\d+)\s*years?', description, re.IGNORECASE)
    if match_min:
      val = int(match_min.group(1))
      return val, val + 3

    # Fallbacks based on title keywords
    title_lower = title.lower()
    if "senior" in title_lower:
      return 5, 9
    elif "lead" in title_lower or "principal" in title_lower:
      return 8, 12
    elif "junior" in title_lower or "associate" in title_lower or "intern" in title_lower:
      return 0, 2
    
    return 3, 6

  @staticmethod
  def detect_seniority(title: str, description: str, exp_min: int) -> str:
    title_lower = title.lower()
    text_lower = description.lower()
    
    if "lead" in title_lower or "principal" in title_lower or "architect" in title_lower:
      return "Lead / Principal"
    if "senior" in title_lower or "sr" in title_lower or exp_min >= 5:
      return "Senior"
    if "junior" in title_lower or "jr" in title_lower or "intern" in title_lower or exp_min <= 2:
      return "Junior"
    
    return "Mid-Level"

def formData_department(title: str) -> str:
  title_lower = title.lower()
  if "cloud" in title_lower or "infrastructure" in title_lower or "devops" in title_lower:
    return "Infrastructure"
  if "data" in title_lower or "analytics" in title_lower or "bi" in title_lower:
    return "Data Analytics"
  if "design" in title_lower or "product" in title_lower or "ux" in title_lower:
    return "Product & Design"
  return "Engineering"
