
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
            <h2 className="text-xl font-bold text-gray-900 leading-tight">Agent Factory System Guide</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">Knowledge Retrieval & Document Intelligence</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100 px-8 bg-white">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'architecture' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Workflow Architecture
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'integrations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Knowledge Connections
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'governance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Governance & Compliance
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'architecture' && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-blue-900 font-bold mt-0 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px]">01</span>
                    Business Objective
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Empower employees with safe access to internal knowledge while strictly enforcing corporate compliance and risk thresholds.
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <h3 className="text-green-900 font-bold mt-0 flex items-center gap-2 text-sm uppercase tracking-tighter">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px]">02</span>
                    Document Intelligence
                  </h3>
                  <p className="text-xs text-green-800 leading-relaxed font-medium">
                    Automated extraction, semantic auditing, and multi-source arbitration across PDF and Word policy repositories.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-6">Workflow Orchestration</h3>
              <div className="space-y-4">
                {[
                  { label: 'Layer 1: Gateway (Agent 1)', color: 'bg-indigo-600', text: 'Classifies intent and assigns risk scores (Low, Medium, High).' },
                  { label: 'Layer 2: Retrieval (Agent 2)', color: 'bg-purple-600', text: 'Retrieves multi-source context from SharePoint, Dataverse, or Local systems.' },
                  { label: 'Layer 3: Arbitration (Agent 10)', color: 'bg-slate-700', text: 'Resolves record conflicts between sources before synthesis begins.' },
                  { label: 'Layer 4: Governance (Agent 3)', color: 'bg-amber-600', text: 'Enforces compliance rules and triggers manual Approval/HITL if required.' },
                  { label: 'Layer 5: Synthesis (Agent 4)', color: 'bg-emerald-600', text: 'Orchestrates the final verified narrative response.' },
                  { label: 'Layer 6: Semantic Audit (Agent 5)', color: 'bg-indigo-500', text: 'Cross-references the generated narrative against source facts to prevent hallucinations.' },
                  { label: 'Layer 7: Context Sync (Agent 8)', color: 'bg-blue-400', text: 'Aligns the current response with the conversation history for long-term coherence.' },
                  { label: 'Layer 8: Privacy Shield (Agent 7)', color: 'bg-red-500', text: 'Redacts PII and sensitive data before the output is exposed to templates.' },
                  { label: 'Layer 9: Drafting (Agent 9)', color: 'bg-rose-500', text: 'Converts the cleaned facts into professional email/alert templates.' },
                  { label: 'Layer 10: Action Planner (Agent 6)', color: 'bg-amber-500', text: 'Generates concrete executable tasks from the finalized, secure output.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start border-l-2 border-gray-100 pl-6 relative">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${step.color} border-4 border-white shadow-sm`}></div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1">{step.label}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Connecting Enterprise Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Knowledge Factory</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4">A unified <strong>Backend Database</strong> that stores and indexes documents. Supports <strong>Auto-Parsing</strong> of PDF and .docx files into searchable text blocks.</p>
                  <div className="bg-gray-50 p-2 rounded text-[9px] font-mono text-gray-400">storage: /uploads | persistence: db.json</div>
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Dataverse</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4">Connects via <strong>Web API</strong>. Agent generates FetchXML or SQL to retrieve structured rows (Vendors, HR records, Sales).</p>
                  <div className="bg-gray-50 p-2 rounded text-[9px] font-mono text-gray-400">endpoint: cr88a.crm4.dynamics.com</div>
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Local System</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4">Uses <strong>DirectoryLoader</strong> to scan local paths. Private indices are built on-premise using ChromaDB or FAISS for ultra-sensitive ops.</p>
                  <div className="bg-gray-50 p-2 rounded text-[9px] font-mono text-gray-400">path: \\NAS-STORAGE\INTERNAL_POLICIES</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Governance Protocols</h3>
              <div className="space-y-6">
                <div className="flex gap-6 items-center p-6 bg-red-50 border border-red-100 rounded-xl">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                  </div>
                  <div>
                    <h4 className="text-red-900 font-bold mb-1">0.7 Grounding Threshold</h4>
                    <p className="text-sm text-red-800 leading-relaxed">Agent 2 must return a confidence score ≥ 0.7. If grounding is weak, the system triggers a compliance error and prevents the response from reaching the user.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-gray-200 rounded-xl">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Purview Classification</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">Every retrieved context carries a sensitivity label (Public, Internal, Restricted). If the user doesn't have the appropriate Entra ID scope, Agent 2 automatically filters that content.</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-200 rounded-xl">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">HITL Orchestration</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">Decisions involving financial impact (e.g., procurement) or policy changes are forced through Agent 3 to a human approver via a Power Automate adaptive card.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-[#F8F9FA] border-t border-gray-100 flex justify-between items-center">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Version 2.7-LATEST | Orchestrator Node STABLE</div>
          <button
            onClick={onClose}
            className="bg-[#0078D4] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#106EBE] transition-all shadow-md shadow-blue-100"
          >
            I Understand the Architecture
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;
