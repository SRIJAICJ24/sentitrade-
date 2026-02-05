import React from 'react';
import { Layout } from '../components/Layout';
import { WealthVault } from '../components/dashboard/WealthVault';

export default function WealthVaultPage() {
    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">Wealth Vault</h1>
                <WealthVault />
            </div>
        </Layout>
    );
}
