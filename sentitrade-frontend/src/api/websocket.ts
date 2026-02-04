export class WebSocketManager {
    private ws: WebSocket | null = null;
    private url: string;
    private token: string;
    private listeners: Map<string, ((data: any) => void)[]> = new Map();
    private globalListeners: ((message: any) => void)[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor(url: string, token: string) {
        this.url = url;
        this.token = token;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`${this.url}?token=${this.token}`);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);

                    // Notify global listeners (for console)
                    this.globalListeners.forEach((listener) => listener(message));

                    // Notify type-specific listeners
                    const listeners = this.listeners.get(message.type) || [];
                    listeners.forEach((listener) => listener(message.data));
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.attemptReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            console.log(`Reconnecting in ${delay}ms...`);
            setTimeout(() => this.connect().catch(console.error), delay);
        }
    }

    on(eventType: string, callback: (data: any) => void) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(callback);
    }

    off(eventType: string, callback: (data: any) => void) {
        const listeners = this.listeners.get(eventType) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    // Listen to ALL messages (for Senti-Quant Console)
    onMessage(callback: (message: any) => void) {
        this.globalListeners.push(callback);
    }

    send(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

