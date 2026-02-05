import React from 'react';
import { Layout } from '../components/Layout';
import { BacktestResults } from '../components/dashboard/BacktestResults';

export default function BacktestPage() {
    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">The Proof (Backtest Engine)</h1>
                <BacktestResults />
            </div>
        </Layout>
    );
}
