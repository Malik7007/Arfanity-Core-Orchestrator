
import React, { useState, useEffect } from 'react';
import { AIModelConfiguration, AIProviderType } from '../types';
import { ICONS } from '../constants';
import { aiService } from '../services/aiService';

interface ModelRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  registry: AIModelConfiguration[];
  onUpdate: (configs: AIModelConfiguration[]) => void;
}

const ModelRegistryModal: React.FC<ModelRegistryModalProps> = ({ isOpen, onClose, registry, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AIModelConfiguration>>({});
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Auto-load models if API key is present (or for Localhost) and provider changes
  useEffect(() => {
    if (formData.provider && (formData.apiKey || formData.provider === 'Localhost')) {
      // Simulate API call to fetch models
      setIsLoadingModels(true);
      const timer = setTimeout(() => {
        const available = aiService.getAvailableModelsForProvider(formData.provider as AIProviderType);
        setFormData(prev => ({
          ...prev,
          availableModels: available,
          modelName: available.includes(prev.modelName || '') ? prev.modelName : available[0]
        }));
        setIsLoadingModels(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [formData.apiKey, formData.provider]);

  if (!isOpen) return null;

  const handleToggleDefault = (id: string) => {
    const updated = registry.map(m => ({ ...m, isDefault: m.id === id }));
    onUpdate(updated);
  };

  const handleEdit = (model: AIModelConfiguration) => {
    setEditingId(model.id);
    setFormData({ ...model });
  };

  const handleSave = () => {
    if (editingId) {
      const updated = registry.map(m => m.id === editingId ? { ...m, ...formData } as AIModelConfiguration : m);
      onUpdate(updated);
      setEditingId(null);
      setFormData({});
    }
  };

  const handleAddNew = () => {
    const newId = `custom-${Math.random().toString(36).substr(2, 5)}`;
    const newModel: AIModelConfiguration = {
      id: newId,
      name: 'New Custom Engine',
      provider: 'OpenAI',
      modelName: 'gpt-4o',
      isDefault: false,
      capabilities: ['text'],
      apiKey: '',
      availableModels: []
    };
    onUpdate([...registry, newModel]);
    handleEdit(newModel);
  };

  const handleDelete = (id: string) => {
    if (registry.find(m => m.id === id)?.isDefault) {
      alert("Cannot delete the active engine.");
      return;
    }
    onUpdate(registry.filter(m => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col h-[780px] border border-gray-100">
        <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><ICONS.Zap size={20} /></div>
              AI Factory Registry
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Multi-Provider Model Connectivity & Orchestration</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {editingId ? (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 shadow-inner">
              <h3 className="text-lg font-black text-gray-900 mb-10 uppercase tracking-widest flex items-center justify-between">
                Edit Engine Configuration
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">Secure Node</span>
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest ml-1">Friendly Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Primary Brain, Compliance Node"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest ml-1">AI Provider</label>
                    <div className="relative">
                      <select
                        value={formData.provider || 'Google'}
                        onChange={e => setFormData({ ...formData, provider: e.target.value as AIProviderType, availableModels: [] })}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none appearance-none transition-all shadow-sm"
                      >
                        <option value="Google">Google (Gemini)</option>
                        <option value="OpenAI">OpenAI (GPT)</option>
                        <option value="Groq">Groq (Llama 3)</option>
                        <option value="OpenRouter">OpenRouter</option>
                        <option value="Anthropic">Anthropic (Claude)</option>
                        <option value="Localhost">Localhost (Ollama)</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest ml-1">Provider API Key</label>
                    <input
                      type="password"
                      placeholder="sk-...."
                      value={formData.apiKey || ''}
                      onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest ml-1">Active Model</label>
                  <div className="relative">
                    {isLoadingModels ? (
                      <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm flex items-center gap-3 text-gray-400 animate-pulse">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        Synchronizing with provider...
                      </div>
                    ) : (
                      <select
                        disabled={!formData.apiKey && formData.provider !== 'Localhost'}
                        value={formData.modelName || ''}
                        onChange={e => setFormData({ ...formData, modelName: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none appearance-none disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-sm"
                      >
                        {!formData.apiKey && formData.provider !== 'Localhost' ? (
                          <option>Enter API Key to load models</option>
                        ) : (
                          (formData.availableModels || []).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))
                        )}
                      </select>
                    )}
                    {(!isLoadingModels && (formData.apiKey || formData.provider === 'Localhost')) && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button onClick={() => { setEditingId(null); setFormData({}); }} className="flex-1 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Discard</button>
                  <button onClick={handleSave} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all active:scale-95">Save Changes</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {registry.map(model => (
                <div key={model.id} className={`p-8 rounded-[2rem] border-2 transition-all group ${model.isDefault ? 'border-indigo-500 bg-indigo-50/20 shadow-xl' : 'border-gray-100 hover:border-indigo-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-2xl font-black shadow-inner transition-all group-hover:scale-110 ${model.provider === 'Google' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                          model.provider === 'OpenAI' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' :
                            model.provider === 'Groq' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' :
                              model.provider === 'OpenRouter' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' :
                                model.provider === 'Anthropic' ? 'bg-stone-800 text-white shadow-lg' :
                                  'bg-gray-800 text-white'
                        }`}>
                        {model.provider[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-xl leading-none mb-2">{model.name}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{model.provider} • {model.modelName}</span>
                          {model.isDefault && (
                            <span className="text-[9px] bg-indigo-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-tighter shadow-sm">Active Node</span>
                          )}
                          {!model.apiKey && model.provider !== 'Localhost' && (
                            <span className="text-[9px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold uppercase tracking-tighter animate-pulse">Key Missing</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!model.isDefault && (
                        <button
                          onClick={() => handleToggleDefault(model.id)}
                          className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(model)}
                        className="p-3.5 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all active:scale-90 border border-transparent hover:border-gray-100"
                        title="Edit Configuration"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      {!model.isDefault && (
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="p-3.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddNew}
                className="w-full py-10 border-4 border-dashed border-gray-100 rounded-[2.5rem] text-gray-300 hover:border-indigo-300 hover:text-indigo-400 font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-indigo-50/50 hover:scale-[0.99]"
              >
                + Register Enterprise Engine
              </button>
            </div>
          )}
        </div>

        <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ICONS.Shield size={16} className="text-gray-400" />
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Global Endpoint Registry • v2.6 Secure Stack</span>
          </div>
          <button onClick={onClose} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95">
            Exit Factory
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelRegistryModal;
