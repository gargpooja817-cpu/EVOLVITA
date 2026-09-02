using { evolvevita as my } from '../db/schema';

/**
 * SAP CAP Candidate Service Definition
 * Exposes applicant intelligence, resume parsing, match fit evaluation, and skill gap workflows.
 */
service CandidateService @(path: '/api/v1/candidate') {

  // Read-only / Projection Entities
  @readonly entity CandidateProfile as projection on my.Candidates {
    ID,
    user.email,
    user.fullName,
    targetRole,
    location,
    availability,
    biography,
    matchScore,
    confidenceLevel,
    candidateSkills,
    resumes
  };

  @readonly entity CandidateSkills as projection on my.CandidateSkills {
    ID,
    skill.code,
    skill.name,
    skill.category,
    proficiencyValue,
    verifiedEvidence,
    evidenceSource
  };

  @readonly entity AvailableJobs as projection on my.Jobs {
    ID,
    title,
    department,
    location,
    workMode,
    employmentType,
    experienceMin,
    experienceMax,
    description,
    status,
    requirements
  } where status = 'Active';

  @readonly entity MyJobMatches as projection on my.CandidateMatches {
    ID,
    job.ID as jobId,
    job.title as jobTitle,
    job.department as department,
    overallMatchScore,
    skillsFitScore,
    experienceScore,
    evidenceScore,
    recommendation,
    confidenceLevel,
    matchedSkillsJson,
    missingSkillsJson,
    explanationText,
    calculatedAt
  };

  // Structured Types for Custom Logic
  type ResumeParseResult {
    candidateName : String;
    email         : String;
    phone         : String;
    skills        : array of String;
    projects      : array of {
      name        : String;
      description : String;
    };
    certifications : array of {
      name        : String;
      issuer      : String;
    };
  };

  type MatchCalculationInput {
    candidateId    : UUID;
    jobId          : UUID;
    customJdText   : LargeString;
  };

  type SkillGapResult {
    targetRole       : String;
    matchedSkills    : array of String;
    developingSkills : array of String;
    missingSkills    : array of String;
    growthPath       : array of String;
  };

  type JobApplicationInput {
    jobId        : UUID;
    fullName     : String;
    email        : String;
    phone        : String;
    skills       : array of String;
    availability : String;
  };

  type JobApplicationResult {
    success       : Boolean;
    applicationId : UUID;
    matchScore    : Integer;
    message       : String;
  };

  // Service Actions & Functions (Mapped to FastAPI Intelligence Engine)
  action uploadResume(
    fileName    : String,
    fileType    : String,
    fileContent : LargeBinary
  ) returns ResumeParseResult;

  action calculateJobFit(
    input : MatchCalculationInput
  ) returns MyJobMatches;

  action getSkillGapAnalysis(
    targetRole     : String,
    requiredSkills : array of String
  ) returns SkillGapResult;

  action submitApplication(
    application : JobApplicationInput
  ) returns JobApplicationResult;
}
