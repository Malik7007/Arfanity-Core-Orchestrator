import React, { useState } from 'react';
// Import ICONS from constants to fix the "Cannot find name 'ICONS'" error on line 89
import { ICONS } from './constants';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'knowledge' | 'governance'>('workflow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-6">
            <img src="/assets/logo.png" alt="Arfanity Logo" className="h-12 w-auto shadow-md rounded-xl" />
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight text-[#1E293B]">Arfanity Core Orchestrator</h2>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Agentic Framework v2.7</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100 px-10 bg-white overflow-x-auto">
          {[
            { id: 'workflow', label: 'Workflow Overview' },
            { id: 'knowledge', label: 'Knowledge Intelligence' },
            { id: 'governance', label: 'Governance & Compliance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
          {activeTab === 'workflow' && (
            <div className="animate-in slide-in-from-left-4 duration-300 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                  <ICONS.Zap className="text-indigo-500" /> 10-Agent Orchestration Sequence
                </h3>
                <p className="text-gray-500 mb-8 leading-relaxed italic">The system executes a strictly sequenced multi-agent pipeline to ensure factuality, safety, and executive-grade delivery.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: '01', name: 'Classifier', role: 'Analyzes intent, risk level, and identifies restricted technical protocols.' },
                    { id: '02', name: 'RAG Engine', role: 'Performs semantic retrieval from deep-parsed PDF/Word knowledge bases.' },
                    { id: '03', name: 'Governance', role: 'Enforces human-in-the-loop approvals for high-risk or low-confidence data.' },
                    { id: '04', name: 'Orchestrator', role: 'Synthesizes information into a cohesive, professional narrative brief.' },
                    { id: '05', name: 'Validator', role: 'Cross-references generated content against source documents for Hallucinations.' },
                    { id: '06', name: 'Planner', role: 'Suggests next logical steps or additional data points needed for the request.' },
                    { id: '07', name: 'Privacy', role: 'Identifies and redacts PII or sensitive corporate identifiers from output.' },
                    { id: '08', name: 'Memory', role: 'Maintains short-term conversational context to handle follow-up queries.' },
                    { id: '09', name: 'Drafter', role: 'Applies enterprise formatting templates and visual structures to the brief.' },
                    { id: '10', name: 'Arbiter', role: 'Resolves conflicting data points between multiple disparate sources.' }
                  ].map(agent => (
                    <div key={agent.id} className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                      <span className="text-lg font-black text-indigo-200 group-hover:text-indigo-500 transition-colors">{agent.id}</span>
                      <div>
                        <h5 className="font-black text-gray-800 text-sm mb-1">{agent.name}</h5>
                        <p className="text-[11px] text-gray-500 leading-normal">{agent.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="animate-in slide-in-from-left-4 duration-300 space-y-8">
              <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">RAG & Document Intelligence</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <ICONS.Database className="text-indigo-600 mb-4" size={32} />
                  <h4 className="font-black text-indigo-900 mb-2">Deep Parsing</h4>
                  <p className="text-xs text-indigo-800/70 leading-relaxed">Native support for PDF and Word ingestion. Our backend extracts text while preserving semantic meaning for the embedding layer.</p>
                </div>
                <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <ICONS.Check className="text-emerald-600 mb-4" size={32} />
                  <h4 className="font-black text-emerald-900 mb-2">Semantic Search</h4>
                  <p className="text-xs text-emerald-800/70 leading-relaxed">Uses cosine similarity to retrieve documents. Multi-word boosting ensures that titles and key phrases take precedence.</p>
                </div>
                <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100">
                  <ICONS.Alert className="text-amber-600 mb-4" size={32} />
                  <h4 className="font-black text-amber-900 mb-2">Deep Recovery</h4>
                  <p className="text-xs text-amber-800/70 leading-relaxed">Exclusive fallback system. If keyword matching filters too aggressively, the engine recovers the most recent records to prevent data silos.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-gray-100">
                <h4 className="font-black text-gray-800 mb-6 uppercase text-[10px] tracking-widest">Connectivity Nodes</h4>
                <div className="flex flex-wrap gap-4">
                  {['SharePoint', 'OneDrive', 'Azure SQL', 'Local Upload', 'Paste Buffer'].map(node => (
                    <span key={node} className="px-5 py-2.5 bg-gray-50 rounded-full text-[11px] font-bold text-gray-500 border border-gray-200">{node}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="animate-in slide-in-from-left-4 duration-300 space-y-8">
              <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Governance & Safety Protocols</h3>

              <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 flex items-start gap-10">
                <div className="p-6 bg-red-600 text-white rounded-[2rem] shadow-xl shadow-red-200"><ICONS.Shield size={48} /></div>
                <div>
                  <h4 className="text-2xl font-black text-red-900 mb-4">Manual Release Mandatory</h4>
                  <p className="text-red-800 leading-relaxed font-medium mb-6">High-risk intents (financial, security, legal) or RAG grounding failures trigger an immediate "Pending" state. Human authorization is strictly required before output generation.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-red-700 font-bold text-sm"><ICONS.Check size={16} /> Restricted Protocol ID</li>
                    <li className="flex items-center gap-3 text-red-700 font-bold text-sm"><ICONS.Check size={16} /> Source Identification Check</li>
                    <li className="flex items-center gap-3 text-red-700 font-bold text-sm"><ICONS.Check size={16} /> Compliance Threshold: 85%</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-900 text-white rounded-3xl shadow-2xl">
                  <h5 className="font-black text-indigo-400 uppercase text-[10px] tracking-widest mb-4">Audit Transparency</h5>
                  <p className="text-sm text-gray-400 leading-relaxed">Every orchestration cycle is logged in the System Monitor with a unique Trace ID. All Agent 2 RAG results are stored for 30 days for compliance audits.</p>
                </div>
                <div className="p-8 bg-indigo-600 text-white rounded-3xl shadow-2xl">
                  <h5 className="font-black text-indigo-200 uppercase text-[10px] tracking-widest mb-4">Model Sovereignty</h5>
                  <p className="text-sm text-indigo-100 leading-relaxed">Users control data routing. Sensitive briefs can be routed to local models (Ollama) to ensure data never leaves the corporate firewall.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Managed by Global AI Orchestration</span>
          <button onClick={onClose} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            Acknowledge Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;