import { create } from 'zustand';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: any | null;
    login: (email: string, pass: string) => Promise<void>;
    setToken: (token: string) => void;
    setAuth: (token: string, user: any) => void;
    clearAuth: () => void;
    initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    user: null,

    login: async (email, _pass) => {
        // Mock Login for Prototype
        console.log(`[SovereignAuth] Authenticating ${email}...`);
        // In real app, call API here.
        const mockToken = "sovereign_mock_token_" + Date.now();
        localStorage.setItem('token', mockToken);
        set({ token: mockToken, isAuthenticated: true, user: { email } });
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
