/**
 * API service for communicating with the Spring Boot backend.
 * Includes automatic graceful fallback to interactive demo data
 * when Spring Boot is not yet running on port 8080.
 */

import { INITIAL_MOCK_APPLICATIONS, computeMockStats } from './mockData';

const BASE_URL = '/api';

// In-memory cache for demo/offline fallback mode
let localApps = [...INITIAL_MOCK_APPLICATIONS];
let isBackendLive = null; // null = untried, true = live, false = offline

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

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
}

export const api = {
  // Check if backend is currently responding
  getBackendStatus: () => isBackendLive,

  // Applications
  getApplications: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.keyword) query.append('keyword', params.keyword);
      if (params.company) query.append('company', params.company);
      if (params.jobTitle) query.append('jobTitle', params.jobTitle);
      if (params.status) query.append('status', params.status);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const data = await request(`/applications${queryString}`);
      isBackendLive = true;
      return data;
    } catch (err) {
      // Backend offline fallback (Vite proxy 502 / ECONNREFUSED)
      isBackendLive = false;
      let filtered = [...localApps];

      if (params.status) {
        filtered = filtered.filter((a) => a.status === params.status);
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.companyName.toLowerCase().includes(kw) ||
            a.jobTitle.toLowerCase().includes(kw)
        );
      }

      return filtered;
    }
  },

  getApplicationById: async (id) => {
    try {
      const data = await request(`/applications/${id}`);
      isBackendLive = true;
      return data;
    } catch (err) {
      isBackendLive = false;
      const found = localApps.find((a) => a.id === Number(id));
      if (!found) throw new Error(`Application with ID ${id} not found`);
      return found;
    }
  },

  createApplication: async (payload) => {
    try {
      const data = await request('/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      isBackendLive = true;
      return data;
    } catch (err) {
      if (err.status && err.status !== 502 && err.status !== 504) {
        throw err; // Validation error from server
      }
      isBackendLive = false;
      const newApp = {
        id: Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interviews: [],
      };
      localApps = [newApp, ...localApps];
      return newApp;
    }
  },

  updateApplication: async (id, payload) => {
    try {
      const data = await request(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      isBackendLive = true;
      return data;
    } catch (err) {
      if (err.status && err.status !== 502 && err.status !== 504) {
        throw err;
      }
      isBackendLive = false;
      localApps = localApps.map((a) => (a.id === Number(id) ? { ...a, ...payload, updatedAt: new Date().toISOString() } : a));
      return localApps.find((a) => a.id === Number(id));
    }
  },

  updateApplicationStatus: async (id, status) => {
    try {
      const data = await request(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      isBackendLive = true;
      return data;
    } catch (err) {
      isBackendLive = false;
      localApps = localApps.map((a) => (a.id === Number(id) ? { ...a, status, updatedAt: new Date().toISOString() } : a));
      return localApps.find((a) => a.id === Number(id));
    }
  },

  deleteApplication: async (id) => {
    try {
      await request(`/applications/${id}`, {
        method: 'DELETE',
      });
      isBackendLive = true;
      return null;
    } catch (err) {
      isBackendLive = false;
      localApps = localApps.filter((a) => a.id !== Number(id));
      return null;
    }
  },

  // Interviews
  getInterviews: async (upcomingOnly = false) => {
    try {
      const data = await request(`/interviews?upcoming=${upcomingOnly}`);
      isBackendLive = true;
      return data;
    } catch (err) {
      isBackendLive = false;
      const allInterviews = [];
      const now = new Date();
      localApps.forEach((app) => {
        (app.interviews || []).forEach((iv) => {
          if (!upcomingOnly || new Date(iv.interviewDate) >= now) {
            allInterviews.push(iv);
          }
        });
      });
      return allInterviews.sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
    }
  },

  scheduleInterview: async (applicationId, payload) => {
    try {
      const data = await request(`/applications/${applicationId}/interviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      isBackendLive = true;
      return data;
    } catch (err) {
      if (err.status && err.status !== 502 && err.status !== 504) {
        throw err;
      }
      isBackendLive = false;
      const targetApp = localApps.find((a) => a.id === Number(applicationId));
      const newInterview = {
        id: Date.now(),
        jobApplicationId: Number(applicationId),
        companyName: targetApp ? targetApp.companyName : '',
        jobTitle: targetApp ? targetApp.jobTitle : '',
        ...payload,
        createdAt: new Date().toISOString(),
      };

      if (targetApp) {
        targetApp.interviews = [...(targetApp.interviews || []), newInterview];
        if (targetApp.status === 'APPLIED' || targetApp.status === 'ASSESSMENT') {
          targetApp.status = 'INTERVIEW';
        }
      }

      return newInterview;
    }
  },

  deleteInterview: async (id) => {
    try {
      await request(`/interviews/${id}`, {
        method: 'DELETE',
      });
      isBackendLive = true;
      return null;
    } catch (err) {
      isBackendLive = false;
      localApps.forEach((app) => {
        if (app.interviews) {
          app.interviews = app.interviews.filter((iv) => iv.id !== Number(id));
        }
      });
      return null;
    }
  },

  // Dashboard & Analytics
  getDashboardStats: async () => {
    try {
      const data = await request('/dashboard/stats');
      isBackendLive = true;
      return data;
    } catch (err) {
      isBackendLive = false;
      return computeMockStats(localApps);
    }
  },
};
