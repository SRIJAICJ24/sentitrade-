import { useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketManager } from '../api/websocket';
import { useAuthStore } from '../store/authStore';

interface WebSocketMessage {
    type: string;
    data: any;
    timestamp?: string;
}

export const useWebSocket = () => {
    const [manager, setManager] = useState<WebSocketManager | null>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const { token } = useAuthStore();
    const messageHandlerRef = useRef<((data: any) => void) | null>(null);

    useEffect(() => {
        if (!token) return;

        const ws = new WebSocketManager(
            import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
            token
        );

        // Global message handler to capture all messages
        messageHandlerRef.current = (data: any) => {
            setLastMessage(data);
        };

        ws.connect()
            .then(() => {
                setManager(ws);
                // Listen to all message types
                ws.onMessage(messageHandlerRef.current!);
            })
            .catch(console.error);

        return () => {
            ws.disconnect();
        };
    }, [token]);

    const on = useCallback((eventType: string, callback: (data: any) => void) => {
        manager?.on(eventType, callback);
    }, [manager]);

    const off = useCallback((eventType: string, callback: (data: any) => void) => {
        manager?.off(eventType, callback);
    }, [manager]);

    const send = useCallback((message: any) => {
        manager?.send(message);
    }, [manager]);

    return { on, off, send, connected: !!manager, lastMessage };
};

