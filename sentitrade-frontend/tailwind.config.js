/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                neon: {
                    DEFAULT: '#d6ff3f', // Neon Lime
                    dim: '#b3d929',
                },
                obsidian: {
                    DEFAULT: '#000000', // Main Background
                    card: '#171717',    // Card Background
                    border: '#292929',  // Borders
                },
                alert: {
                    DEFAULT: '#ff4d4d', // Alert Red
                },
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            },
        },
    },
    plugins: [],
};
