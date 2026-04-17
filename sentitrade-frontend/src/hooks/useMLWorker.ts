import { useEffect, useRef, useState, useCallback } from 'react';

export interface MLAnalysisResult {
    embedding: number[];
    entities: string[];
    originalText: string;
}

export function useMLWorker() {
    const workerRef = useRef<Worker | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [progress, setProgress] = useState<any>(null);

    // Promise resolver map
    const resolversRef = useRef<{ [key: string]: { resolve: (val: any) => void, reject: (err: any) => void } }>({});

    useEffect(() => {
        // Initialize the Web Worker using Vite standard syntax
        if (!workerRef.current) {
            workerRef.current = new Worker(new URL('../workers/ml.worker.ts', import.meta.url), {
                type: 'module'
            });

            workerRef.current.addEventListener('message', (event) => {
                const { type, id, result, error, data } = event.data;

                if (type === 'progress') {
                    setProgress(data);
                    if (data.status === 'ready') setIsReady(true);
                } else if (type === 'result') {
                    if (resolversRef.current[id]) {
                        resolversRef.current[id].resolve(result);
                        delete resolversRef.current[id];
                    }
                } else if (type === 'error') {
                    if (resolversRef.current[id]) {
                        resolversRef.current[id].reject(new Error(error));
                        delete resolversRef.current[id];
                    }
                }
            });
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const analyzeText = useCallback((text: string): Promise<MLAnalysisResult> => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current) {
                return reject(new Error("Worker not initialized"));
            }
            const id = Math.random().toString(36).substring(7);
            resolversRef.current[id] = { resolve, reject };
            
            workerRef.current.postMessage({
                type: 'analyze',
                id,
                text
            });
        });
    }, []);

    return {
        isReady,
        progress,
        analyzeText
    };
}
