import re
from typing import Dict, List, Any
from models.schemas import BiasIssue

BIASED_PATTERNS = [
  {
    "category": "Gender Language Bias",
    "pattern": r"\brockstar\b|\bninja\b|\bguru\b|\bdominant player\b|\bcommanding performance\b",
    "severity": "medium",
    "explanation": "Uses competitive, gender-coded terminology that historically discourages female applicants.",
    "suggestion": "collaborative engineer / key contributor"
  },
  {
    "category": "Age Language Bias",
    "pattern": r"\bdigital native\b|\byoung team\b|\brecent graduate\b|\byouthful energy\b",
    "severity": "high",
    "explanation": "Implies preference for younger applicants, creating age-discrimination risks.",
    "suggestion": "proficient with modern technology stacks / collaborative contributor"
  },
  {
    "category": "Access Barriers",
    "pattern": r"\bivy league\b|\bdegree from (?:a )?top-tier university\b|\bdegree from (?:a )?top university\b|\btop-tier university degree\b",
    "severity": "medium",
    "explanation": "Restricts sourcing pipelines from self-taught developers or candidates holding verified SAP project credentials.",
    "suggestion": "equivalent practical experience / verified project evidence"
  },
  {
    "category": "Exclusionary Language",
    "pattern": r"\bnative english speaker\b|\bnative speaker\b",
    "severity": "high",
    "explanation": "Excludes fluent non-native speakers who can execute technical and team communication perfectly.",
    "suggestion": "excellent written and verbal communication skills in English"
  },
  {
    "category": "Accessibility Concerns",
    "pattern": r"\bmust be fit and healthy\b|\bable to lift \d+\s*lbs\b",
    "severity": "medium",
    "explanation": "Unnecessary physical constraints for software engineering or desk jobs that may exclude differently-abled professionals.",
    "suggestion": "ability to operate standard developer systems and collaborate in office environments"
  }
]

class BiasAnalyzer:
  @classmethod
  def analyze_bias(cls, text: str) -> Dict[str, Any]:
    if not text:
      return {
        "fairness_score": 100,
        "issues": [],
        "inclusive_version": ""
      }

    detected_issues: List[BiasIssue] = []
    score = 100
    inclusive_text = text
    issue_counter = 1

    for bp in BIASED_PATTERNS:
      # Find all matches for this pattern
      matches = re.finditer(bp["pattern"], text, re.IGNORECASE)
      
      # Keep track of unique matches in this iteration to avoid duplicate issues for the same phrase
      seen_phrases = set()
      
      for match in matches:
        phrase = match.group(0)
        if phrase.lower() in seen_phrases:
          continue
        seen_phrases.add(phrase.lower())

        # Deduct score based on severity
        penalty = 10 if bp["severity"] == "high" else 8
        score = max(30, score - penalty)

        detected_issues.append(BiasIssue(
          id=f"bias-issue-{issue_counter}",
          category=bp["category"],
          phrase=phrase,
          severity=bp["severity"],
          explanation=bp["explanation"],
          suggestion=bp["suggestion"]
        ))
        issue_counter += 1

        # Replace in inclusive version
        # Compile case-insensitive search replace
        reg_replace = re.compile(re.escape(phrase), re.IGNORECASE)
        inclusive_text = reg_replace.sub(bp["suggestion"], inclusive_text)

    return {
      "fairness_score": score,
      "issues": detected_issues,
      "inclusive_version": inclusive_text
    }

  @classmethod
  def apply_suggestions(cls, text: str, issues: List[BiasIssue]) -> str:
    inclusive_text = text
    for issue in issues:
      # Replace issue case insensitively
      reg_replace = re.compile(re.escape(issue.phrase), re.IGNORECASE)
      inclusive_text = reg_replace.sub(issue.suggestion, inclusive_text)
    return inclusive_text
