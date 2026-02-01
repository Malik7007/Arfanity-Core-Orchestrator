
export enum IntentType {
  INFORMATIONAL = 'informational',
  OPERATIONAL = 'operational',
  DECISION_SUPPORT = 'decision_support',
  APPROVAL_REQUIRED = 'approval_required',
  RESTRICTED = 'restricted',
  CONVERSATIONAL = 'conversational'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ActionType {
  AUTO_RESPOND = 'auto_respond',
  RETRIEVE_AND_RESPOND = 'retrieve_and_respond',
  ESCALATE_FOR_APPROVAL = 'escalate_for_approval',
  DENY_AND_EXPLAIN = 'deny_and_explain'
}

export type AIProviderType = 'Google' | 'OpenAI' | 'OpenRouter' | 'Localhost' | 'Anthropic' | 'Groq';

export interface AIModelConfiguration {
  id: string;
  name: string;
  provider: AIProviderType;
  modelName: string;
  baseUrl?: string;
  apiKey?: string;
  isDefault: boolean;
  capabilities: ('text' | 'vision' | 'audio' | 'function_calling')[];
  availableModels?: string[]; // Added to support dropdown selection
}

export type KnowledgeSourceType = 'SharePoint' | 'Local' | 'OneDrive' | 'Database' | 'Dataverse' | 'AzureSQL' | 'Upload' | 'Paste';

export interface KnowledgeConnection {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  config: Record<string, string>;
  lastSync: string;
  recordCount: number;
}

export interface IntentClassification {
  intent_type: IntentType;
  risk_level: RiskLevel;
  confidence_score: number;
  recommended_action: ActionType;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  classification: 'Public' | 'Internal' | 'Restricted';
  source: KnowledgeSourceType;
  lastSynced?: string;
}

export enum AgentStatus {
  IDLE = 'idle',
  WORKING = 'working',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
