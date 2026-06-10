
import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { KnowledgeDocument, ChatMessage } from '../types';
import { aiService } from '../services/aiService';

interface ChatRoomProps {
    isOpen: boolean;
    onClose: () => void;
    knowledgeBase: KnowledgeDocument[];
    onUpload: (conn: any, file?: File) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

/**
 * ChatRoom Component
 * Provides a dedicated, premium interface for chatting with documents.
 * Integrates with the RAG engine for grounded responses.
 */
const ChatRoom: React.FC<ChatRoomProps> = ({ isOpen, onClose, knowledgeBase, onUpload, onDelete }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onresult = (e: any) => {
                const transcript = e.results[0][0].transcript;
                if (transcript) setInput(prev => prev + (prev ? ' ' : '') + transcript);
            };
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    /**
     * Toggles voice recognition
     */
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    /**
     * Handles sending a message in the document chat
     * Uses RAG engine to ground responses in uploaded documents.
     */
    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            role: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // 1. Prepare knowledge context
            const relevantDocs = knowledgeBase.map(doc => `[${doc.source}] ${doc.name}: ${doc.content}`).join('\n');

            // 2. Run RAG Grounding through AI Service
            const groundedResponse = await aiService.generateKnowledgeResponse(input, relevantDocs || "No documents found.");

            // 3. Orchestrate final professional response
            const finalResponse = await aiService.orchestrateFinalResponse(groundedResponse, 'approved');

            const assistantMsg: ChatMessage = {
                role: 'assistant',
                text: finalResponse,
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.error("Chat Room Error:", err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "System collision detected. Neural grounding interrupted.",
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onUpload({ name: file.name, type: 'Upload' }, file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-full max-h-[900px] rounded-[3rem] shadow-4xl overflow-hidden flex flex-col md:flex-row relative border border-white/20">

                {/* Sidebar - Document List */}
                <aside className="w-full md:w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Knowledge Base</h2>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Connected Intelligence</p>
                    </div>

                    <div className="flex-1 space-y-4">
                        {knowledgeBase.length === 0 ? (
                            <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-3xl">
                                <ICONS.FileText size={32} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-xs font-bold text-gray-400">No documents synced. Add sources to ground the AI.</p>
                            </div>
                        ) : (
                            knowledgeBase.map(doc => (
                                <div key={doc.id} className="group relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><ICONS.FileText size={18} /></div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-black text-gray-700 truncate">{doc.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{doc.source}</p>
                                        </div>
                                        <button
                                            onClick={() => onDelete(doc.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all rounded-lg"
                                        >
                                            <ICONS.Delete size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8">
                        <label className="w-full flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl font-black text-xs cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest">
                            <ICONS.Plus size={16} />
                            Attach Document
                            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
                        </label>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col relative bg-white">
                    {/* Header */}
                    <header className="px-10 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <ICONS.Agent2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase">Neural Chat Room</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grounded Mode Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                            <ICONS.Delete size={20} />
                        </button>
                    </header>

                    {/* Messages */}
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/30 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                                <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mb-8 shadow-inner">
                                    <ICONS.Zap size={32} />
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-4 tracking-tight uppercase">Intelligence Ready</h4>
                                <p className="text-gray-400 font-bold text-sm leading-relaxed">
                                    Welcome to the separate chat room. You can query your connected documents here with full neural grounding.
                                </p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-300`}>
                                <div className={`max-w-[75%] relative group ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                                    <div className={`p-6 rounded-[1.5rem] shadow-sm text-md leading-relaxed ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-md'
                                        }`}>
                                        {/* Multi-line support and special formatting */}
                                        <div className="whitespace-pre-wrap">
                                            {m.text.split('\n').map((line, idx) => (
                                                <p key={idx} className={line.trim() === '' ? 'h-2' : 'mb-2'}>
                                                    {line}
                                                </p>
                                            ))}
                                        </div>

                                        <div className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] opacity-50 ${m.role === 'user' ? 'text-white' : 'text-gray-400'}`}>
                                            {m.role === 'user' ? 'Operator' : 'AI Node'} • {m.timestamp}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in duration-300">
                                <div className="bg-white border border-gray-100 rounded-[1.5rem] rounded-tl-none p-6 shadow-md flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Grounding Intelligence...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <footer className="p-8 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask anything about your documents..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-gray-700 font-medium focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder:text-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`absolute right-5 top-5 p-1 transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-300 hover:text-indigo-600'}`}
                                >
                                    <ICONS.Mic size={22} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-indigo-600 text-white p-5 rounded-2xl hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-200 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center min-w-[70px]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                        </form>
                        <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mt-4">
                            Neural Privacy Shield Active • 256-Bit Encrypted Grounding
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default ChatRoom;
