import { useState, useEffect } from 'react';
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
import { AlgorithmShowcase } from './components/dashboard/AlgorithmShowcase';
import { FloatingOrbs } from './components/navigation/FloatingOrbs';

// Global Overlays
import { CommandBar } from './components/common/CommandBar';
import { ContagionModal } from './components/dashboard/ContagionModal';
import { WhyPanel } from './components/dashboard/WhyPanel';
import { AlphaTicker } from './components/dashboard/AlphaTicker';

function App() {
  // App State Orchestrator
  const [appState, setAppState] = useState<'LANDING' | 'AUTH' | 'RISK' | 'TERMINAL'>('LANDING');
  const [terminalView, setTerminalView] = useState('dashboard');
  
  // Global Overlay States
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [contagionAsset, setContagionAsset] = useState<string | null>(null);
  const [whySignal, setWhySignal] = useState<any>(null);

  // Global bindings (Ctrl+K and Globe Clicks)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleGlobeClick = ((e: CustomEvent) => {
        const { asset, score } = e.detail;
        if (score < 40) {
            setContagionAsset(asset);
        }
    }) as EventListener;
    window.addEventListener('globeClicked', handleGlobeClick);
    return () => window.removeEventListener('globeClicked', handleGlobeClick);
  }, []);

  const handleCommandSelect = (item: any) => {
      console.log('Command triggered:', item);
      if (item.type === 'asset') {
          window.dispatchEvent(new CustomEvent('assetFocused', { detail: item.id }));
      } else if (item.type === 'view') {
          if (item.id === 'contagion_map') setContagionAsset('NVDA');
          else if (item.id === 'globe_view') setTerminalView('dashboard');
      }
  };

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
            <SovereignAuth onComplete={(mode) => setAppState(mode === 'login' ? 'TERMINAL' : 'RISK')} />
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
          <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32 pr-0 xl:pr-[280px]">
            {/* Global Overlays & Sidebar */}
            <AlphaTicker onSignalClick={(signal) => setWhySignal(signal)} />
            <CommandBar isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onSelect={handleCommandSelect} />
            <ContagionModal asset={contagionAsset || 'NVDA'} isOpen={!!contagionAsset} onClose={() => setContagionAsset(null)} />
            <WhyPanel signal={whySignal} isOpen={!!whySignal} onClose={() => setWhySignal(null)} />
            
            {/* Cmd+K Hint */}
            <div className="fixed top-6 right-8 xl:right-[310px] z-50 bg-black/60 border border-slate-700 px-3 py-1.5 rounded-full backdrop-blur-md hidden md:flex items-center gap-2 cursor-pointer hover:border-slate-500 transition-colors" onClick={() => setIsCommandOpen(true)}>
                <span className="text-[10px] font-mono text-slate-400">Search</span>
                <span className="flex items-center gap-1">
                   <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">⌘</kbd>
                   <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">K</kbd>
                </span>
            </div>

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

            {/* View: Algorithms */}
            {terminalView === 'algorithms' && (
              <div className="p-8 max-w-7xl mx-auto pt-20 space-y-6 flex items-center justify-center">
                <div className="w-full max-w-5xl">
                    <AlgorithmShowcase />
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
