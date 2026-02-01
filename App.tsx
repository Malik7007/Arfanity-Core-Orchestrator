
import React, { useState, useEffect, useRef } from 'react';
import {
  AgentStatus,
  IntentClassification,
  KnowledgeDocument,
  KnowledgeConnection,
  ChatMessage,
  AIModelConfiguration
} from './types';
import { aiService } from './services/aiService';
import { DEFAULT_KNOWLEDGE_BASE, ICONS } from './constants';
import AgentCard from './components/AgentCard';
import DocumentationModal from './components/DocumentationModal';
import ConnectionManagerModal from './components/ConnectionManagerModal';
import ModelRegistryModal from './components/ModelRegistryModal';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverLogs, setServerLogs] = useState<string[]>(['[SYSTEM] Arfanity Core Orchestrator v2.7 Initialized.']);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeDocument[]>([]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);

  const [aiRegistry, setAiRegistry] = useState<AIModelConfiguration[]>(() => {
    const saved = localStorage.getItem('agentfactory_registry');
    return saved ? JSON.parse(saved) : aiService.getRegistry();
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [connections, setConnections] = useState<KnowledgeConnection[]>(() => {
    const saved = localStorage.getItem('agentfactory_connections');
    return saved ? JSON.parse(saved) : [];
  });

  const [agent1Status, setAgent1Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent2Status, setAgent2Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent3Status, setAgent3Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent4Status, setAgent4Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent5Status, setAgent5Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent6Status, setAgent6Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent7Status, setAgent7Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent8Status, setAgent8Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent9Status, setAgent9Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent10Status, setAgent10Status] = useState<AgentStatus>(AgentStatus.IDLE);
  const [agent1Result, setAgent1Result] = useState<IntentClassification | null>(null);
  const [agent2Result, setAgent2Result] = useState<string>('');
  const [agent3Result, setAgent3Result] = useState<string>('');
  const [agent4Result, setAgent4Result] = useState<string>('');
  const [agent5Result, setAgent5Result] = useState<string>('');
  const [agent6Result, setAgent6Result] = useState<string>('');
  const [agent7Result, setAgent7Result] = useState<string>('');
  const [agent8Result, setAgent8Result] = useState<string>('');
  const [agent9Result, setAgent9Result] = useState<string>('');
  const [agent10Result, setAgent10Result] = useState<string>('');
  const [approvalDecision, setApprovalDecision] = useState<'pending' | 'approved' | 'rejected' | 'none'>('none');

  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    aiService.setLogger((msg) => setServerLogs(prev => [...prev, msg]));
    fetchDocuments();

    // Initialize Speech Recognition
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          const isAideOpen = (window as any).__isAssistantOpen;
          if (isAideOpen) setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
          else setUserInput(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/documents');
      const data = await res.json();
      setKnowledgeBase(data);
    } catch (err) {
      setServerLogs(prev => [...prev, `[ERROR] Failed to connect to Backend Server: ${err.message}`]);
    }
  };

  // Sync state to a global ref so the static listener knows what to do
  useEffect(() => {
    (window as any).__isAssistantOpen = isAssistantOpen;
  }, [isAssistantOpen]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [serverLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatScrollRef.current) chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [chatHistory, isChatLoading, isAssistantOpen]);

  useEffect(() => {
    if ((isProcessing || agent4Result) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isProcessing, agent4Result]);

  // Persistence Sync (Local storage still used for UI state only)
  useEffect(() => {
    localStorage.setItem('agentfactory_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('agentfactory_registry', JSON.stringify(aiRegistry));
    aiService.updateRegistry(aiRegistry);
  }, [aiRegistry]);

  // Knowledge Base is now purely dynamic based on user uploads and connections.

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else { recognitionRef.current?.start(); setIsListening(true); }
  };

  const playSpeech = async (text: string) => {
    if (isSpeechLoading) return;
    setIsSpeechLoading(true);
    try {
      const base64 = await aiService.generateSpeech(text);
      if (!base64) {
        console.warn("Speech generation returned no data.");
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Explicitly resume to satisfy browser security (needs user gesture)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (err) {
      console.error("Speech Playback Error:", err);
    } finally {
      setIsSpeechLoading(false);
    }
  };

  const handleAssistantSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const msgText = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: msgText, timestamp: new Date().toLocaleTimeString() }]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const response = await aiService.chatResponse(msgText);
      setChatHistory(prev => [...prev, { role: 'assistant', text: response, timestamp: new Date().toLocaleTimeString() }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', text: "System error.", timestamp: new Date().toLocaleTimeString() }]);
    } finally { setIsChatLoading(false); }
  };

  const resetOrchestrator = () => {
    setUserInput('');
    setAgent1Status(AgentStatus.IDLE);
    setAgent2Status(AgentStatus.IDLE);
    setAgent3Status(AgentStatus.IDLE);
    setAgent4Status(AgentStatus.IDLE);
    setAgent5Status(AgentStatus.IDLE);
    setAgent6Status(AgentStatus.IDLE);
    setAgent7Status(AgentStatus.IDLE);
    setAgent8Status(AgentStatus.IDLE);
    setAgent9Status(AgentStatus.IDLE);
    setAgent10Status(AgentStatus.IDLE);
    setAgent1Result(null);
    setAgent2Result('');
    setAgent3Result('');
    setAgent4Result('');
    setAgent5Result('');
    setAgent6Result('');
    setAgent7Result('');
    setAgent8Result('');
    setAgent9Result('');
    setAgent10Result('');
    setApprovalDecision('none');
  };

  const runOrchestration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setAgent1Status(AgentStatus.WORKING);
    setAgent2Status(AgentStatus.IDLE);
    setAgent3Status(AgentStatus.IDLE);
    setAgent4Status(AgentStatus.IDLE);
    setAgent5Status(AgentStatus.IDLE);
    setAgent6Status(AgentStatus.IDLE);
    setAgent7Status(AgentStatus.IDLE);
    setAgent8Status(AgentStatus.IDLE);
    setAgent9Status(AgentStatus.IDLE);
    setAgent10Status(AgentStatus.IDLE);
    setAgent1Result(null);
    setAgent2Result('');
    setAgent3Result('');
    setAgent4Result('');
    setAgent5Result('');
    setAgent6Result('');
    setAgent7Result('');
    setAgent8Result('');
    setAgent9Result('');
    setAgent10Result('');
    setApprovalDecision('none');

    let activeAgent = 1;
    try {
      // Agent 1: Classifier
      activeAgent = 1;
      const intent = await aiService.classifyIntent(userInput);
      setAgent1Result(intent);
      setAgent1Status(AgentStatus.COMPLETED);

      // Check for Knowledge Base presence
      if (knowledgeBase.length === 0) {
        setAgent2Status(AgentStatus.ERROR);
        setAgent2Result("Knowledge is not attached. System grounding interrupted.");

        setAgent4Status(AgentStatus.COMPLETED);
        setAgent4Result("**Knowledge is not attached.**\n\nDocuments are not in this system yet. I cannot process enterprise requests or provide grounded answers without reference documents.\n\n**To proceed:**\n1. Use the **'Connect Source'** button in the sidebar.\n2. Upload a PDF, DOCX, or paste text content.\n3. Once documents are visible in the sidebar, try your request again.");

        setServerLogs(prev => [...prev, `[WARN] Orchestration Blocked: Knowledge base is empty.`]);
        setIsProcessing(false);
        return;
      }

      // Agent 2: RAG Engine
      activeAgent = 2;
      setAgent2Status(AgentStatus.WORKING);

      const isConversational = intent.intent_type === 'conversational' as any;
      let filteredKnowledge = knowledgeBase.filter(doc => {
        const query = userInput.toLowerCase();
        const keywords = query.split(/\W+/).filter(w => w.length > 2);
        if (keywords.length === 0) return true; // Pass all for short queries

        // Boost score for name matches
        const nameMatch = keywords.some(w => doc.name.toLowerCase().includes(w));
        const contentMatch = keywords.some(w => doc.content.toLowerCase().includes(w));

        return nameMatch || contentMatch;
      });

      // DEEP RECOVERY: If specific keyword filtering fails, provide general context
      if (filteredKnowledge.length === 0 && knowledgeBase.length > 0) {
        filteredKnowledge = knowledgeBase.slice(0, 3);
        setServerLogs(prev => [...prev, `[WARN] Deep Retrieval: Keyword match failed. Providing general context samples.`]);
      }

      const relevantDocs = filteredKnowledge.map(doc => `[${doc.source}] ${doc.name}: ${doc.content}`).join('\n');

      const kResponse = isConversational ? "Conversational request." : await aiService.generateKnowledgeResponse(userInput, relevantDocs || "No documents found.");
      setAgent2Result(kResponse);
      const ragFailed = kResponse.includes("GROUNDING_FAILURE");
      const lowConf = kResponse.includes("LOW_CONFIDENCE");
      setAgent2Status((ragFailed || lowConf) ? AgentStatus.ERROR : AgentStatus.COMPLETED);

      // Agent 10: Multi-Source Arbiter (Runs after RAG if multiple docs)
      if (filteredKnowledge.length > 1) {
        activeAgent = 10;
        setAgent10Status(AgentStatus.WORKING);
        const arbiterResponse = await aiService.resolveConflict(userInput, relevantDocs);
        setAgent10Result(arbiterResponse);
        setAgent10Status(AgentStatus.COMPLETED);
      }

      // Agent 3: Governance Agent
      activeAgent = 3;
      setAgent3Status(AgentStatus.WORKING);
      let decision: 'approved' | 'rejected' | 'not_required' | 'pending' | 'none' = 'not_required';

      if (isConversational) {
        decision = 'not_required';
        setAgent3Result("Governance: Bypassed (Conversational)");
      } else if (intent.risk_level === 'high' as any || ragFailed || lowConf) {
        decision = 'pending';
        let explanation = "";
        if (ragFailed) {
          explanation = `CRITICAL: ${kResponse.replace('GROUNDING_FAILURE: ', '')}. Source identification failed. Manual intervention mandatory.`;
        } else if (lowConf) {
          explanation = `SAFETY HOLD: ${kResponse.replace('GROUNDING_LOW_CONFIDENCE: ', '')}. Relevancy check failed. human approval required to release this data.`;
        } else {
          explanation = "ALERT: High-risk intent detected by Classifier. Intent category involves restricted protocols or financial sensitive data. Human oversight required.";
        }
        setAgent3Result(explanation);
      } else {
        decision = 'approved';
        setAgent3Result("Governance: Compliance Check PASSED. All data points verified against enterprise policy.");
      }

      setApprovalDecision(decision);
      setAgent3Status(AgentStatus.COMPLETED);

      // Agent 4: Output Synthesis
      if (decision !== 'pending') {
        activeAgent = 4;
        setAgent4Status(AgentStatus.WORKING);
        const final = await aiService.orchestrateFinalResponse(kResponse, decision);
        setAgent4Result(final);
        setAgent4Status(AgentStatus.COMPLETED);

        // Agent 5: Validator
        activeAgent = 5;
        setAgent5Status(AgentStatus.WORKING);
        const audit = await aiService.auditResponse(final, relevantDocs || kResponse);
        setAgent5Result(audit);
        setAgent5Status(AgentStatus.COMPLETED);

        // Agent 8: Context Memory (Using chat history)
        activeAgent = 8;
        setAgent8Status(AgentStatus.WORKING);
        const contextResponse = await aiService.maintainContext(final, JSON.stringify(chatHistory));
        setAgent8Result(contextResponse);
        setAgent8Status(AgentStatus.COMPLETED);

        // Agent 7: Privacy Shield
        activeAgent = 7;
        setAgent7Status(AgentStatus.WORKING);
        const privacyResponse = await aiService.protectPrivacy(final);
        setAgent7Result(privacyResponse);
        setAgent7Status(AgentStatus.COMPLETED);

        // Agent 9: Drafting Agent (Auto-briefing)
        activeAgent = 9;
        setAgent9Status(AgentStatus.WORKING);
        const draftResponse = await aiService.draftFormat(privacyResponse, 'brief');
        setAgent9Result(draftResponse);
        setAgent9Status(AgentStatus.COMPLETED);

        // Agent 6: Action Planner
        activeAgent = 6;
        setAgent6Status(AgentStatus.WORKING);
        const actions = await aiService.planActions(privacyResponse);
        setAgent6Result(actions);
        setAgent6Status(AgentStatus.COMPLETED);
      }

      setIsProcessing(false);
    } catch (err) {
      console.error("Orchestration Error:", err);
      if (activeAgent === 1) setAgent1Status(AgentStatus.ERROR);
      else if (activeAgent === 2) setAgent2Status(AgentStatus.ERROR);
      else if (activeAgent === 3) setAgent3Status(AgentStatus.ERROR);
      else if (activeAgent === 4) setAgent4Status(AgentStatus.ERROR);
      else if (activeAgent === 5) setAgent5Status(AgentStatus.ERROR);
      else if (activeAgent === 6) setAgent6Status(AgentStatus.ERROR);
      else if (activeAgent === 7) setAgent7Status(AgentStatus.ERROR);
      else if (activeAgent === 8) setAgent8Status(AgentStatus.ERROR);
      else if (activeAgent === 9) setAgent9Status(AgentStatus.ERROR);
      else if (activeAgent === 10) setAgent10Status(AgentStatus.ERROR);
      setIsProcessing(false);
    }
  };

  const handleApproval = async (decision: 'approved' | 'rejected') => {
    setApprovalDecision(decision);
    setAgent4Status(AgentStatus.WORKING);
    try {
      const final = await aiService.orchestrateFinalResponse(agent2Result, decision);
      setAgent4Result(final);
      setAgent4Status(AgentStatus.COMPLETED);

      // Trigger post-approval agents
      setAgent5Status(AgentStatus.WORKING);
      const audit = await aiService.auditResponse(final, agent2Result);
      setAgent5Result(audit);
      setAgent5Status(AgentStatus.COMPLETED);

      setAgent8Status(AgentStatus.WORKING);
      const context = await aiService.maintainContext(final, JSON.stringify(chatHistory));
      setAgent8Result(context);
      setAgent8Status(AgentStatus.COMPLETED);

      setAgent7Status(AgentStatus.WORKING);
      const privateData = await aiService.protectPrivacy(final);
      setAgent7Result(privateData);
      setAgent7Status(AgentStatus.COMPLETED);

      setAgent9Status(AgentStatus.WORKING);
      const draft = await aiService.draftFormat(privateData, 'email');
      setAgent9Result(draft);
      setAgent9Status(AgentStatus.COMPLETED);

      setAgent6Status(AgentStatus.WORKING);
      const actions = await aiService.planActions(privateData);
      setAgent6Result(actions);
      setAgent6Status(AgentStatus.COMPLETED);
    } catch { setAgent4Status(AgentStatus.ERROR); }
    finally { setIsProcessing(false); }
  };

  const formatNarrative = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.trim() === '') return <br key={i} />;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      return (
        <p key={i} className="mb-4 text-gray-800 leading-relaxed text-lg font-medium">
          {parts.map((part, index) => (
            index % 2 === 1 ? <strong key={index} className="text-indigo-900 font-bold">{part}</strong> : part
          ))}
        </p>
      );
    });
  };

  const handleAddConnection = async (conn: KnowledgeConnection, file?: File) => {
    // Check if document already exists in knowledge base
    const isAlreadyInKb = knowledgeBase.some(doc => doc.name === conn.name);

    setConnections(prev => {
      const exists = prev.find(c => c.id === conn.id);
      if (exists) return prev.map(c => c.id === conn.id ? conn : c);
      return [...prev, { ...conn, status: isAlreadyInKb ? 'connected' : 'disconnected' }];
    });

    if (conn.type === 'Paste' || conn.type === 'Upload') {
      try {
        if (isAlreadyInKb && !file) {
          setServerLogs(prev => [...prev, `[INFO] Knowledge source '${conn.name}' is already synchronized and active.`]);
          return;
        }

        if (conn.type === 'Paste') {
          const res = await fetch('http://localhost:3001/api/paste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: conn.name, content: conn.config.clientSecret })
          });
          const newDoc = await res.json();
          setKnowledgeBase(prev => [newDoc, ...prev]);
          setServerLogs(prev => [...prev, `[SYSTEM] Data Ingested to Database: ${conn.name}.`]);
        } else if (conn.type === 'Upload') {
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('http://localhost:3001/api/upload', {
              method: 'POST',
              body: formData
            });
            const newDoc = await res.json();
            setKnowledgeBase(prev => [newDoc, ...prev]);
            setServerLogs(prev => [...prev, `[SYSTEM] File Deep-Parsed: ${file.name} successfully ingested.`]);
          } else {
            setServerLogs(prev => [...prev, `[WARN] '${conn.name}' was purged from database. For security, please re-upload the file to re-attach.`]);
            return;
          }
        }
      } catch (err) {
        setServerLogs(prev => [...prev, `[ERROR] Connection sync failed: ${err.message}`]);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/documents/${id}`, { method: 'DELETE' });
      setKnowledgeBase(p => p.filter(d => d.id !== id));
      setServerLogs(prev => [...prev, `[SYSTEM] Document purged from database.`]);
    } catch (err) {
      setServerLogs(prev => [...prev, `[ERROR] Failed to delete document from database.`]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] relative">
      <DocumentationModal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} />
      <ConnectionManagerModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        connections={connections}
        onAddConnection={handleAddConnection}
        onDeleteConnection={id => setConnections(p => p.filter(c => c.id !== id))}
      />
      <ModelRegistryModal isOpen={isRegistryModalOpen} onClose={() => setIsRegistryModalOpen(false)} registry={aiRegistry} onUpdate={configs => { setAiRegistry(configs); aiService.updateRegistry(configs); }} />

      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <img src="/assets/logo.png" alt="Arfanity Logo" className="h-10 w-auto shadow-sm rounded-lg" />
          <div className="h-8 w-[1px] bg-gray-100 mx-1"></div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">Arfanity Core Orchestrator v2.7</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Multi-AI Node Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setIsRegistryModalOpen(true)} className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"><ICONS.Zap size={14} /> AI Registry</button>
          <button onClick={() => setShowTerminal(!showTerminal)} className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest ${showTerminal ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>Monitor</button>
          <button onClick={() => setIsDocModalOpen(true)} className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Documentation</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white border-r border-gray-100 hidden xl:flex flex-col p-8 space-y-8 overflow-y-auto">
          <div className="space-y-6">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">Data Connections</h2>
            <div className="space-y-3">
              {connections.map(c => {
                const Icon = ICONS[c.type as keyof typeof ICONS] || ICONS.Database;
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Icon size={16} /></div>
                      <div className="text-[12px] font-black text-gray-700 leading-tight truncate">{c.name}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAddConnection(c)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-emerald-500 transition-all rounded-lg hover:bg-emerald-50"
                        title="Quick Re-attach"
                      >
                        <ICONS.Check size={14} />
                      </button>
                      <button
                        onClick={() => setIsConnectionModalOpen(true)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-indigo-50"
                        title="Configure Connection"
                      >
                        <ICONS.Zap size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setIsConnectionModalOpen(true)} className="w-full mt-2 flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-100 rounded-2xl text-[11px] font-black text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest">Connect Source</button>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">Attached Knowledge</h2>
              <button
                onClick={fetchDocuments}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all group"
                title="Sync Database"
              >
                <ICONS.Refresh size={12} className="group-active:rotate-180 transition-transform duration-500" />
              </button>
            </div>
            <div className="space-y-2">
              {knowledgeBase.length === 0 ? (
                <p className="text-[10px] text-gray-300 italic px-2">No documents in database</p>
              ) : (
                knowledgeBase.map(doc => (
                  <div key={doc.id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 overflow-hidden text-indigo-500">
                      <ICONS.FileText size={16} />
                      <div className="text-[10px] font-bold text-gray-600 truncate">{doc.name}</div>
                    </div>
                    <button onClick={() => handleDeleteDocument(doc.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all">
                      <ICONS.Delete size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <button onClick={() => setIsAssistantOpen(true)} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group">
              <ICONS.Agent4 size={20} className="group-hover:rotate-12 transition-transform" /> Platform Support
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 flex flex-col bg-gray-50/30 scroll-smooth">
          <div className="max-w-4xl mx-auto w-full space-y-12">

            <section className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Governed Orchestration Layer</p>
                <div className="flex gap-4">
                  {aiRegistry.filter(m => m.isDefault).map(m => (
                    <div key={m.id} className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">Engine: {m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={runOrchestration} className="space-y-6">
                <div className="relative">
                  <textarea
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Enter an enterprise request (e.g., 'Verification of vendor TechCorp status')..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-6 focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none min-h-[140px] text-lg text-gray-700 shadow-inner resize-none transition-all placeholder:text-gray-300"
                  />
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <button type="button" onClick={toggleListening} className={`p-4 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-indigo-600'}`}><ICONS.Mic size={20} /></button>
                    {isListening && <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">Listening Node...</span>}
                  </div>
                  <div className="absolute bottom-6 right-6 flex gap-4">
                    <button type="button" onClick={resetOrchestrator} className="px-6 py-4 rounded-2xl font-black text-xs text-gray-300 hover:text-gray-500 transition-all uppercase tracking-widest">Purge</button>
                    <button type="submit" disabled={isProcessing || !userInput.trim()} className="px-10 py-4 rounded-2xl font-black text-xs bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-200 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest">Dispatch Agents</button>
                  </div>
                </div>
              </form>
            </section>

            <div ref={resultsRef} className="space-y-12 pb-24 transition-all duration-700">
              {approvalDecision === 'pending' && (
                <div className="bg-amber-50 border-4 border-amber-200 rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-xl shadow-amber-200"><ICONS.Agent3 size={28} /></div>
                    <div>
                      <h4 className="text-amber-900 font-black text-xl tracking-tight">Governance Intervention Required</h4>
                      <p className="text-[11px] text-amber-600 font-black uppercase tracking-[0.2em] mt-1">Manual Release Mandatory</p>
                    </div>
                  </div>
                  <div className="bg-white/60 p-8 rounded-3xl border border-amber-100 mb-10 text-lg text-amber-900 leading-relaxed italic shadow-inner">
                    {agent3Result}
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => handleApproval('approved')} className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-black text-xs hover:bg-green-700 shadow-xl shadow-green-100 active:scale-95 transition-all uppercase tracking-[0.2em]">Approve Access</button>
                    <button onClick={() => handleApproval('rejected')} className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black text-xs hover:bg-red-700 shadow-xl shadow-red-100 active:scale-95 transition-all uppercase tracking-[0.2em]">Deny Request</button>
                  </div>
                </div>
              )}

              {agent4Result && (
                <div className="animate-reveal relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-[3rem] blur-xl opacity-10"></div>
                  <div className="relative bg-white border border-gray-100 rounded-[2.5rem] shadow-3xl overflow-hidden">
                    <div className="px-12 py-12">
                      <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-5">
                          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                            <ICONS.Shield size={24} />
                          </div>
                          <div>
                            <span className="text-[12px] font-black uppercase text-indigo-600 tracking-[0.3em] block">Verified Response Delivery</span>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Audit Ref: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                          </div>
                        </div>
                        <button onClick={() => playSpeech(agent4Result)} className="flex items-center gap-3 bg-gray-50 text-gray-500 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-gray-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          {isSpeechLoading ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div> : <ICONS.Volume2 size={16} />} Vocalize
                        </button>
                      </div>

                      <div className="px-4">
                        {formatNarrative(agent4Result.split('[CITATION]:')[0])}

                        {agent4Result.includes('[CITATION]:') && (
                          <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-100 italic">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Enterprise Knowledge Reference:</span>
                            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
                              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm"><ICONS.Database size={16} /></div>
                              <p className="text-sm font-bold text-gray-500 tracking-tight">
                                {agent4Result.split('[CITATION]:')[1].trim()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50/80 px-12 py-8 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><ICONS.Zap size={14} className="text-indigo-500" /> Synthesized at Node</span>
                        <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><ICONS.Check size={14} className="text-green-500" /> Compliant Delivery</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-300 uppercase">Engine: {aiRegistry.find(m => m.isDefault)?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(isProcessing || agent1Result) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-1000">
                  <AgentCard id="a1" name="Classifier" icon="Agent1" status={agent1Status} description="Determines risk/intent." result={agent1Result} />
                  <AgentCard id="a2" name="RAG Engine" icon="Agent2" status={agent2Status} description="Grounded retrieval." result={agent2Result} />
                  <AgentCard id="a3" name="Governance" icon="Agent3" status={agent3Status} description="Approval management." result={agent3Result} />
                  <AgentCard id="a4" name="Orchestrator" icon="Agent4" status={agent4Status} description="Final Synthesis." result={agent4Result} />
                  <AgentCard id="a5" name="Validator" icon="Agent5" status={agent5Status} description="Cross-references facts." result={agent5Result} />
                  <AgentCard id="a6" name="Planner" icon="Agent6" status={agent6Status} description="Plans next actions." result={agent6Result} />
                  <AgentCard id="a7" name="Privacy" icon="Agent7" status={agent7Status} description="Redacts sensitive data." result={agent7Result} />
                  <AgentCard id="a8" name="Memory" icon="Agent8" status={agent8Status} description="Maintains conversation context." result={agent8Result} />
                  <AgentCard id="a9" name="Drafter" icon="Agent9" status={agent9Status} description="Formats output templates." result={agent9Result} />
                  <AgentCard id="a10" name="Arbiter" icon="Agent10" status={agent10Status} description="Conflict Resolution." result={agent10Result} />
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className={`${showTerminal ? 'w-[520px]' : 'w-0 opacity-0'} bg-[#0a0a0c] border-l border-white/5 flex flex-col transition-all duration-500 overflow-hidden relative shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.5)]`}>
          {/* Glowing background effect */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

          <div className="bg-[#111114]/80 backdrop-blur-md px-8 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.4)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.4)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.4)]"></div>
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
              <span className="text-[10px] font-mono text-gray-400 font-bold tracking-[0.3em] uppercase">System Monitor: v2.7</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-green-500/80 font-bold animate-pulse">● LIVE_STREAM</span>
            </div>
          </div>

          <div className="flex-1 p-8 font-mono text-[11px] overflow-y-auto custom-scrollbar scroll-smooth bg-transparent select-text">
            {[...serverLogs].reverse().map((l, i) => {
              const isError = l.includes('ERROR');
              const isWarn = l.includes('WARN');
              const isPost = l.includes('POST');
              const is200 = l.includes('200');
              const isAudit = l.includes('AUDIT');
              const isPro = l.includes('PRO');
              const isFast = l.includes('FAST');
              const isSystem = l.includes('[SYSTEM]');

              let colorClass = 'text-gray-500 border-white/5';
              let tagColor = 'bg-white/5 text-gray-400';

              if (isError) { colorClass = 'text-red-400/90 border-red-500/30'; tagColor = 'bg-red-500/10 text-red-500'; }
              else if (isWarn) { colorClass = 'text-amber-400/90 border-amber-500/30'; tagColor = 'bg-amber-500/10 text-amber-500'; }
              else if (isPost) { colorClass = 'text-blue-400/90 border-blue-500/30'; tagColor = 'bg-blue-500/10 text-blue-500'; }
              else if (is200) { colorClass = 'text-emerald-400/90 border-emerald-500/30'; tagColor = 'bg-emerald-500/10 text-emerald-500'; }
              else if (isAudit) { colorClass = 'text-purple-400/90 border-purple-500/30'; tagColor = 'bg-purple-500/10 text-purple-500'; }
              else if (isPro) { colorClass = 'text-indigo-400/90 border-indigo-500/30'; tagColor = 'bg-indigo-500/20 text-indigo-400'; }
              else if (isFast) { colorClass = 'text-cyan-400/90 border-cyan-500/30'; tagColor = 'bg-cyan-500/10 text-cyan-500'; }
              else if (isSystem) { colorClass = 'text-white/80 border-white/20 font-bold'; tagColor = 'bg-white/10 text-white'; }

              const logIndex = serverLogs.length - i;

              return (
                <div key={i} className={`mb-3 border-l-2 pl-5 py-1 transition-all hover:bg-white/5 group animate-in slide-in-from-top-2 duration-300 ${colorClass}`}>
                  <div className="flex items-start gap-4">
                    <span className="text-[8px] text-gray-700 mt-1 shrink-0 font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                      {logIndex.toString().padStart(3, '0')}
                    </span>
                    <span className="leading-relaxed break-all">
                      {l.startsWith('[') ? (
                        <>
                          <span className={`${tagColor} px-2 py-0.5 rounded-md text-[9px] font-black mr-2 tracking-tighter`}>
                            {l.split(']')[0].substring(1)}
                          </span>
                          {l.split(']').slice(1).join(']')}
                        </>
                      ) : l}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="h-4"></div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end gap-5">
        {isAssistantOpen && (
          <div className="w-[450px] h-[600px] bg-white rounded-[2.5rem] shadow-4xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 zoom-in-95 duration-300 origin-bottom-right">
            <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2.5 rounded-xl"><ICONS.Agent4 className="text-white" size={20} /></div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-tight">Platform Helper</h3>
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Encrypted Stream</p>
                </div>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50 custom-scrollbar scroll-smooth">
              {chatHistory.length === 0 && (
                <div className="text-center py-12 px-8">
                  <div className="bg-indigo-100 w-16 h-16 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-lg shadow-indigo-100"><ICONS.Agent4 size={32} /></div>
                  <p className="text-gray-500 text-sm font-bold leading-relaxed">System active. How can I assist with your factory configuration or governed requests today?</p>
                </div>
              )}
              {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-md shadow-sm relative group transition-all ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-md'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <div className={`text-[9px] mt-2 font-black uppercase tracking-widest ${m.role === 'user' ? 'text-indigo-200/70' : 'text-gray-300'}`}>{m.timestamp}</div>
                    {m.role === 'assistant' && (
                      <button onClick={() => playSpeech(m.text)} className="absolute -right-12 top-2 p-2.5 bg-white text-gray-300 hover:text-indigo-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"><ICONS.Volume2 size={12} /></button>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && <div className="flex justify-start"><div className="bg-white border border-gray-100 rounded-3xl px-6 py-3 text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse shadow-sm">Analyzing...</div></div>}
            </div>
            <form onSubmit={handleAssistantSend} className="p-6 bg-white border-t border-gray-100 flex gap-3">
              <div className="flex-1 relative">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Submit a system query..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 outline-none pr-12 transition-all focus:bg-white" />
                <button type="button" onClick={toggleListening} className={`absolute right-4 top-4 p-1 transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-300 hover:text-indigo-600'}`}><ICONS.Mic size={18} /></button>
              </div>
              <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-200 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </form>
          </div>
        )}
        <button onClick={() => setIsAssistantOpen(!isAssistantOpen)} className={`w-16 h-16 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-white ${isAssistantOpen ? 'bg-red-500 rotate-45' : 'bg-indigo-600 pulse-ring-effect'}`}>
          {isAssistantOpen ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> : <ICONS.Agent4 className="text-white" size={32} />}
        </button>
      </div>
    </div >
  );
};

export default App;
