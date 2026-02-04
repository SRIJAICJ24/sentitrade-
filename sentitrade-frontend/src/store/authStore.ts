import { create } from 'zustand';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    clearAuth: () => void;
    initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
    },

    clearAuth: () => {
        localStorage.removeItem('token');
        set({ token: null, isAuthenticated: false });
    },

    initAuth: () => {
        const token = localStorage.getItem('token');
        set({ token, isAuthenticated: !!token });
    }
}));
