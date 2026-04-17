import React, { useRef, useState, useEffect } from 'react';
import { Layers, Activity, Zap, ShieldAlert } from 'lucide-react';

const mockSpikes = [
  { lat: 37.3875, lng: -122.0575, label: "NVDA (Silicon Valley tech)", score: 92, count: 12000, source: "Stocks", volumeSpike: true },
  { lat: 25.2048, lng: 55.2708, label: "OIL (Middle East tensions)", score: 25, count: 8500, source: "Commodities", volumeSpike: true },
  { lat: 40.7128, lng: -74.0060, label: "SPY (Wall Street)", score: 55, count: 5000, source: "Social Buzz", volumeSpike: false },
  { lat: 51.5074, lng: -0.1278, label: "FTSE (London)", score: 48, count: 3200, source: "Risk", volumeSpike: false },
  { lat: -23.5505, lng: -46.6333, label: "VALE (Brazil Resources)", score: 38, count: 950, source: "Commodities", volumeSpike: false },
  { lat: 35.6762, lng: 139.6503, label: "NKY (Tokyo Tech)", score: 68, count: 4100, source: "Stocks", volumeSpike: true }
];

// Capital flows: NYC -> London -> Dubai -> Tokyo -> Silicon Valley.
const mockArcs = [
  { startLat: 40.7128, startLng: -74.0060, endLat: 51.5074, endLng: -0.1278, color: ['#a855f7', '#d6ff3f'] }, 
  { startLat: 51.5074, startLng: -0.1278, endLat: 25.2048, endLng: 55.2708, color: ['#a855f7', '#a855f7'] },
  { startLat: 25.2048, startLng: 55.2708, endLat: 35.6762, endLng: 139.6503, color: ['#d6ff3f', '#d6ff3f'] },
  { startLat: 35.6762, startLng: 139.6503, endLat: 37.3875, endLng: -122.0575, color: ['#a855f7', '#d6ff3f'] },
];

interface SentimentGlobeProps {
  onAssetClick?: (assetSymbol: string, score: number) => void;
}

export const SentimentGlobe: React.FC<SentimentGlobeProps> = ({ onAssetClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  
  const [activeLayer, setActiveLayer] = useState<string>('All');

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    const initGlobe = () => {
      // Check if the script loaded
      if (!containerRef.current || !(window as any).Globe) {
        return false;
      }
      
      // Prevent double init
      if (globeInstanceRef.current) return true;

      // Initialize Vanilla Globe
      const globe = (window as any).Globe()(containerRef.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundColor('#000000') // Absolute Black per Sovereign HUD
        .showAtmosphere(true)
        .atmosphereColor('#262626')
        .atmosphereAltitude(0.15);

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 1.0;
      
      // Rings (Volume Spikes)
      globe.ringsData(mockSpikes.filter((d: any) => d.volumeSpike))
        .ringLat('lat')
        .ringLng('lng')
        .ringColor((d: any) => d.score > 60 ? '#d6ff3f' : '#ff4d4d')
        .ringMaxRadius(12)
        .ringPropagationSpeed(3)
        .ringRepeatPeriod(800);

      // Arcs (Capital Flow)
      globe.arcsData(mockArcs)
        .arcStartLat('startLat')
        .arcStartLng('startLng')
        .arcEndLat('endLat')
        .arcEndLng('endLng')
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500)
        .arcStroke(1);

      // Labels
      globe.labelsData(mockSpikes)
        .labelLat('lat')
        .labelLng('lng')
        .labelText((d: any) => d.label)
        .labelSize((d: any) => Math.sqrt(d.score) * 0.2)
        .labelDotRadius(0.5)
        .labelColor((d: any) => d.score > 60 ? '#d6ff3f' : '#ff4d4d')
        .labelResolution(2)
        .onLabelClick((d: any) => {
          if (onAssetClick) onAssetClick(d.label.split(' ')[0], d.score);
        });

      globeInstanceRef.current = globe;

      const handleResize = () => {
        if (containerRef.current && globeInstanceRef.current) {
          globeInstanceRef.current
            .width(containerRef.current.clientWidth)
            .height(containerRef.current.clientHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      setTimeout(handleResize, 100);
      return true;
    };

    // Try to init now
    if (!initGlobe()) {
       // If failed, poll every 200ms until window.Globe is injected
       checkInterval = setInterval(() => {
          if (initGlobe()) {
             clearInterval(checkInterval);
          }
       }, 200);
    }

    // Explicitly trigger a few resize attempts as the layout settles
    const resizeAttempts = [100, 500, 1000, 2000];
    const timers = resizeAttempts.map(delay => setTimeout(() => {
       if (globeInstanceRef.current && containerRef.current) {
          globeInstanceRef.current
            .width(containerRef.current.clientWidth)
            .height(containerRef.current.clientHeight);
       }
    }, delay));

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      timers.forEach(t => clearTimeout(t));
      if (containerRef.current) {
         containerRef.current.innerHTML = ''; // Cleanup WebGL canvas
      }
      globeInstanceRef.current = null;
    };
  }, []);

  // Handle Layer Filtering
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    const filteredSpikes = activeLayer === 'All' 
        ? mockSpikes 
        : mockSpikes.filter(s => s.source === activeLayer);
    
    globeInstanceRef.current.labelsData(filteredSpikes);
    globeInstanceRef.current.ringsData(filteredSpikes.filter(d => d.volumeSpike));
  }, [activeLayer]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-obsidian border-x border-obsidian-border group">
      
      {/* 3D Container Target */}
      <div className="w-full h-full" ref={containerRef}></div>
      
      {/* Intelligence Layers HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase font-mono mb-2 border-b border-obsidian-border pb-1">
          INTELLIGENCE LAYERS
        </h3>
        <div className="flex flex-col gap-1.5">
          {[
            { id: 'All', icon: Layers, label: 'MASTER COMPS' },
            { id: 'Stocks', icon: Activity, label: 'EQUITIES' },
            { id: 'Commodities', icon: Zap, label: 'COMMODITIES' },
            { id: 'Social Buzz', icon: Zap, label: 'SOCIAL BUZZ' },
            { id: 'Risk', icon: ShieldAlert, label: 'GEO RISK' }
          ].map(layer => (
            <button
               key={layer.id}
               onClick={() => setActiveLayer(layer.id)}
               className={`flex items-center gap-2 px-3 py-2 text-[10px] font-mono tracking-wider border rounded-md transition-all ${
                 activeLayer === layer.id 
                 ? 'bg-neon/10 text-neon border-neon/50' 
                 : 'bg-obsidian-card text-slate-500 border-obsidian-border hover:border-slate-600 hover:text-slate-300'
               }`}
            >
               <layer.icon size={12} />
               {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decorative Capital Flow Legend */}
      <div className="absolute bottom-4 right-4 z-20 p-3 bg-obsidian-card border border-obsidian-border rounded-md pointer-events-none">
        <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">Capital Flow Tracker</div>
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="w-2 h-0.5 bg-neon shadow-[0_0_5px_#d6ff3f]"></span>
                <span className="text-[8px] font-mono text-slate-400">Retail / Bullish Rotation</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-0.5 bg-purple-500 shadow-[0_0_5px_#a855f7]"></span>
                <span className="text-[8px] font-mono text-slate-400">Institutional Flight</span>
            </div>
        </div>
      </div>

    </div>
  );
};
