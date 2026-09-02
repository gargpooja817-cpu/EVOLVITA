import apiFetch from './api';

export const recruiterService = {
  getJobs: async () => {
    return await apiFetch('/api/jobs');
  },

  getJob: async (id) => {
    return await apiFetch(`/api/jobs/${id}`);
  },

  createJob: async (jobData) => {
    return await apiFetch('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },

  updateJob: async (id, jobData) => {
    return await apiFetch(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
  },

  deleteJob: async (id) => {
    return await apiFetch(`/api/jobs/${id}`, {
      method: 'DELETE'
    });
  },

  analyzeJobDescription: async (description) => {
    return await apiFetch('/api/jobs/analyze', {
      method: 'POST',
      body: JSON.stringify({ job_description: description })
    });
  },

  analyzeBias: async (description) => {
    return await apiFetch('/api/bias/analyze', {
      method: 'POST',
      body: JSON.stringify({ job_description: description })
    });
  },

  applyBiasSuggestions: async (description, issues) => {
    return await apiFetch('/api/bias/apply-suggestions', {
      method: 'POST',
      body: JSON.stringify({
        job_description: description,
        issues: issues
      })
    });
  },

  rankResumes: async (formData) => {
    return await apiFetch('/api/candidates/rank', {
      method: 'POST',
      body: formData
    });
  }
};

export default recruiterService;
