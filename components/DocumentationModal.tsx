
import React, { useState } from 'react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'integrations' | 'governance'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">Arfanity Core System Guide v3.0</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">The LangStack: Chain, Graph, Flow, Smith, MCP</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100 px-8 bg-white">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'architecture' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Mission Architecture
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'integrations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            MCP & Knowledge
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`py-4 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'governance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Governance & Smith
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'architecture' && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <h3 className="text-indigo-900 font-black mt-0 flex items-center gap-2 text-xs uppercase tracking-widest">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">01</span>
                    LangStack Philosophy
                  </h3>
                  <p className="text-xs text-indigo-800 leading-relaxed font-medium mt-3">
                    Build with <strong>LangChain</strong>, Scale with <strong>LangGraph</strong>, Prototype with <strong>LangFlow</strong>, and Ship with <strong>LangSmith</strong>.
                  </p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <h3 className="text-emerald-900 font-black mt-0 flex items-center gap-2 text-xs uppercase tracking-widest">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">02</span>
                    Grounded Reasoning
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium mt-3">
                    Every mission is anchored in verified enterprise data, filtered for privacy, and cross-referenced via the <strong>Arbiter Gateway (MCP)</strong>.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-8 tracking-tight">Mission Orchestration (v3.0 Flow)</h3>
              <div className="space-y-6">
                {[
                  { label: 'Layer 1: Classifier (Agent 1)', color: 'bg-indigo-600', text: 'Analyzes intent, assigns risk, and selects the neural path.' },
                  { label: 'Layer 2: MCP Gateway (Agent 10)', color: 'bg-indigo-400', text: 'Universal synchronization with external tools/data via Model Context Protocol.' },
                  { label: 'Layer 3: RAG Engine (Agent 2)', color: 'bg-indigo-800', text: 'Retrieves multi-source context with deep semantic grounding.' },
                  { label: 'Layer 4: Governance (Agent 3)', color: 'bg-amber-600', text: 'Enforces policy rules and halts missions for Manual Approvals (HITL).' },
                  { label: 'Layer 5: Intelligence (Agent 4)', color: 'bg-emerald-600', text: 'Final synthesis of narrative intelligence using chosen LLM provider.' },
                  { label: 'Layer 6: Validator (Agent 5)', color: 'bg-indigo-500', text: 'Truth-audits the response against source facts to prevent hallucinations.' },
                  { label: 'Layer 7: Memory (Agent 8)', color: 'bg-blue-400', text: 'Synchronizes session coherence across the global mission history.' },
                  { label: 'Layer 8: Privacy (Agent 7)', color: 'bg-red-500', text: 'Redacts sensitive PII and restricted company lore before final drafting.' },
                  { label: 'Layer 9: Drafter (Agent 9)', color: 'bg-rose-500', text: 'Transforms raw intelligence into project-ready enterprise templates.' },
                  { label: 'Layer 10: Planner (Agent 6)', color: 'bg-amber-500', text: 'Generates an executable strategic roadmap based on verified mission output.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-6 items-start border-l-2 border-gray-100 pl-8 relative pb-2">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${step.color} border-4 border-white shadow-sm ring-4 ring-gray-50`}></div>
                    <div>
                      <h4 className="font-black text-gray-900 text-[11px] uppercase tracking-widest mb-1">{step.label}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (activeTab === 'integrations' && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <h3 className="text-lg font-black text-gray-900 mb-8 tracking-tight">MCP & Knowledge Ecosystem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  </div>
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-3">MCP Universal Gateway</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-medium">Standardized <strong>Model Context Protocol</strong> interaction. Connects agents to GitHub, Slack, SQL, and custom enterprise tools.</p>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[9px] font-mono text-gray-400 leading-loose">protocol: fastmcp v2.x<br />node: arbiter_mcp_gateway</div>
                </div>
                <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                  </div>
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-3">Enterprise RAG</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-medium">High-fidelity ingestion of PDF and DOCX. Every fact is mapped to source metadata for absolute citation accuracy.</p>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[9px] font-mono text-gray-400 leading-loose">engine: deep_parse_v2<br />indices: semantic_vector_db</div>
                </div>
                <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-3">Audit Registry</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-medium">Automatic logging of every extraction. Tracks source provenance across multiple knowledge silos in real-time.</p>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[9px] font-mono text-gray-400 leading-loose">logs: transmission_audit_v3<br />sync: realmode_context</div>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'governance' && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <h3 className="text-lg font-black text-gray-900 mb-8 tracking-tight">Governance & Observability (LangSmith)</h3>
              <div className="space-y-8">
                <div className="flex gap-8 items-center p-8 bg-indigo-900 text-white rounded-[2rem] shadow-2xl shadow-indigo-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-60">Observability Tier</h4>
                    <h4 className="text-2xl font-black mb-1 tracking-tight">LangSmith Production Tracing</h4>
                    <p className="text-sm text-indigo-100/80 leading-relaxed font-medium">Every mission node is traced, debugged, and optimized. From token costs to agent latency, full transparency is shipped with every response.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-white border border-gray-100 rounded-2xl">
                    <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-3">HITL Pause & Resume</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">For high-risk requests (Risk &gt; 0.9), LangGraph halts the mission. Operations only resume once a manual approval is logged in the Governance Shield.</p>
                  </div>
                  <div className="p-8 bg-white border border-gray-100 rounded-2xl">
                    <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-3">Privacy Redaction Layer</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Automated scrubbing of PII and internal entities before the final Drafter release. No sensitive secrets ever leave the restricted neural context.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-10 py-8 bg-[#F8F9FA] border-t border-gray-100 flex justify-between items-center">
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Version 3.0-ENTERPRISE | LangStack + MCP Standard ACTIVE</div>
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest"
          >
            Acknowledge Mission Protocol
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;
