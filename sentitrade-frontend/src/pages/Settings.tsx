import { Layout } from '../components/Layout';
import { AlertManager } from '../components/AlertManager';

export default function Settings() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                <div className="grid grid-cols-1 gap-6">
                    {/* Using AlertManager as part of settings */}
                    <AlertManager />

                    {/* Account Settings Placeholder */}
                    <div className="w-full bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                        <div className="text-gray-400">
                            Account management features like password change and profile details would go here.
                        </div>
                    </div>

                    {/* API Keys */}
                    <div className="w-full bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-6">API Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Exchange API Key</label>
                                <input type="password" value="************************" disabled className="w-full max-w-md px-4 py-2 bg-slate-900 border border-slate-600 rounded text-gray-500" />
                            </div>
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded">Update Keys</button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
