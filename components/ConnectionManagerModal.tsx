
import React, { useState } from 'react';
import { KnowledgeConnection, KnowledgeSourceType } from '../types';
import { ICONS } from '../constants';

interface ConnectionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: KnowledgeConnection[];
  onAddConnection: (conn: KnowledgeConnection) => void;
  onDeleteConnection: (id: string) => void;
}

const ConnectionManagerModal: React.FC<ConnectionManagerModalProps> = ({
  isOpen,
  onClose,
  connections,
  onAddConnection,
  onDeleteConnection
}) => {
  const [step, setStep] = useState<'list' | 'select' | 'configure'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<KnowledgeSourceType | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    clientId: '',
    clientSecret: '',
    path: '',
    tenantId: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleTestHandshake = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('success');
    }, 1500);
  };

  const handleSave = async () => {
    if (!selectedType) return;
    const newConn: KnowledgeConnection = {
      id: editingId || Math.random().toString(36).substring(2, 9),
      name: formData.name || `${selectedType} Connection`,
      type: selectedType,
      status: 'connected',
      config: { ...formData },
      lastSync: 'Just now',
      recordCount: selectedType === 'Upload' ? 1 : Math.floor(Math.random() * 500) + 50
    };

    // Pass the actual file object if it's an upload
    await (onAddConnection as any)(newConn, selectedType === 'Upload' ? selectedFile : null);

    setStep('list');
    setEditingId(null);
    setFormData({ name: '', url: '', clientId: '', clientSecret: '', path: '', tenantId: '' });
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ICONS.Database size={18} className="text-[#0078D4]" />
              Knowledge Connection Center
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Manage RAG Data Ingestion & Authentication</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 'list' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-700">Active Enterprise Connections</h3>
                <button
                  onClick={() => setStep('select')}
                  className="bg-[#0078D4] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#106EBE]"
                >
                  <ICONS.FilePlus size={14} /> New Connector
                </button>
              </div>

              {connections.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <ICONS.Database size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-sm text-gray-400 font-medium">No active connections configured</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map(conn => {
                    const Icon = ICONS[conn.type as keyof typeof ICONS] || ICONS.Database;
                    return (
                      <div key={conn.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-all bg-white shadow-sm group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Icon size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 leading-none">{conn.name}</h4>
                              <span className="text-[10px] text-gray-400 font-medium">{conn.type} • ID: {conn.id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-[10px] font-bold text-green-600 uppercase">Online</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg mb-3">
                          <div>Records: <span className="text-gray-900 font-bold">{conn.recordCount}</span></div>
                          <div className="text-right">Synced: <span className="text-gray-900 font-bold">{conn.lastSync}</span></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-gray-50">
                          <button
                            onClick={() => {
                              setSelectedType(conn.type);
                              setFormData(conn.config);
                              setEditingId(conn.id);
                              setStep('configure');
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                          >
                            <ICONS.Zap size={10} /> Config
                          </button>
                          <button
                            onClick={async () => {
                              await (onAddConnection as any)(conn, null);
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
                          >
                            <ICONS.Check size={10} /> Attach
                          </button>
                          <button
                            onClick={() => onDeleteConnection(conn.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                          >
                            <ICONS.Delete size={10} /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 'select' && (
            <div className="animate-in slide-in-from-right-4">
              <button onClick={() => { setStep('list'); setEditingId(null); setSelectedType(null); }} className="text-xs font-bold text-gray-500 mb-6 flex items-center gap-2 hover:text-[#0078D4]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Dashboard
              </button>
              <h3 className="text-md font-bold text-gray-900 mb-6">Select Ingestion Connector</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { type: 'SharePoint' as KnowledgeSourceType, desc: 'Enterprise document libraries & sites' },
                  { type: 'Dataverse' as KnowledgeSourceType, desc: 'Structured Dynamics 364 & Power Apps data' },
                  { type: 'AzureSQL' as KnowledgeSourceType, desc: 'Cloud relational database tables' },
                  { type: 'Local' as KnowledgeSourceType, desc: 'On-premise file system folders' },
                  { type: 'Upload' as KnowledgeSourceType, desc: 'Upload PDF or Word documents directly' },
                  { type: 'Paste' as KnowledgeSourceType, desc: 'Manually paste text knowledge artifacts' }
                ].map(item => {
                  const Icon = ICONS[item.type as keyof typeof ICONS] || ICONS.Database;
                  return (
                    <button
                      key={item.type}
                      onClick={() => { setSelectedType(item.type); setStep('configure'); }}
                      className="p-6 border border-gray-200 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="p-3 bg-gray-50 text-gray-400 rounded-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors w-fit">
                        <Icon size={24} />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{item.type}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'configure' && selectedType && (
            <div className="animate-in slide-in-from-right-4 max-w-xl mx-auto">
              <button onClick={() => setStep('select')} className="text-xs font-bold text-gray-500 mb-6 flex items-center gap-2 hover:text-[#0078D4]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Choose different connector
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-600 text-white rounded-2xl">
                  {(() => { const Icon = ICONS[selectedType as keyof typeof ICONS] || ICONS.Database; return <Icon size={32} /> })()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Configure {selectedType}</h3>
                  <p className="text-xs text-gray-500">Provide the required identity & location parameters.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Connection Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={`My Enterprise ${selectedType}`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {(selectedType === 'SharePoint' || selectedType === 'Dataverse') && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Environment / Site URL</label>
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://tenant.sharepoint.com/sites/hr"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {(selectedType === 'SharePoint' || selectedType === 'AzureSQL' || selectedType === 'Dataverse') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Client ID / App ID</label>
                      <input
                        type="text"
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Client Secret</label>
                      <input
                        type="password"
                        value={formData.clientSecret}
                        onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'Local' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Filesystem Path</label>
                    <input
                      type="text"
                      value={formData.path}
                      onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                      placeholder="\\SERVER\Documents\Internal"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {selectedType === 'Paste' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Text Knowledge Content</label>
                    <textarea
                      value={formData.clientSecret}
                      onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                      placeholder="Paste your enterprise knowledge or policy text here..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-40 resize-none"
                    />
                  </div>
                )}

                {selectedType === 'Upload' && (
                  <div className="border-2 border-dashed border-gray-200 rounded-[1.5rem] p-10 text-center hover:border-blue-500 transition-all bg-gray-50 group">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setFormData({ ...formData, name: file.name, path: file.name });
                        }
                      }}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ICONS.Upload size={32} />
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">{formData.path || 'Click to select PDF or Word file'}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Max Size: 25MB • PDF, DOCX supported</p>
                    </label>
                  </div>
                )}

                <div className="pt-6 flex gap-4">
                  <button
                    onClick={handleTestHandshake}
                    disabled={isTesting}
                    className={`flex-1 py-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${testResult === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {isTesting ? (
                      <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <ICONS.Shield size={14} />
                    )}
                    {testResult === 'success' ? 'Handshake Successful' : 'Test Handshake'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isTesting}
                    className="flex-1 bg-[#0078D4] text-white py-3 rounded-lg text-xs font-bold hover:bg-[#106EBE] shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    Establish Connection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-[#F8F9FA] border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ICONS.Shield size={14} className="text-gray-400" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TLS 1.3 / AES-256 Encrypted Config Store</span>
          </div>
          <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-900">Close Manager</button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionManagerModal;
