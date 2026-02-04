import React, { useEffect, useRef, useMemo } from 'react';
import {
    createChart,
    ColorType,
    CandlestickSeries,
    HistogramSeries,
    AreaSeries,
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

interface DivergenceMarker {
    time: number;
    type: 'bullish' | 'bearish';
    price: number;
}

interface PriceChartProps {
    data: ChartData[];
    loading?: boolean;
    showSentimentOverlay?: boolean;
    divergenceThreshold?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
    data,
    loading = false,
    showSentimentOverlay = true,
    divergenceThreshold = 5
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    const sentimentSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);

    // Detect divergences between price and sentiment
    const divergences = useMemo(() => {
        if (data.length < 3) return [];

        const markers: DivergenceMarker[] = [];

        for (let i = 2; i < data.length; i++) {
            const prev = data[i - 1];
            const curr = data[i];

            const priceChange = ((curr.close - prev.close) / prev.close) * 100;
            const sentimentChange = curr.sentiment_score - prev.sentiment_score;

            // Bullish divergence: Price down, sentiment up
            if (priceChange < -2 && sentimentChange > divergenceThreshold) {
                markers.push({
                    time: new Date(curr.time).getTime() / 1000,
                    type: 'bullish',
                    price: curr.low
                });
            }
            // Bearish divergence: Price up, sentiment down
            else if (priceChange > 2 && sentimentChange < -divergenceThreshold) {
                markers.push({
                    time: new Date(curr.time).getTime() / 1000,
                    type: 'bearish',
                    price: curr.high
                });
            }
        }

        return markers;
    }, [data, divergenceThreshold]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create chart with dark theme
        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0F172A' },
                textColor: '#94A3B8',
            },
            width: containerRef.current.clientWidth,
            height: 420,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#334155',
            },
            rightPriceScale: {
                borderColor: '#334155',
            },
            grid: {
                vertLines: { color: '#1E293B' },
                horzLines: { color: '#1E293B' },
            },
            crosshair: {
                mode: 1, // Normal mode
                vertLine: {
                    color: '#475569',
                    labelBackgroundColor: '#1E293B',
                },
                horzLine: {
                    color: '#475569',
                    labelBackgroundColor: '#1E293B',
                },
            },
        });

        // Add candlestick series
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10B981',
            downColor: '#EF4444',
            borderVisible: false,
            wickUpColor: '#10B981',
            wickDownColor: '#EF4444',
        });

        // Add volume series
        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
        });

        // Configure volume scale
        chart.priceScale('volume').applyOptions({
            scaleMargins: {
                top: 0.85,
                bottom: 0,
            },
        });

        // Add sentiment area overlay
        const sentimentSeries = chart.addSeries(AreaSeries, {
            lineColor: '#06B6D4',
            topColor: 'rgba(6, 182, 212, 0.4)',
            bottomColor: 'rgba(6, 182, 212, 0.0)',
            lineWidth: 2,
            priceScaleId: 'sentiment',
            lastValueVisible: true,
            priceLineVisible: false,
        });

        // Configure sentiment scale (right side, separate)
        chart.priceScale('sentiment').applyOptions({
            scaleMargins: {
                top: 0.1,
                bottom: 0.4,
            },
            visible: true,
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;
        sentimentSeriesRef.current = sentimentSeries;

        // Handle window resize
        const handleResize = () => {
            if (containerRef.current) {
                chart.applyOptions({
                    width: containerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Update chart data when data changes
    useEffect(() => {
        if (!data.length || !candleSeriesRef.current) return;

        // Sort data by time
        const sortedData = [...data].sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        // Format candlestick data
        const candleData = sortedData.map(d => ({
            time: new Date(d.time).getTime() / 1000 as any,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

        // Format volume data with colors based on candle direction
        const volumeData = sortedData.map(d => ({
            time: new Date(d.time).getTime() / 1000 as any,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        }));

        // Format sentiment data for area series
        const sentimentData = sortedData.map(d => ({
            time: new Date(d.time).getTime() / 1000 as any,
            value: d.sentiment_score,
        }));

        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current?.setData(volumeData);

        if (showSentimentOverlay && sentimentSeriesRef.current) {
            sentimentSeriesRef.current.setData(sentimentData);
        }

        // Add divergence markers
        // Add divergence markers (Note: setMarkers requires SeriesMarker type)
        // Markers are shown in the chart legend instead for this version
        if (divergences.length > 0) {
            console.log(`[Chart] ${divergences.length} divergences detected`);
        }

        chartRef.current?.timeScale().fitContent();

    }, [data, showSentimentOverlay, divergences]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[420px] bg-slate-900 rounded-xl border border-slate-700">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
                    <span className="text-slate-400 text-sm">Loading chart data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
            {/* Chart Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">BTC/USD</span>
                    <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded">LIVE</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-cyan-400 rounded"></span>
                        <span className="text-slate-400">Sentiment</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-slate-400">Bullish Div</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-slate-400">Bearish Div</span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div ref={containerRef} className="w-full" />

            {/* Divergence Stats */}
            {divergences.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-4 text-xs">
                    <span className="text-slate-500">
                        {divergences.filter(d => d.type === 'bullish').length} bullish divergence(s)
                    </span>
                    <span className="text-slate-500">
                        {divergences.filter(d => d.type === 'bearish').length} bearish divergence(s)
                    </span>
                </div>
            )}
        </div>
    );
};
