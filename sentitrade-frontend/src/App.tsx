import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Scenarios
import { LandingPage } from './scenarios/LandingPage';
import { SovereignAuth } from './scenarios/SovereignAuth';
import { RiskProfiler } from './scenarios/RiskProfiler';

// Terminal Pages
import Dashboard from './pages/Dashboard';
import { WealthVault } from './components/dashboard/WealthVault'; // Temporarily using component as page
import { SmartWishlist } from './components/dashboard/SmartWishlist';
import { WhaleTracker } from './components/WhaleTracker';
import { FloatingOrbs } from './components/navigation/FloatingOrbs';

function App() {
  // App State Orchestrator
  const [appState, setAppState] = useState<'LANDING' | 'AUTH' | 'RISK' | 'TERMINAL'>('LANDING');
  const [terminalView, setTerminalView] = useState('dashboard');

  return (
    <div className="bg-[#020617] min-h-screen text-white font-['Urbanist'] overflow-x-hidden">
      <AnimatePresence mode="wait">

        {/* SCENARIO 1: LANDING */}
        {appState === 'LANDING' && (
          <motion.div key="landing" exit={{ opacity: 0 }}>
            <LandingPage onEnter={() => setAppState('AUTH')} />
          </motion.div>
        )}

        {/* SCENARIO 2: AUTH */}
        {appState === 'AUTH' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SovereignAuth onComplete={() => setAppState('RISK')} />
          </motion.div>
        )}

        {/* SCENARIO 3: RISK PROFILER */}
        {appState === 'RISK' && (
          <motion.div key="risk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RiskProfiler onComplete={() => setAppState('TERMINAL')} />
          </motion.div>
        )}

        {/* SCENARIO 4: THE TERMINAL */}
        {appState === 'TERMINAL' && (
          <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32">

            {/* View Switcher */}
            {terminalView === 'dashboard' && <Dashboard />}
            {terminalView === 'portfolio' && (
              <div className="p-8 max-w-7xl mx-auto pt-20">
                <WealthVault />
              </div>
            )}

            {/* View: XAI Advisor (Overlay) */}
            {terminalView === 'xai_advisor' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setTerminalView('dashboard')}>
                <div className="bg-slate-900 p-8 rounded-2xl border border-neon/30 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold text-white mb-4">XAI Command Center</h2>
                  <p className="text-slate-400 mb-6">Ask the Senti-Core directly about your portfolio or market conditions.</p>
                  {/* Placeholder for Chat */}
                  <div className="h-64 bg-black/50 rounded-lg mb-4 border border-slate-800 flex items-center justify-center text-slate-600 font-mono">
                    AWAITING UPLINK...
                  </div>
                  <button onClick={() => setTerminalView('dashboard')} className="w-full py-3 bg-neon text-black font-bold uppercase rounded hover:bg-white transition-colors">Close Uplink</button>
                </div>
              </div>
            )}

            {/* Placeholder for other views */}
            {/* View: Wishlist */}
            {terminalView === 'wishlist' && (
              <div className="p-8 max-w-7xl mx-auto pt-20 space-y-6">
                <div className="bg-obsidian-card p-6 rounded-xl border border-obsidian-border">
                  <h2 className="text-2xl font-bold text-white mb-6">Smart Wishlist & Budget</h2>
                  <SmartWishlist />
                </div>
              </div>
            )}

            {/* View: Momentum (Whale Tracker) */}
            {terminalView === 'momentum' && (
              <div className="p-8 max-w-7xl mx-auto pt-20 space-y-6">
                <div className="bg-obsidian-card p-6 rounded-xl border border-obsidian-border">
                  <h2 className="text-2xl font-bold text-white mb-6">Institutional Momentum</h2>
                  <WhaleTracker />
                </div>
              </div>
            )}

            {/* Floating Navigation */}
            <FloatingOrbs currentView={terminalView} onNavigate={setTerminalView} />

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;
