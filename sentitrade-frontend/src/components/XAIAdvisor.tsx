import React, { useState } from 'react';
import { Bot, X, Send, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const XAIAdvisor: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Mock chat history
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: "Hello, I'm your Senti-Quant Guardian. I'm monitoring the market for anomalies. How can I assist you?"
        }
    ]);

    const handleAudit = () => {
        setMessages(prev => [
            ...prev,
            { id: Date.now(), sender: 'user', text: "Audit my portfolio status." },
            {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Running Danger Audit... 🛡️\n\nYour exposure to HDFCBANK is high (40%). Sentiment has dropped to 35/100 due to institutional outflow signals. \n\nRecommendation: Reduce position size by 15% to hedge against potential downside."
            }
        ]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-96 bg-obsidian-card border border-neon/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-neon/10 border-b border-neon/20 p-4 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neon flex items-center justify-center shadow-[0_0_10px_#d6ff3f]">
                                    <Bot size={18} className="text-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">XAI Guardian</h3>
                                    <span className="flex items-center gap-1 text-[10px] text-neon">
                                        <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
                                        Online & Watching
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                                        ${msg.sender === 'user'
                                            ? 'bg-slate-800 text-white rounded-tr-sm'
                                            : 'bg-neon/10 border border-neon/20 text-slate-200 rounded-tl-sm'}
                                    `}>
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="p-2 bg-black border-t border-obsidian-border flex gap-2 overflow-x-auto">
                            <button
                                onClick={handleAudit}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-alert/10 text-alert border border-alert/30 rounded-full text-xs font-bold hover:bg-alert hover:text-white transition-all whitespace-nowrap"
                            >
                                <Shield size={12} />
                                Audit Portfolio
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap">
                                <Sparkles size={12} />
                                Predict Trend
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-obsidian-card border-t border-obsidian-border flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask XAI..."
                                className="flex-1 bg-black border border-obsidian-border rounded-lg px-3 py-2 text-sm text-white focus:border-neon focus:outline-none placeholder:text-slate-600"
                            />
                            <button className="p-2 bg-neon text-black rounded-lg hover:bg-neon-dim transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all bg-neon text-black
                    ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
                `}
                style={{ position: isOpen ? 'absolute' : 'relative' }} // Hack to hide button when open if desired, or just toggle icon
            >
                <Bot size={28} />
                {/* Ping animation ring */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-neon opacity-20 animate-ping"></span>
            </motion.button>
        </div>
    );
};
