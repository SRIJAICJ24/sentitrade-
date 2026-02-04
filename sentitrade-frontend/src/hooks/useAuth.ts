import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authClient } from '../api/client';

export const useAuth = () => {
    const { token, setToken, clearAuth, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authClient.post('/auth/login', { email, password });
            // Backend returns access_token directly, not nested in data
            const { access_token } = response.data;
            setToken(access_token);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authClient.post('/auth/register', { email, username, password });
            const { access_token } = response.data;
            setToken(access_token);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
    };

    return { token, isAuthenticated, login, register, logout, loading, error };
};
