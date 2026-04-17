import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const COMMAND_DATA = [
  { id: 'NVDA', type: 'asset', label: 'NVDA (NVIDIA)', category: 'ASSETS' },
  { id: 'BTC', type: 'asset', label: 'BTC (Bitcoin)', category: 'ASSETS' },
  { id: 'SPY', type: 'asset', label: 'SPY (S&P 500)', category: 'ASSETS' },
  { id: 'GOLD', type: 'asset', label: 'GOLD', category: 'ASSETS' },
  { id: 'OIL', type: 'asset', label: 'OIL', category: 'ASSETS' },
  { id: 'TSLA', type: 'asset', label: 'TSLA (Tesla)', category: 'ASSETS' },
  { id: 'ETH', type: 'asset', label: 'ETH (Ethereum)', category: 'ASSETS' },
  { id: 'AAPL', type: 'asset', label: 'AAPL (Apple)', category: 'ASSETS' },
  { id: 'globe_view', type: 'view', label: 'Globe View', category: 'VIEWS' },
  { id: 'contagion_map', type: 'view', label: 'Contagion Map', category: 'VIEWS' },
  { id: 'panic_meter', type: 'view', label: 'Panic Meter', category: 'VIEWS' },
  { id: 'agent_council', type: 'view', label: 'Agent Council Status', category: 'VIEWS' },
  { id: 'dry_trade', type: 'action', label: 'Run Dry Trade Simulation', category: 'ACTIONS' },
  { id: 'export_signal', type: 'action', label: 'Export Signal Report', category: 'ACTIONS' },
  { id: 'clear_alert', type: 'action', label: 'Clear Alert Queue', category: 'ACTIONS' }
];

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const filteredItems = COMMAND_DATA.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus input on open
    setTimeout(() => {
        inputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        e.preventDefault();
      } else if (e.key === 'Enter' && filteredItems.length > 0) {
        handleSelect(filteredItems[selectedIndex]);
        e.preventDefault();
      } // Cmd/Ctrl+K handled globally
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: any) => {
    onSelect(item);
    setQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-md px-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-[#080812] w-full max-w-2xl rounded-xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-white/10">
            <Search className="text-slate-400 w-5 h-5 mr-3" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent py-4 text-white outline-none font-mono placeholder:text-slate-500 text-lg"
              placeholder="Search assets, signals, events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC</div>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-mono">No results found.</div>
            ) : (
                ['ASSETS', 'VIEWS', 'ACTIONS'].map(category => {
                    const categoryItems = filteredItems.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    return (
                        <div key={category} className="mb-4 last:mb-0">
                            <div className="px-3 py-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                                {category}
                            </div>
                            {categoryItems.map(item => {
                                // Find overall index to check if selected
                                const itemIndex = filteredItems.findIndex(i => i.id === item.id);
                                const isSelected = itemIndex === selectedIndex;

                                return (
                                    <div
                                        key={item.id}
                                        className={`px-4 py-2.5 rounded-lg flex items-center cursor-pointer transition-colors font-mono text-sm ${isSelected ? 'bg-indigo-600/30 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                                    >
                                        {/* Icon based on category */}
                                        {category === 'ASSETS' && <span className="w-2 h-2 rounded-full bg-neon mr-3"></span>}
                                        {category === 'VIEWS' && <span className="w-2 h-2 rounded-sm bg-purple-500 mr-3"></span>}
                                        {category === 'ACTIONS' && <span className="w-2 h-2 rotate-45 bg-amber-500 mr-3"></span>}

                                        {item.label}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
