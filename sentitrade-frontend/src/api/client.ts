import axios, { type AxiosInstance } from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Use relative path for proxy
const API_V1_URL = import.meta.env.VITE_API_V1_URL || `${API_BASE_URL}/api/v1`;

// API client for /api/v1 routes
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_V1_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth client for /auth routes (no /api/v1 prefix)
export const authClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear auth and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
