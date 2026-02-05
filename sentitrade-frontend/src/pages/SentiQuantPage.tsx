import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { SentiQuantConsole } from '../components/SentiQuantConsole';
import { PatternRadar } from '../components/dashboard/PatternRadar';
import { XAIAdvisor } from '../components/XAIAdvisor';
import { apiClient } from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

interface ThoughtEntry {
    timestamp: string;
    thought: string;
    level: 'info' | 'success' | 'warning' | 'error';
    asset?: string;
}

export default function SentiQuantPage() {
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { lastMessage } = useWebSocket();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // WebSocket Listener for Background Thoughts
    useEffect(() => {
        if (lastMessage?.type === 'ai_thought') {
            const newThought = lastMessage.data as ThoughtEntry;
            setThoughts(prev => [...prev.slice(-49), newThought]);
        }
    }, [lastMessage]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMsg: ChatMessage = { id: Date.now(), role: 'user', content: input };
        setChatHistory(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        // Add initial "Thinking" log
        setThoughts(prev => [...prev, {
            timestamp: new Date().toISOString(),
            thought: `Processing Query: "${userMsg.content}"`,
            level: 'info'
        }]);

        try {
            const res = await apiClient.post('/xai/chat', {
                message: userMsg.content,
                portfolio_context: {} // TODO: Inject real context
            });

            const { reply, thought_chain } = res.data;

            // 1. Inject Thoughts one by one for effect (optional, or bulk add)
            if (thought_chain) {
                // We add them all, but in a real app we might stream them.
                // Converting backend ThoughtStep to Frontend ThoughtEntry
                const newThoughts: ThoughtEntry[] = thought_chain.map((t: any) => ({
                    timestamp: t.timestamp,
                    thought: t.thought,
                    level: t.level
                }));
                setThoughts(prev => [...prev, ...newThoughts].slice(-50));
            }

            // 2. Add Bot Reply
            const botMsg: ChatMessage = { id: Date.now() + 1, role: 'assistant', content: reply };
            setChatHistory(prev => [...prev, botMsg]);

        } catch (err) {
            console.error(err);
            setThoughts(prev => [...prev, {
                timestamp: new Date().toISOString(),
                thought: `ERROR: Failed to connect to Reasoning Engine.`,
                level: 'error'
            }]);
            setChatHistory(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: "I'm having trouble connecting to my neural core. Please try again."
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="text-neon">⚡</span> Senti-Quant Terminal
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Interact directly with the Llama-3 Reasoning Engine.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                    {/* Left: Active Chat / Thread (8 Cols) */}
                    <div className="lg:col-span-8 bg-obsidian-card border border-obsidian-border rounded-xl p-6 relative flex flex-col">

                        {/* Chat History Area */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                            {chatHistory.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                                    <div className="text-center">
                                        <p className="mb-2">Secure Channel Established</p>
                                        <p className="text-xs">Try asking: "Audit my portfolio" or "Find buy signals"</p>
                                    </div>
                                </div>
                            ) : (
                                chatHistory.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-slate-800 text-white rounded-tr-sm'
                                                : 'bg-neon/10 border border-neon/20 text-slate-200 rounded-tl-sm'
                                            }`}>
                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isProcessing && (
                                <div className="flex justify-start">
                                    <div className="bg-neon/5 border border-neon/10 p-3 rounded-xl rounded-tl-sm flex items-center gap-2">
                                        <div className="w-2 h-2 bg-neon rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-neon rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-neon rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="mt-auto flex gap-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Senti-Quant..."
                                disabled={isProcessing}
                                className="flex-1 bg-black border border-obsidian-border rounded-lg px-4 py-3 text-white focus:border-neon focus:outline-none disabled:opacity-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isProcessing}
                                className="px-6 bg-neon text-black font-bold rounded-lg hover:bg-neon-dim transition disabled:opacity-50"
                            >
                                SEND
                            </button>
                        </div>
                    </div>

                    {/* Right: Live Thoughts & Radar (4 Cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                        <div className="h-1/2">
                            <SentiQuantConsole thoughts={thoughts} />
                        </div>
                        <div className="h-1/2">
                            <PatternRadar />
                        </div>
                    </div>
                </div>
            </div>
            <XAIAdvisor />
        </Layout>
    );
}
