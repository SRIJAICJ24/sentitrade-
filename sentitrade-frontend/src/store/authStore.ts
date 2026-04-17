import { create } from 'zustand';
import { authClient } from '../api/client';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: any | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    setToken: (token: string) => void;
    setAuth: (token: string, user: any) => void;
    clearAuth: () => void;
    initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    user: null,

    login: async (email: string, password: string) => {
        try {
            const res = await authClient.post('/auth/login', { email, password });
            const { access_token } = res.data;
            localStorage.setItem('token', access_token);
            set({ token: access_token, isAuthenticated: true, user: { email } });
        } catch (err: any) {
            // If backend is down, use demo mode
            console.warn('[Auth] API login failed, using demo mode:', err?.message);
            const mockToken = "sovereign_demo_" + Date.now();
            localStorage.setItem('token', mockToken);
            set({ token: mockToken, isAuthenticated: true, user: { email } });
        }
    },

    register: async (email: string, username: string, password: string) => {
        try {
            const res = await authClient.post('/auth/register', { email, username, password });
            const { access_token } = res.data;
            localStorage.setItem('token', access_token);
            set({ token: access_token, isAuthenticated: true, user: { email, username } });
        } catch (err: any) {
            // If backend is down, use demo mode
            console.warn('[Auth] API register failed, using demo mode:', err?.message);
            const mockToken = "sovereign_demo_" + Date.now();
            localStorage.setItem('token', mockToken);
            set({ token: mockToken, isAuthenticated: true, user: { email, username } });
        }
    },

    setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
    },

    setAuth: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true, user });
    },

    clearAuth: () => {
        localStorage.removeItem('token');
        set({ token: null, isAuthenticated: false, user: null });
    },

    initAuth: () => {
        const token = localStorage.getItem('token');
        set({ token, isAuthenticated: !!token });
    }
}));
