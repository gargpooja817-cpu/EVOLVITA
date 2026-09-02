import apiFetch from './api';

export const candidateService = {
  getCandidates: async (role = null, jobId = null) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (jobId) params.append('job_id', jobId);
    const qs = params.toString();
    const endpoint = qs ? `/api/candidates?${qs}` : '/api/candidates';
    return await apiFetch(endpoint);
  },

  getCandidate: async (id) => {
    return await apiFetch(`/api/candidates/${id}`);
  },

  applyToJob: async (jobId, applicationData) => {
    return await apiFetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({
        job_id: jobId,
        ...applicationData
      })
    });
  },

  parseResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiFetch('/api/resumes/parse', {
      method: 'POST',
      body: formData
    });
  },

  getMatchAnalysis: async (jobId, candidateId) => {
    return await apiFetch('/api/matching/analyze', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, candidate_id: candidateId })
    });
  },

  matchCandidate: async (matchInput) => {
    return await apiFetch('/api/candidates/match', {
      method: 'POST',
      body: JSON.stringify(matchInput)
    });
  },

  getSkillsGap: async (candidateSkills, targetRole, requiredSkills) => {
    return await apiFetch('/api/skills/gap', {
      method: 'POST',
      body: JSON.stringify({
        candidate_skills: candidateSkills,
        target_role: targetRole,
        required_skills: requiredSkills
      })
    });
  },

  createCandidate: async (candidateData) => {
    return await apiFetch('/api/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData)
    });
  },

  updateCandidate: async (id, data) => {
    return await apiFetch(`/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

export default candidateService;
