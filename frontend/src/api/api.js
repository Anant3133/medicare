// frontend/src/api/api.js
// Axios instance configuration for API calls
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const patientAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getHistory: (id) => api.get(`/patients/${id}/history`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const admissionAPI = {
  getAll: (params) => api.get('/admissions', { params }),
  getById: (id) => api.get(`/admissions/${id}`),
  create: (data) => api.post('/admissions', data),
  createManual: (data) => api.post('/admissions/manual', data),
  discharge: (id) => api.put(`/admissions/${id}/discharge`),
  update: (id, data) => api.put(`/admissions/${id}`, data),
};

export const bedAPI = {
  getAll: (params) => api.get('/beds', { params }),
  getAvailable: (params) => api.get('/beds/available', { params }),
  getStats: () => api.get('/beds/stats'),
  getById: (id) => api.get(`/beds/${id}`),
  create: (data) => api.post('/beds', data),
  updateStatus: (id, status) => api.put(`/beds/${id}/status`, { status }),
  update: (id, data) => api.put(`/beds/${id}`, data),
  delete: (id) => api.delete(`/beds/${id}`),
};

export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getPatients: (id) => api.get(`/doctors/${id}/patients`),
  getWorkload: (id) => api.get(`/doctors/${id}/workload`),
  getAllWorkloads: () => api.get('/doctors/workload/all'),
  getDepartments: () => api.get('/doctors/departments/all'),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

export const billingAPI = {
  getAll: (params) => api.get('/billing', { params }),
  getById: (id) => api.get(`/billing/${id}`),
  getByAdmission: (admissionId) => api.get(`/billing/admission/${admissionId}`),
  generate: (data) => api.post('/billing', data),
  createManual: (data) => api.post('/billing/manual', data),
  markPaid: (id, data) => api.put(`/billing/${id}/pay`, data),
  update: (id, data) => api.put(`/billing/${id}`, data),
  delete: (id) => api.delete(`/billing/${id}`),
  getServices: (params) => api.get('/billing/services/all', { params }),
};

export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getOccupancy: (params) => api.get('/reports/occupancy', { params }),
  getRevenue: (params) => api.get('/reports/revenue', { params }),
  getWaitingList: () => api.get('/reports/waiting-list'),
  getDoctorWorkload: () => api.get('/reports/doctor-workload'),
  getDepartments: () => api.get('/reports/departments'),
  getAdmissionTrends: (params) => api.get('/reports/admission-trends', { params }),
  getAuditLog: (params) => api.get('/reports/audit-log', { params }),
};

export default api;
