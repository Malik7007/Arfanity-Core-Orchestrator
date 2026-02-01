
import React from 'react';
import { AgentStatus } from '../types';
import { ICONS } from '../constants';

interface AgentCardProps {
  id: string;
  name: string;
  icon: keyof typeof ICONS;
  status: AgentStatus;
  description: string;
  result?: any;
  isLoading?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ id, name, icon, status, description, result }) => {
  const Icon = ICONS[icon];

  const statusStyles = {
    [AgentStatus.IDLE]: {
      container: 'bg-white border-gray-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100',
      header: 'text-gray-500',
      iconBg: 'bg-gray-100 text-gray-400 border-gray-200',
      badge: 'bg-gray-100 text-gray-500',
      result: 'bg-gray-50 border-gray-100 text-gray-400'
    },
    [AgentStatus.WORKING]: {
      container: 'bg-white border-blue-500 shadow-2xl z-10 working-pulse',
      header: 'text-blue-900',
      iconBg: 'bg-blue-600 text-white border-blue-600 pulse-ring-effect',
      badge: 'bg-blue-600 text-white animate-pulse',
      result: 'bg-blue-50 border-blue-100 text-blue-900'
    },
    [AgentStatus.COMPLETED]: {
      container: 'bg-white border-green-400 shadow-lg animate-zoom-in-bounce',
      header: 'text-green-900',
      iconBg: 'bg-green-600 text-white border-green-600',
      badge: 'bg-green-100 text-green-700 font-bold',
      result: 'bg-gray-50 border-gray-200 text-gray-700'
    },
    [AgentStatus.ERROR]: {
      container: 'bg-white border-red-500 animate-shake shadow-2xl',
      header: 'text-red-900',
      iconBg: 'bg-red-600 text-white border-red-600',
      badge: 'bg-red-100 text-red-700 font-bold',
      result: 'bg-red-50 border-red-200 text-red-900'
    }
  };

  const style = statusStyles[status];

  // Agent 2 Specific Grounding indicators
  const isAgent2 = id === 'a2';
  const isKnowledgeError = isAgent2 && status === AgentStatus.ERROR;
  const isKnowledgeSuccess = isAgent2 && status === AgentStatus.COMPLETED;

  return (
    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ease-out relative overflow-hidden flex flex-col h-full ${style.container}`}>
      {/* Background decoration for active agents */}
      {status === AgentStatus.WORKING && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] -mr-24 -mt-24 pointer-events-none"></div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`relative transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
            {/* Avatar Container with Glow */}
            <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-500 relative shadow-2xl ${style.iconBg.split(' ').filter(c => !c.includes('p-3') && !c.includes('rounded-xl')).join(' ')}`}>
              {/* Dynamic Glow Background */}
              <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-tr from-white/0 to-white/60`}></div>

              <img
                src={`/assets/agents/${id}.png`}
                alt={name}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const sibling = (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon') as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              {/* Fallback Icon */}
              <div className={`fallback-icon absolute inset-0 items-center justify-center hidden bg-inherit z-10`}>
                <Icon size={32} />
              </div>
            </div>

            {/* Premium Status Indicator with Pulsing Ring */}
            <div className="absolute -bottom-1 -right-1 z-20">
              <div className={`relative w-5 h-5 rounded-full border-2 border-white shadow-lg ${status === AgentStatus.WORKING ? 'bg-blue-500' :
                  status === AgentStatus.COMPLETED ? 'bg-green-500' :
                    status === AgentStatus.ERROR ? 'bg-red-500' : 'bg-gray-400'
                }`}>
                {status === AgentStatus.WORKING && (
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                )}
              </div>
            </div>
          </div>
          <div>
            <h3 className={`font-bold text-base tracking-tight ${style.header}`}>{name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-widest transition-all duration-300 ${style.badge}`}>
                {status}
              </span>

              {/* Grounding Badges for Agent 2 */}
              {isKnowledgeSuccess && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-600 text-white flex items-center gap-1 shadow-sm shadow-green-100">
                  <ICONS.Shield size={10} /> GROUNDED
                </span>
              )}
              {isKnowledgeError && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-600 text-white flex items-center gap-1 shadow-sm shadow-red-100 animate-pulse">
                  <ICONS.Alert size={10} /> GROUNDING FAILED
                </span>
              )}

              {/* Validator Badges for Agent 5 */}
              {id === 'a5' && status === AgentStatus.COMPLETED && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white flex items-center gap-1 shadow-sm shadow-indigo-100">
                  <ICONS.Check size={10} /> VERIFIED
                </span>
              )}

              {/* Planner Badges for Agent 6 */}
              {id === 'a6' && status === AgentStatus.COMPLETED && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white flex items-center gap-1 shadow-sm shadow-amber-100">
                  <ICONS.Zap size={10} /> ACTION PLAN
                </span>
              )}

              {/* Privacy Badges for Agent 7 */}
              {id === 'a7' && status === AgentStatus.COMPLETED && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-600 text-white flex items-center gap-1 shadow-sm shadow-red-100">
                  SHIELDED
                </span>
              )}

              {/* Memory Badges for Agent 8 */}
              {id === 'a8' && status === AgentStatus.COMPLETED && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-400 text-white flex items-center gap-1 shadow-sm shadow-blue-50">
                  HISTORY SYNC
                </span>
              )}

              {/* Drafter Badges for Agent 9 */}
              {id === 'a9' && status === AgentStatus.COMPLETED && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white flex items-center gap-1 shadow-sm shadow-rose-100">
                  TEMPLATE READY
                </span>
              )}

              {/* Arbiter Badges for Agent 10 */}
              {id === 'a10' && status === AgentStatus.COMPLETED && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700 text-white flex items-center gap-1 shadow-sm shadow-slate-100">
                  CONFLICT RESOLVED
                </span>
              )}
              {status === AgentStatus.WORKING && (
                <div className="flex gap-1 items-center px-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-0"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-300"></span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {status === AgentStatus.COMPLETED && (
            <div className="bg-green-100 p-2 rounded-full animate-zoom-in-bounce">
              <ICONS.Check className="text-green-600" size={18} />
            </div>
          )}
          {status === AgentStatus.ERROR && (
            <div className="bg-red-100 p-2 rounded-full animate-shake">
              <ICONS.Alert className="text-red-600" size={18} />
            </div>
          )}
        </div>
      </div>

      <p className={`text-xs mb-5 leading-relaxed font-medium ${status === AgentStatus.IDLE ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>

      <div className="mt-auto">
        {result ? (
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 animate-slide-up ${style.result} ${isKnowledgeError ? 'ring-2 ring-red-500/20' : ''}`}>
            {isKnowledgeError ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600">
                  <ICONS.Shield size={14} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Grounding Failure Detected</span>
                </div>
                <div className="p-3 bg-white/60 rounded-lg border border-red-200">
                  <p className="text-[11px] font-bold text-red-800 mb-1 leading-snug">
                    Compliance Threshold: Confidence &lt; 0.7
                  </p>
                  <p className="text-[10px] text-red-600 opacity-90 leading-relaxed italic">
                    {result}
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">Recommended Remediation:</span>
                  <ul className="text-[9px] text-red-500/80 list-disc list-inside">
                    <li>Check Knowledge Source connections</li>
                    <li>Verify document classification levels</li>
                    <li>Refine user prompt for better grounding</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 border-b border-gray-200/50 pb-2">
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">Log Data Stream</span>
                  <span className="text-[9px] mono font-bold opacity-30">TX: {Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
                </div>
                <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  <pre className="whitespace-pre-wrap break-words mono text-[10px] leading-relaxed">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 group hover:bg-white transition-colors">
            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] group-hover:text-gray-400 transition-colors">
              Waiting for Dispatch
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCard;
