import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { login, register, loading, error } = useAuth();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (isRegistering) {
            if (password !== confirmPassword) {
                setLocalError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                setLocalError('Password must be at least 6 characters');
                return;
            }
            const success = await register(email, username, password);
            if (success) {
                navigate('/dashboard');
            }
        } else {
            const success = await login(email, password);
            if (success) {
                navigate('/dashboard');
            }
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setLocalError(null);
        setPassword('');
        setConfirmPassword('');
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-lg border border-slate-800 p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mb-4">
                        S
                    </div>
                    <h1 className="text-3xl font-bold text-white">SentiTrade</h1>
                    <p className="text-gray-400 mt-2">
                        {isRegistering ? 'Create your account' : 'Sign in to your account'}
                    </p>
                </div>

                {displayError && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                        {displayError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                                placeholder="Choose a username"
                                required
                                minLength={3}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            isRegistering ? 'Create Account' : 'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            onClick={toggleMode}
                            className="text-cyan-500 hover:underline font-medium"
                        >
                            {isRegistering ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
