import React from 'react';
import { Layout } from '../components/Layout';
import { WhaleTracker } from '../components/WhaleTracker';

export default function MomentumPage() {
    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">Momentum & Whales</h1>
                <WhaleTracker />
            </div>
        </Layout>
    );
}
