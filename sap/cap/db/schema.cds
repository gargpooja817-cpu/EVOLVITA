namespace evolvevita;

using { cuid, managed } from '@sap/cds/common';

/**
 * Enterprise Workforce Intelligence Domain Model
 * Designed for SAP Cloud Application Programming Model (CAP) & SAP HANA Cloud
 */

entity Users : cuid, managed {
  email        : String(255) not null;
  fullName     : String(255) not null;
  avatarUrl    : String(500);
  role         : String(50); // 'candidate' | 'recruiter' | 'admin'
  firebaseUid  : String(128);
  candidate    : Composition of one Candidates on candidate.user = $self;
  recruiter    : Composition of one Recruiters on recruiter.user = $self;
}

entity Candidates : cuid, managed {
  user              : Association to Users;
  targetRole        : String(100);
  location          : String(100);
  availability      : String(100);
  biography         : String(2000);
  matchScore        : Integer default 0;
  confidenceLevel   : String(20); // 'High' | 'Medium' | 'Low'
  decisionStatus    : String(50) default 'Needs Review'; // 'Shortlisted' | 'Needs Review' | 'Rejected'
  recruiterNotes    : String(2000);
  resumes           : Composition of many Resumes on resumes.candidate = $self;
  candidateSkills   : Composition of many CandidateSkills on candidateSkills.candidate = $self;
  matches           : Association to many CandidateMatches on matches.candidate = $self;
  decisions         : Association to many HumanDecisions on decisions.candidate = $self;
}

entity Recruiters : cuid, managed {
  user              : Association to Users;
  department        : String(100);
  organization      : String(150);
  jobs              : Association to many Jobs on jobs.createdBy = $self;
  decisions         : Association to many HumanDecisions on decisions.decidedBy = $self;
}

entity Resumes : cuid, managed {
  candidate         : Association to Candidates not null;
  fileName          : String(255) not null;
  fileType          : String(50); // 'pdf' | 'docx' | 'txt'
  parsedAt          : DateTime;
  rawTextPreview    : LargeString;
  parsedPayloadJson : LargeString;
}

entity Skills : cuid, managed {
  code              : String(100) not null;
  name              : String(150) not null;
  category          : String(100); // 'Programming', 'Cloud', 'AI/ML', 'Framework', 'Database'
  candidateSkills   : Association to many CandidateSkills on candidateSkills.skill = $self;
  jobRequirements   : Association to many JobRequirements on jobRequirements.skill = $self;
}

entity CandidateSkills : cuid, managed {
  candidate         : Association to Candidates not null;
  skill             : Association to Skills not null;
  proficiencyValue  : Integer default 85; // 0 - 100
  verifiedEvidence  : Boolean default false;
  evidenceSource    : String(255); // 'Resume Extraction', 'GitHub Repository', 'SAP Learning Journey'
}

entity Jobs : cuid, managed {
  title             : String(200) not null;
  department        : String(100) not null;
  location          : String(150) not null;
  workMode          : String(50); // 'Remote' | 'Hybrid' | 'On-site'
  employmentType    : String(50); // 'Full-time' | 'Part-time' | 'Contract'
  experienceMin     : Integer default 0;
  experienceMax     : Integer default 10;
  description       : LargeString not null;
  status            : String(50) default 'Active'; // 'Active' | 'Draft' | 'Closed'
  createdBy         : Association to Recruiters;
  requirements      : Composition of many JobRequirements on requirements.job = $self;
  matches           : Association to many CandidateMatches on matches.job = $self;
  biasAudits        : Composition of many BiasAudits on biasAudits.job = $self;
  decisions         : Association to many HumanDecisions on decisions.job = $self;
}

entity JobRequirements : cuid, managed {
  job               : Association to Jobs not null;
  skill             : Association to Skills not null;
  isRequired        : Boolean default true; // true = Required, false = Preferred
  weight            : Decimal(3,2) default 1.0;
}

entity CandidateMatches : cuid, managed {
  candidate         : Association to Candidates not null;
  job               : Association to Jobs not null;
  overallMatchScore : Integer not null; // 0 - 100
  skillsFitScore    : Integer;
  experienceScore   : Integer;
  evidenceScore     : Integer;
  rankingPosition   : Integer;
  recommendation    : String(100); // 'Strong Match', 'Matches Requisition', 'Needs Review', 'Low Fit'
  confidenceLevel   : String(20);  // 'High', 'Medium', 'Low'
  matchedSkillsJson : LargeString;
  missingSkillsJson : LargeString;
  explanationText   : LargeString;
  calculatedAt      : DateTime;
}

entity BiasAudits : cuid, managed {
  job               : Association to Jobs not null;
  fairnessScore     : Integer default 100; // 0 - 100
  issuesDetected    : Integer default 0;
  issuesJson        : LargeString;
  suggestedVersion  : LargeString;
  auditedAt         : DateTime;
}

entity HumanDecisions : cuid, managed {
  candidate         : Association to Candidates not null;
  job               : Association to Jobs not null;
  decision          : String(50) not null; // 'Shortlisted' | 'Needs Review' | 'Rejected'
  decisionNotes     : LargeString;
  decidedBy         : Association to Recruiters;
  decidedAt         : DateTime;
}
