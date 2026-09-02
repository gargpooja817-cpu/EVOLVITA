import re
from typing import Dict, List, Set, Any

# Canonical Skill Name mapping from typical aliases
SKILL_ALIASES = {
  # Languages
  "python": "Python",
  "py": "Python",
  "java": "Java",
  "javascript": "JavaScript",
  "js": "JavaScript",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "golang": "Go",
  "go": "Go",
  "rust": "Rust",
  "ruby": "Ruby",
  "c++": "C++",
  "c#": "C#",
  "kotlin": "Kotlin",
  "swift": "Swift",
  "php": "PHP",
  "html": "HTML",
  "html5": "HTML",
  "css": "CSS",
  "css3": "CSS",
  
  # Frontend
  "react": "React",
  "reactjs": "React",
  "react.js": "React",
  "angular": "Angular",
  "angularjs": "Angular",
  "vue": "Vue",
  "vuejs": "Vue",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "tailwind": "Tailwind",
  "tailwindcss": "Tailwind",
  "bootstrap": "Bootstrap",
  "redux": "Redux",
  "framer motion": "Framer Motion",
  "threejs": "Three.js",
  "three.js": "Three.js",
  
  # Backend
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "node": "Node.js",
  "express": "Express",
  "expressjs": "Express",
  "fastapi": "FastAPI",
  "django": "Django",
  "flask": "Flask",
  "spring boot": "Spring Boot",
  "spring": "Spring Boot",
  "graphql": "GraphQL",
  "rest api": "REST API",
  "restful api": "REST API",
  "apis": "REST API",
  
  # Databases
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "mysql": "MySQL",
  "mongodb": "MongoDB",
  "mongo": "MongoDB",
  "sqlite": "SQLite",
  "redis": "Redis",
  "snowflake": "Snowflake",
  "qdrant": "Qdrant",
  
  # Cloud & DevOps
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "GCP",
  "google cloud": "GCP",
  "google cloud platform": "GCP",
  "azure": "Azure",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "terraform": "Terraform",
  "jenkins": "Jenkins",
  "github actions": "GitHub Actions",
  "gitops": "GitOps",
  
  # AI/ML
  "machine learning": "Machine Learning",
  "ml": "Machine Learning",
  "deep learning": "Deep Learning",
  "dl": "Deep Learning",
  "tensorflow": "TensorFlow",
  "pytorch": "PyTorch",
  "scikit-learn": "Scikit-learn",
  "scikit learn": "Scikit-learn",
  "sklearn": "Scikit-learn",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "nlp": "NLP",
  "natural language processing": "NLP",
  "llm": "LLMs",
  "llms": "LLMs",
  "large language models": "LLMs",
  "generative ai": "Generative AI",
  "generativeai": "Generative AI",
  "gen ai": "Generative AI",
  "transformers": "Transformers",
  "hugging face": "Hugging Face",
  "huggingface": "Hugging Face",
  "vector database": "Vector Databases",
  "vector databases": "Vector Databases",
  "vector db": "Vector Databases",
  "langchain": "LangChain",
  
  # SAP Skills
  "sap btp": "SAP BTP",
  "sap business technology platform": "SAP BTP",
  "sap ai": "SAP AI",
  "sap ai core": "SAP AI Core",
  "sap hana": "SAP HANA",
  "sap fiori": "SAP Fiori",
  "sapUI5": "SAP Fiori",
  "sap s/4hana": "SAP S/4HANA",
  "s4hana": "SAP S/4HANA",
  
  # Tools
  "git": "Git",
  "github": "GitHub",
  "figma": "Figma",
  "jira": "Jira",
  "linux": "Linux",
  "postman": "Postman"
}

# Skill Categorization Taxonomy
TAXONOMY = {
  "languages": ["Python", "Java", "JavaScript", "TypeScript", "Go", "Rust", "C++", "C#", "Kotlin", "Swift", "PHP", "HTML", "CSS"],
  "frameworks": ["React", "Angular", "Vue", "Next.js", "Tailwind", "Bootstrap", "Redux", "Framer Motion", "Three.js"],
  "backend": ["Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "GraphQL", "REST API"],
  "databases": ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Snowflake", "Qdrant", "Vector Databases"],
  "cloud_devops": ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions", "GitOps"],
  "ai_ml": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "NLP", "LLMs", "Generative AI", "Transformers", "Hugging Face", "LangChain"],
  "sap_skills": ["SAP BTP", "SAP AI Core", "SAP AI", "SAP HANA", "SAP Fiori", "SAP S/4HANA"],
  "tools": ["Git", "GitHub", "Figma", "Jira", "Linux", "Postman"]
}

class SkillExtractor:
  @staticmethod
  def normalize_text(text: str) -> str:
    if not text:
      return ""
    # Standardize casing and replace smart punctuation
    normalized = text.lower()
    normalized = normalized.replace("’", "'").replace("“", '"').replace("”", '"')
    return normalized

  @classmethod
  def extract_skills(cls, text: str) -> Dict[str, List[str]]:
    normalized_text = cls.normalize_text(text)
    detected_skills: Set[str] = set()

    # Search for occurrences of each alias
    for alias, canonical_name in SKILL_ALIASES.items():
      # Compile regex to match words with boundary rules. 
      # Special characters like c++ or .js need escaping.
      escaped_alias = re.escape(alias)
      
      # Boundary configuration: 
      # - Require boundaries around typical alphabetic aliases.
      # - Handle symbols like C++ or .js correctly.
      if re.search(r'[a-zA-Z0-9]', alias[0]) and re.search(r'[a-zA-Z0-9]', alias[-1]):
        pattern = r'\b' + escaped_alias + r'\b'
      elif re.search(r'[a-zA-Z0-9]', alias[0]):
        pattern = r'\b' + escaped_alias
      elif re.search(r'[a-zA-Z0-9]', alias[-1]):
        pattern = escaped_alias + r'\b'
      else:
        pattern = escaped_alias
        
      if re.search(pattern, normalized_text):
        detected_skills.add(canonical_name)

    # Categorize detected skills
    result: Dict[str, List[str]] = {
      "all_skills": sorted(list(detected_skills)),
      "languages": [],
      "frameworks": [],
      "backend": [],
      "databases": [],
      "cloud_devops": [],
      "ai_ml": [],
      "sap_skills": [],
      "tools": []
    }

    for skill in detected_skills:
      categorized = False
      for category, list_of_skills in TAXONOMY.items():
        if skill in list_of_skills:
          result[category].append(skill)
          categorized = True
      
      # Fallback to general list if not explicitly categorised
      if not categorized:
        result["tools"].append(skill)

    # Sort each list alphabetically
    for key in result:
      result[key] = sorted(list(set(result[key])))

    return result
