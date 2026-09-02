using { evolvevita as my } from '../db/schema';

/**
 * SAP CAP Recruiter Service Definition
 * Exposes talent sourcing, requisition management, bulk resume ranking, bias audits, and human decision logging.
 */
service RecruiterService @(path: '/api/v1/recruiter') {

  // Primary Entities with Full Lifecycle
  entity JobRequisitions as projection on my.Jobs actions {
    action closeRequisition() returns JobRequisitions;
  };

  entity CandidatePipeline as projection on my.Candidates {
    ID,
    user.email,
    user.fullName,
    targetRole,
    location,
    availability,
    biography,
    matchScore,
    confidenceLevel,
    decisionStatus,
    recruiterNotes,
    candidateSkills,
    matches,
    decisions
  };

  entity RankedMatches as projection on my.CandidateMatches;
  entity BiasAuditLogs as projection on my.BiasAudits;
  entity HumanDecisionLogs as projection on my.HumanDecisions;

  // Types for Sourcing & Intelligence
  type JobAnalysisResult {
    jobTitle        : String;
    requiredSkills  : array of String;
    preferredSkills : array of String;
    experienceMin   : Integer;
    experienceMax   : Integer;
    seniorityLevel  : String;
  };

  type BiasAuditResult {
    fairnessScore   : Integer;
    issuesCount     : Integer;
    issues          : array of {
      category      : String;
      phrase        : String;
      explanation   : String;
      suggestion    : String;
    };
    inclusiveText   : LargeString;
  };

  type RankedCandidateItem {
    candidateId       : String;
    name              : String;
    email             : String;
    overallMatchScore : Integer;
    rankingPosition   : Integer;
    matchedSkills     : array of String;
    missingSkills     : array of String;
    scoreBreakdown    : {
      skillsFit       : Integer;
      experience      : Integer;
      evidence        : Integer;
    };
    explanation       : String;
    recommendation    : String;
  };

  type HumanDecisionInput {
    candidateId   : UUID;
    jobId         : UUID;
    decision      : String; // 'Shortlisted' | 'Needs Review' | 'Rejected'
    notes         : LargeString;
  };

  // Actions Mapped to Core Business Operations
  action analyzeJobRequirements(
    jobDescription : LargeString
  ) returns JobAnalysisResult;

  action auditJobDescriptionBias(
    jobDescription : LargeString
  ) returns BiasAuditResult;

  action rankUploadedResumes(
    jobId          : UUID,
    jobDescription : LargeString,
    filesCount     : Integer
  ) returns array of RankedCandidateItem;

  action recordHumanDecision(
    decision : HumanDecisionInput
  ) returns HumanDecisionLogs;
}
