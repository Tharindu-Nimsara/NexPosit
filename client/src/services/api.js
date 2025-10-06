import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
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

  getMembers: async (id) => {
    const response = await api.get(`/contexts/${id}/members`);
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

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.patch(`/projects/${id}`, projectData);
    return response.data;
  },

  addMember: async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/members`, {
      user_id: userId,
    });
    return response.data;
  },

  removeMember: async (projectId, userId) => {
    const response = await api.delete(
      `/projects/${projectId}/members/${userId}`
    );
    return response.data;
  },

  getMembers: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },
};

// Post API calls
export const postAPI = {
  create: async (projectId, postData) => {
    const response = await api.post(`/projects/${projectId}/posts`, postData);
    return response.data;
  },

  getByContext: async (contextId) => {
    const response = await api.get(`/contexts/${contextId}/posts`);
    return response.data;
  },

  getByProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/posts`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  update: async (id, postData) => {
    const response = await api.patch(`/posts/${id}`, postData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.patch(`/posts/${id}/approve`);
    return response.data;
  },
};

export default api;
