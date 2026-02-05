/**
 * WebSocket Hook for Sovereign Data Pipeline
 * Connects to /ws for real-time price broadcasts
 * 
 * Supports both:
 * - Old API: on(event, handler), off(event, handler), lastMessage
 * - New API: lastTick, allTicks, connect, disconnect
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export interface PriceTick {
    asset: string;
    price: number;
    change_pc: number;
    type: 'NSE' | 'CRYPTO' | 'COMMODITY';
    currency: string;
    sentiment: number;
    timestamp: string;
    is_mock: boolean;
}

type EventHandler = (data: any) => void;

interface UseWebSocketReturn {
    connected: boolean;
    lastMessage: any;
    lastTick: PriceTick | null;
    allTicks: Record<string, PriceTick>;
    on: (event: string, handler: EventHandler) => void;
    off: (event: string, handler: EventHandler) => void;
    connect: () => void;
    disconnect: () => void;
}

// Global WebSocket instance (shared across hook instances)
let globalWs: WebSocket | null = null;
let globalConnected = false;
const eventHandlers: Record<string, Set<EventHandler>> = {};
const reconnectTimeoutId: { current: ReturnType<typeof setTimeout> | null } = { current: null };

function emit(event: string, data: any) {
    const handlers = eventHandlers[event];
    if (handlers) {
        handlers.forEach(handler => handler(data));
    }
}

function initGlobalWebSocket() {
    if (globalWs?.readyState === WebSocket.OPEN) return;
    if (globalWs?.readyState === WebSocket.CONNECTING) return;

    try {
        const token = localStorage.getItem('token');
        const url = token ? `${WS_URL}?token=${token}` : WS_URL;

        globalWs = new WebSocket(url);

        globalWs.onopen = () => {
            console.log('[WS] Connected to Sovereign Data Pipeline');
            globalConnected = true;
            emit('connect', {});
        };

        globalWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Emit different events based on data type
                if (data.type === 'sentiment') {
                    emit('sentiment:update', data);
                } else if (data.type === 'signal') {
                    emit('signal:update', data);
                } else if (data.type === 'divergence') {
                    emit('divergence:update', data);
                } else if (data.type === 'whale') {
                    emit('whales:update', data);
                } else {
                    // Default: price tick
                    emit('price:update', data);
                }
                emit('message', data);
            } catch (err) {
                console.warn('[WS] Failed to parse message:', event.data);
            }
        };

        globalWs.onclose = () => {
            console.log('[WS] Disconnected');
            globalConnected = false;
            emit('disconnect', {});

            // Auto-reconnect after 5 seconds
            reconnectTimeoutId.current = setTimeout(() => {
                console.log('[WS] Attempting reconnect...');
                initGlobalWebSocket();
            }, 5000);
        };

        globalWs.onerror = (error) => {
            console.error('[WS] Error:', error);
        };
    } catch (err) {
        console.error('[WS] Failed to connect:', err);
    }
}

export function useWebSocket(): UseWebSocketReturn {
    const [connected, setConnected] = useState(globalConnected);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [lastTick, setLastTick] = useState<PriceTick | null>(null);
    const [allTicks, setAllTicks] = useState<Record<string, PriceTick>>({});

    // Register event handler
    const on = useCallback((event: string, handler: EventHandler) => {
        if (!eventHandlers[event]) {
            eventHandlers[event] = new Set();
        }
        eventHandlers[event].add(handler);
    }, []);

    // Unregister event handler
    const off = useCallback((event: string, handler: EventHandler) => {
        if (eventHandlers[event]) {
            eventHandlers[event].delete(handler);
        }
    }, []);

    // Manual connect
    const connect = useCallback(() => {
        initGlobalWebSocket();
    }, []);

    // Manual disconnect
    const disconnect = useCallback(() => {
        if (reconnectTimeoutId.current) {
            clearTimeout(reconnectTimeoutId.current);
        }
        if (globalWs) {
            globalWs.close();
            globalWs = null;
        }
        globalConnected = false;
        setConnected(false);
    }, []);

    useEffect(() => {
        // Initialize connection
        initGlobalWebSocket();

        // Handle connection state changes
        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);

        // Handle messages for local state
        const handleMessage = (data: any) => {
            setLastMessage(data);
            if (data.asset) {
                setLastTick(data);
                setAllTicks(prev => ({
                    ...prev,
                    [data.asset]: data
                }));
            }
        };

        on('connect', handleConnect);
        on('disconnect', handleDisconnect);
        on('message', handleMessage);

        return () => {
            off('connect', handleConnect);
            off('disconnect', handleDisconnect);
            off('message', handleMessage);
        };
    }, [on, off]);

    return {
        connected,
        lastMessage,
        lastTick,
        allTicks,
        on,
        off,
        connect,
        disconnect,
    };
}

/**
 * Hook to get real-time price for a specific asset
 */
export function useLivePrice(asset: string): PriceTick | null {
    const { allTicks } = useWebSocket();
    return allTicks[asset] || null;
}
