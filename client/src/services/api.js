import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = `${API_URL}/api`; // Add /api here

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL, // Use the BASE_URL with /api
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Context API calls
export const contextAPI = {
  create: async (contextData) => {
    const response = await api.post("/contexts", contextData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/contexts");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contexts/${id}`);
    return response.data;
  },

  join: async (inviteCode) => {
    const response = await api.post(`/contexts/join/${inviteCode}`);
    return response.data;
  },

  // Add this new function
  joinById: async (contextId) => {
    const response = await api.post(`/contexts/${contextId}/join`);
    return response.data;
  },

  getMembers: async (id) => {
    const response = await api.get(`/contexts/${id}/members`);
    return response.data;
  },

  updateMemberRole: async (contextId, userId, role) => {
    const response = await api.patch(
      `/contexts/${contextId}/members/${userId}/role`,
      { role }
    );
    return response.data;
  },

  removeMember: async (contextId, userId) => {
    const response = await api.delete(
      `/contexts/${contextId}/members/${userId}`
    );
    return response.data;
  },

  regenerateInviteCode: async (id) => {
    const response = await api.post(`/contexts/${id}/regenerate-invite`);
    return response.data;
  },
};

// Project API calls
export const projectAPI = {
  create: async (contextId, projectData) => {
    const response = await api.post(
      `/contexts/${contextId}/projects`,
      projectData
    );
    return response.data;
  },

  getByContext: async (contextId) => {
    const response = await api.get(`/contexts/${contextId}/projects`);
    return response.data;
  },

  getById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  update: async (projectId, projectData) => {
    const response = await api.patch(`/projects/${projectId}`, projectData);
    return response.data;
  },

  delete: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // ADD THIS FUNCTION
  getMembers: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },

  // ADD THIS FUNCTION (if needed for adding members)
  addMember: async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/members`, {
      user_id: userId, // Changed from userId to user_id
    });
    return response.data;
  },

  // ADD THIS FUNCTION (if needed for removing members)
  removeMember: async (projectId, userId) => {
    const response = await api.delete(
      `/projects/${projectId}/members/${userId}`
    );
    return response.data;
  },
};

// Post API calls
export const postAPI = {
  create: async (projectId, postData) => {
    const response = await api.post(`/projects/${projectId}/posts`, postData);
    return response.data;
  },

  getByProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/posts`);
    return response.data;
  },

  getByContext: async (contextId) => {
    const response = await api.get(`/contexts/${contextId}/posts`);
    return response.data;
  },

  update: async (postId, postData) => {
    const response = await api.patch(`/posts/${postId}`, postData);
    return response.data;
  },

  delete: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
  approve: async (postId) => {
    const response = await api.patch(`/posts/${postId}/approve`);
    return response.data;
  },
};

// Public API calls (no auth required)
export const publicAPI = {
  getDashboard: async (contextId) => {
    const response = await api.get(`/public/${contextId}/dashboard`);
    return response.data;
  },

  getContext: async (contextId) => {
    const response = await api.get(`/public/contexts/${contextId}`);
    return response.data;
  },

  getProjects: async (contextId) => {
    const response = await api.get(`/public/contexts/${contextId}/projects`);
    return response.data;
  },

  getPosts: async (contextId) => {
    const response = await api.get(`/public/contexts/${contextId}/posts`);
    return response.data;
  },
};

export default api;
