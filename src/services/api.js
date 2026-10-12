/**
 * API service for communicating with the Spring Boot backend.
 * Uses native fetch with standard JSON headers.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.errors = data?.errors || null;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.');
    }
    throw err;
  }
}

export const api = {
  // Applications
  getApplications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.company) query.append('company', params.company);
    if (params.jobTitle) query.append('jobTitle', params.jobTitle);
    if (params.status) query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/applications${queryString}`);
  },

  getApplicationById: (id) => request(`/applications/${id}`),

  createApplication: (payload) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateApplication: (id, payload) =>
    request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateApplicationStatus: (id, status) =>
    request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteApplication: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),

  // Interviews
  getInterviews: (upcomingOnly = false) =>
    request(`/interviews?upcoming=${upcomingOnly}`),

  scheduleInterview: (applicationId, payload) =>
    request(`/applications/${applicationId}/interviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateInterview: (id, payload) =>
    request(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteInterview: (id) =>
    request(`/interviews/${id}`, {
      method: 'DELETE',
    }),

  // Dashboard & Analytics
  getDashboardStats: () => request('/dashboard/stats'),
};
