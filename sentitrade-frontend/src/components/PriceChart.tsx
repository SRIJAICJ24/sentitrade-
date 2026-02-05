import React, { useEffect, useRef } from 'react';
import {
    createChart,
    ColorType,
    CandlestickSeries,
    HistogramSeries,
    LineSeries,
} from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    sentiment_score: number;
}

interface PriceChartProps {
    data: ChartData[];
    loading?: boolean;
    showSentimentOverlay?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
    data,
    loading = false,
    showSentimentOverlay = true,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    const sentimentSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create chart with Obsidian theme
        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
                fontFamily: 'Inter, sans-serif',
            },
            width: containerRef.current.clientWidth,
            height: 420,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#292929',
            },
            rightPriceScale: {
                borderColor: '#292929',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2, // Leave room for volume
                },
            },
            grid: {
                vertLines: { color: '#171717' },
                horzLines: { color: '#0F0F0F' }, // Almost invisible
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#d6ff3f',
                    width: 1,
                    style: 3, // Dashed
                    labelBackgroundColor: '#d6ff3f',
                },
                horzLine: {
                    color: '#d6ff3f',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#d6ff3f',
                },
            },
        });

        // Candlestick Series (Neon Green / Red)
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#d6ff3f',        // Neon Lime
            downColor: '#ff4d4d',      // Alert Red
            borderVisible: false,
            wickUpColor: '#d6ff3f',
            wickDownColor: '#ff4d4d',
        });

        // Volume Series (Subtle)
        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume', // Separate scale
        });

        chart.priceScale('volume').applyOptions({
            scaleMargins: {
                top: 0.85, // Push to bottom
                bottom: 0,
            },
        });

        // Sentiment Overlay (Dashed Line)
        const sentimentSeries = chart.addSeries(LineSeries, {
            color: '#b3d929', // Dim Neon
            lineWidth: 2,
            lineStyle: 2, // Dashed
            crosshairMarkerVisible: false,
            priceScaleId: 'sentiment',
        });

        chart.priceScale('sentiment').applyOptions({
            scaleMargins: {
                top: 0.1,
                bottom: 0.8, // Push to top
            },
            visible: false, // Hide scale axis numbers to avoid clutter
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;
        sentimentSeriesRef.current = sentimentSeries;

        const handleResize = () => {
            if (containerRef.current) {
                chart.applyOptions({ width: containerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Data Update Effect
    useEffect(() => {
        if (!data.length || !candleSeriesRef.current || !volumeSeriesRef.current || !sentimentSeriesRef.current || !chartRef.current) return;

        const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        const candleData = sortedData.map(d => ({
            time: new Date(d.time).getTime() / 1000 as any,
            open: d.open, high: d.high, low: d.low, close: d.close,
        }));

        const volumeData = sortedData.map(d => ({
            time: new Date(d.time).getTime() / 1000 as any,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(214, 255, 63, 0.2)' : 'rgba(255, 77, 77, 0.2)',
        }));

        const sentimentData = sortedData.map(d => ({
            time: new Date(d.time).getTime() / 1000 as any,
            value: d.sentiment_score,
        }));

        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        if (showSentimentOverlay) {
            sentimentSeriesRef.current.setData(sentimentData);
        }

        // Add Markers for Divergence
        const markers: any[] = [];
        for (let i = 10; i < sortedData.length; i++) {
            // Simple mock logic for markers to demonstrate the UI
            if (sortedData[i].sentiment_score > 80 && sortedData[i].close < sortedData[i - 5].close) {
                markers.push({
                    time: new Date(sortedData[i].time).getTime() / 1000 as any,
                    position: 'belowBar',
                    color: '#d6ff3f',
                    shape: 'arrowUp',
                    text: 'DIV',
                    size: 2
                });
            }
        }
        // @ts-ignore
        // candleSeriesRef.current.setMarkers(markers);

        chartRef.current.timeScale().fitContent();

    }, [data, showSentimentOverlay]);

    return (
        <div className="relative w-full h-[450px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-obsidian/50 z-10 backdrop-blur-sm">
                    <div className="animate-spin-slow w-12 h-12 border-4 border-neon border-t-transparent rounded-full shadow-[0_0_15px_#d6ff3f]"></div>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full" />

            {/* Legend Overlay */}
            <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded backdrop-blur border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-neon"></span>
                    <span className="text-[10px] text-slate-300 font-mono">PRICE</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded backdrop-blur border border-white/5">
                    <span className="w-4 border-t-2 border-dashed border-neon/50"></span>
                    <span className="text-[10px] text-slate-300 font-mono">SENTIMENT</span>
                </div>
            </div>
        </div>
    );
};
