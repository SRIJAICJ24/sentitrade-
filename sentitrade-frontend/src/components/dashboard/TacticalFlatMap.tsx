import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Using CARTO basemaps as they don't require an API key by default
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Shared Mock Data from SentimentGlobe
const mockSpikes = [
  { lat: 37.7, lng: -122.4, label: "NVDA", score: 87, count: 4200, source: "Reddit" },
  { lat: 40.7, lng: -74.0, label: "SPY", score: 34, count: 8100, source: "FinTwit" },
  { lat: 51.5, lng: -0.1, label: "FTSE", score: 58, count: 1200, source: "News" },
  { lat: 25.2, lng: 55.3, label: "OIL", score: 71, count: 990, source: "AIS Alert" },
  { lat: 35.6, lng: 139.6, label: "NKY", score: 45, count: 2300, source: "Twitter" }
];

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 45,
  bearing: 0
};

export const TacticalFlatMap: React.FC = () => {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

    const layers = [
        new ScatterplotLayer({
            id: 'intelligence-scatter',
            data: mockSpikes,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: 100000,
            radiusMinPixels: 5,
            radiusMaxPixels: 200,
            lineWidthMinPixels: 1,
            getPosition: (d: any) => [d.lng, d.lat],
            getFillColor: (d: any) => {
                if (d.score > 60) return [0, 255, 136, 180];
                if (d.score < 40) return [255, 51, 85, 180];
                return [255, 170, 0, 180];
            },
            getLineColor: (d: any) => [255, 255, 255, 100],
            getRadius: (d: any) => d.count / 10
        })
    ];

    return (
        <div className="w-full h-full relative overflow-hidden rounded-xl border border-obsidian-border bg-[#0a0a12]">
            <DeckGL
                layers={layers}
                initialViewState={viewState}
                onViewStateChange={({ viewState }) => setViewState(viewState as any)}
                controller={true}
                getTooltip={({ object }: any) => object && `${object.label}\nSentiment: ${object.score}\nSignals: ${object.count}`}
            >
                {/* Embedded Basemap */}
                <Map mapStyle={MAP_STYLE} reuseMaps />
            </DeckGL>

            {/* Tactical Overlay */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase font-mono mb-1">Tactical View (WebGL)</h3>
                <p className="text-[10px] text-emerald-500 uppercase font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Deck.gl Engine Online
                </p>
            </div>
        </div>
    );
};
