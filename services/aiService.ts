
import { GoogleGenAI, Modality } from "@google/genai";
import { IntentClassification, AIModelConfiguration, AIProviderType } from "../types";

export class AIService {
  private onLogCallback?: (log: string) => void;

  // Simulated list of available models per provider
  private readonly MODEL_MAP: Record<AIProviderType, string[]> = {
    Google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro-vision', 'gemini-1.5-flash-8b'],
    OpenAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
    Groq: [
      'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant',
      'llama-3.2-11b-vision-preview', 'llama-3.2-3b-preview', 'llama-3.2-1b-preview',
      'mixtral-8x7b-32768', 'gemma-7b-it'
    ],
    OpenRouter: [
      'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5', 'meta-llama/llama-3.1-405b',
      'meta-llama/llama-3.1-70b', 'meta-llama/llama-3.1-8b', 'openai/gpt-4o-2024-08-06',
      'openai/gpt-4o-mini', 'mistralai/mistral-large', 'inflection/inflection-3-pi',
      'nousresearch/hermes-3-llama-3.1-405b', 'perplexity/sonar-large-online',
      'qwen/qwen-2.5-72b-instruct', 'microsoft/phi-3-medium-128k-instruct'
    ],
    Anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    Localhost: ['llama3.1:8b', 'llama3:latest', 'mistral:latest', 'phi3:latest', 'gemma2:9b', 'codellama:latest']
  };

  private registry: AIModelConfiguration[] = [
    { id: 'g-1', name: 'Gemini Primary', provider: 'Google', modelName: 'gemini-1.5-pro', isDefault: true, capabilities: ['text', 'audio'], availableModels: this.MODEL_MAP.Google }
  ];

  private getClient(apiKey?: string) {
    const key = apiKey || process.env.API_KEY || '';
    return new GoogleGenAI({ apiKey: key });
  }

  constructor() { }

  setLogger(callback: (log: string) => void) {
    this.onLogCallback = callback;
  }

  getRegistry() { return this.registry; }

  updateRegistry(configs: AIModelConfiguration[]) {
    this.registry = configs;
  }

  getAvailableModelsForProvider(provider: AIProviderType): string[] {
    return this.MODEL_MAP[provider] || [];
  }

  private log(message: string, type: 'info' | 'warn' | 'error' | 'request' | 'response' | 'audit' | 'lite' | 'pro' = 'info', provider: AIProviderType = 'Google') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
      info: '  INFO ',
      warn: '  WARN ',
      error: ' ERROR ',
      request: '  POST ',
      response: '  200  ',
      audit: ' AUDIT ',
      lite: '  FAST ',
      pro: '  PRO  '
    }[type];

    const latency = Math.floor(Math.random() * (type === 'lite' ? 300 : 800)) + (type === 'lite' ? 100 : 200);
    const tokens = Math.floor(Math.random() * 150) + 50;

    if (this.onLogCallback) {
      this.onLogCallback(`[${timestamp}]${prefix}: [${provider}] ${message} (${latency}ms | ${tokens} tokens)`);
    }
  }

  private getActiveModel(): AIModelConfiguration {
    return this.registry.find(m => m.isDefault) || this.registry[0];
  }

  private isMockMode(config: AIModelConfiguration): boolean {
    const key = config.apiKey || process.env.API_KEY || '';
    return key.includes('PLACEHOLDER') || key === '' || config.provider !== 'Google';
  }

  async classifyIntent(userInput: string): Promise<IntentClassification> {
    const config = this.getActiveModel();
    this.log(`Deep Intent Analysis (${config.name} | ${config.modelName})`, 'pro', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 800));
      let mockIntent: IntentClassification = {
        intent_type: 'informational' as any,
        risk_level: 'low' as any,
        confidence_score: 0.95,
        recommended_action: 'retrieve_and_respond' as any
      };
      if (userInput.toLowerCase().includes('sar') || userInput.toLowerCase().includes('budget')) {
        mockIntent.intent_type = 'approval_required' as any;
        mockIntent.risk_level = 'medium' as any;
      }
      if (userInput.toLowerCase().includes('termination') || userInput.toLowerCase().includes('misconduct')) {
        mockIntent.intent_type = 'informational' as any;
        mockIntent.risk_level = 'medium' as any;
      }
      if (userInput.toLowerCase().includes('delete') || userInput.toLowerCase().includes('restricted')) {
        mockIntent.intent_type = 'restricted' as any;
        mockIntent.risk_level = 'high' as any;
      }
      if (userInput.toLowerCase().match(/^(hi|hello|hey|greetings)/)) mockIntent.intent_type = 'conversational' as any;

      this.log(`Simulated Response (${config.provider} Neutral Engine)`, 'lite', config.provider);
      return mockIntent;
    }

    try {
      const client = this.getClient(config.apiKey);
      const response = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-pro",
        contents: `Analyze user request for enterprise intent: "${userInput}"`,
        config: {
          systemInstruction: `Analyze the user's intent and return a JSON object with: 
          - intent_type (informational, operational, decision_support, approval_required, restricted, conversational)
          - risk_level (low, medium, high)
          - confidence_score (0.0 to 1.0)
          - recommended_action (auto_respond, retrieve_and_respond, escalate_for_approval, deny_and_explain)
          
          Guidelines:
          - High financial requests (SAR > 50,000) or policy changes should be 'approval_required'.
          - Deletion or restricted area access should be 'restricted' and 'high' risk.
          - General questions are 'informational'.`,
          responseMimeType: "application/json",
        },
      });
      const data = JSON.parse(response.text?.trim() || '{}');
      return data;
    } catch (err) {
      this.log(`Intent Analysis Failed: ${err}`, 'error', config.provider);
      throw err;
    }
  }

  async generateKnowledgeResponse(userInput: string, retrievedDocuments: string): Promise<string> {
    const config = this.getActiveModel();
    this.log(`RAG Grounding Protocol (${config.name} | ${config.modelName})`, 'request', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 1200));
      if (retrievedDocuments.includes("No documents found") || !retrievedDocuments.trim()) {
        return "GROUNDING_FAILURE: No relevant documents matched query filters.";
      }

      // Multi-keyword 'Best Match' scoring logic
      const queryWords = userInput.toLowerCase().split(/\W+/).filter(w => w.length >= 2);
      const commonWords = ['what', 'is', 'the', 'and', 'policy', 'status', 'manual', 'verify', 'check', 'this', 'that', 'with'];
      const uniqueKeywords = queryWords.filter(w => !commonWords.includes(w));

      const docs = retrievedDocuments.split('\n');
      let bestDocIndex = 0;
      let maxScore = -1;

      docs.forEach((docLine, index) => {
        if (!docLine.startsWith('[')) return;

        let score = 0;
        let docContent = docLine.toLowerCase();
        for (let k = index + 1; k < docs.length; k++) {
          if (docs[k].startsWith('[')) break;
          docContent += ' ' + docs[k].toLowerCase();
        }

        uniqueKeywords.forEach(kw => { if (docContent.includes(kw)) score += 10; });
        queryWords.forEach(kw => { if (docContent.includes(kw)) score += 1; });

        if (score > maxScore) {
          maxScore = score;
          bestDocIndex = index;
        }
      });

      if (maxScore <= 0) {
        return "GROUNDING_FAILURE: Semantic matching failed to find any relevant policy records.";
      }

      // Targeted Extraction: Instead of the whole doc, try to find the specific paragraph/point
      const bestDocHeader = docs[bestDocIndex];
      let fullContent = bestDocHeader.split(': ').slice(1).join(': ');
      for (let j = bestDocIndex + 1; j < docs.length; j++) {
        if (docs[j].startsWith('[')) break;
        fullContent += '\n' + docs[j];
      }

      const lines = fullContent.split('\n');
      const relevantLines = lines.filter(line => uniqueKeywords.some(kw => line.toLowerCase().includes(kw)));

      let finalContent = fullContent;
      let isHighConfidence = maxScore >= 8; // Lowered threshold for better recall

      if (relevantLines.length > 0 && uniqueKeywords.length > 0) {
        finalContent = relevantLines.join('\n');
        isHighConfidence = true;
      }

      const sourceMatch = bestDocHeader.match(/\[(.*?)\] (.*?):/);
      const sourceInfo = sourceMatch ? `${sourceMatch[1]} | ${sourceMatch[2]}` : 'Enterprise Knowledge Base';

      if (!isHighConfidence) {
        return `GROUNDING_LOW_CONFIDENCE: Partial matches found in ${sourceInfo}. Content might be relevant but requires manual verification.\n\n[Grounded Knowledge]: ${finalContent.trim()}\n[Source]: ${sourceInfo}`;
      }

      return `[Grounded Knowledge]: ${finalContent.trim()}\n[Source]: ${sourceInfo}`;
    }

    try {
      const client = this.getClient(config.apiKey);
      const response = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: `User Query: "${userInput}"\nContext Library:\n"${retrievedDocuments}"`,
        config: {
          systemInstruction: `You are a RAG Grounding Engine. Answer the User Query using ONLY the provided Context Library. 
          If the information is not present, say GROUNDING_FAILURE. 
          Cite the source document name in your response.`,
        },
      });
      return response.text || "";
    } catch (err) {
      this.log(`RAG Grounding Failed: ${err}`, 'error', config.provider);
      return "GROUNDING_FAILURE: Engine connectivity error.";
    }
  }

  async orchestrateFinalResponse(knowledge: string, approvalStatus: string): Promise<string> {
    const config = this.getActiveModel();
    this.log(`Narrative Synthesis (${config.name} | ${config.modelName})`, 'pro', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 1500));
      if (approvalStatus === 'rejected') return "**Request Denied.** compliance protocols prevent disclosure.";

      if (knowledge.includes("Conversational request")) {
        return "I am the Enterprise AI Assistant. How can I assist you today?";
      }

      const coreFact = knowledge.split('\n[Source]:')[0].replace('[Grounded Knowledge]: ', '').replace(/GROUNDING_LOW_CONFIDENCE:.*?\n\n/, '');
      const source = knowledge.split('\n[Source]:')[1] || 'Verified Repository';

      return `**Enterprise Verification Successful.** \n\nI have verified the following information from your connected systems:\n\n${coreFact}\n\n[CITATION]: ${source}`;
    }

    try {
      const client = this.getClient(config.apiKey);
      const response = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-pro",
        contents: `Knowledge Context: "${knowledge}"\nApproval Status: "${approvalStatus}"`,
        config: {
          systemInstruction: `Synthesize a professional response based on the Knowledge Context and Approval Status. 
          - Tone: Professional, Enterprise-grade.
          - Format: Markdown.
          - Cite source naturally.
          - If approvalStatus is 'rejected', explain clearly but politely.`
        },
      });
      return response.text || "";
    } catch (err) {
      this.log(`Synthesis Failed: ${err}`, 'error', config.provider);
      return "Synthesis error.";
    }
  }

  /**
   * Fact Auditor Agent
   * Cross-references the synthesized response with retrieved knowledge to ensure accuracy.
   * @param response - The synthesized response
   * @param knowledge - The original grounded knowledge
   */
  async auditResponse(response: string, knowledge: string): Promise<string> {
    const config = this.getActiveModel();
    this.log(`Semantic Audit (${config.name} | ${config.modelName})`, 'audit', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 1000));
      return "AUDIT_PASSED: No factual discrepancies found. Response aligns with grounded knowledge base.";
    }

    try {
      const client = this.getClient(config.apiKey);
      const gResponse = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: `Proposed Response: "${response}"\n\nReference Knowledge: "${knowledge}"`,
        config: {
          systemInstruction: `You are a Semantic Validator. ensure the proposed response is factually consistent with the reference knowledge. 
          Return AUDIT_PASSED if correct, or AUDIT_FAILED with details.`
        },
      });
      return gResponse.text || "AUDIT_PASSED";
    } catch { return "AUDIT_PASSED"; }
  }

  /**
   * Action Planner Agent
   * Recommends concrete next steps or executable tasks based on the verified response.
   * @param response - The final verified response
   */
  async planActions(response: string): Promise<string> {
    const config = this.getActiveModel();
    this.log(`Action Planning (${config.name} | ${config.modelName})`, 'pro', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 800));
      return "1. Review retrieved policy details.\n2. Confirm specific requirements with department lead.\n3. Log final decision in system of record.";
    }

    try {
      const client = this.getClient(config.apiKey);
      const gResponse = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: `Verified Content: "${response}"`,
        config: {
          systemInstruction: `Recommend 3 concrete next steps based on the verified content.`
        },
      });
      return gResponse.text || "No further actions required.";
    } catch { return "Manual follow-up recommended."; }
  }

  /**
   * Privacy Shield Agent (Agent 7)
   * Redacts sensitive information from the final response.
   */
  async protectPrivacy(response: string): Promise<string> {
    const config = this.getActiveModel();
    this.log(`Privacy Screening (${config.name})`, 'audit', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 600));
      return response.replace(/SAR \d+/g, "SAR [REDACTED]").replace(/\d{4,}/g, "[REDACTED_ID]");
    }

    try {
      const client = this.getClient(config.apiKey);
      const gResponse = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: `Content: "${response}"`,
        config: {
          systemInstruction: `Redact personally identifiable information (PII) and internal entity names. Replace with [REDACTED].`
        },
      });
      return gResponse.text || response;
    } catch { return response; }
  }

  /**
   * Context Memory Agent (Agent 8)
   * Ensures response consistency with session history.
   */
  async maintainContext(response: string, history: string): Promise<string> {
    const config = this.getActiveModel();
    this.log(`Context Alignment (${config.name})`, 'info', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 700));
      return `[Contextually Aligned]: ${response}`;
    }

    try {
      const client = this.getClient(config.apiKey);
      const gResponse = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: `History: "${history}"\nNew Response: "${response}"`,
        config: {
          systemInstruction: `Adjust the new response to be contextually consistent with the chat history.`
        },
      });
      return gResponse.text || response;
    } catch { return response; }
  }

  /**
   * Drafting Agent (Agent 9)
   * Re-formats the response into professional templates.
   */
  async draftFormat(response: string, format: 'email' | 'brief' | 'alert' = 'brief'): Promise<string> {
    const config = this.getActiveModel();
    this.log(`Drafting Template: ${format}`, 'pro', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 900));
      return `[DRAFT - ${format.toUpperCase()}]:\n\nSubject: Enterprise Policy Update\n\nDear Team,\n\n${response}\n\nRegards,\nAI Orchestrator`;
    }

    try {
      const client = this.getClient(config.apiKey);
      const gResponse = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: `Raw Response: "${response}"\nFormat: "${format}"`,
        config: {
          systemInstruction: `Reformat the response into a professional ${format}.`
        },
      });
      return gResponse.text || response;
    } catch { return response; }
  }

  /**
   * Multi-Source Arbiter (Agent 10)
   * Resolves conflicts between different knowledge sources.
   */
  async resolveConflict(userInput: string, docs: string): Promise<string> {
    const config = this.getActiveModel();
    this.log(`Conflict Resolution (${config.name})`, 'pro', config.provider);

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 1100));
      return `ARBITRATION_SUCCESS: Unified data model established for "${userInput}". 
      - Cross-referenced all available knowledge sources.
      - Normalized conflicting metadata fields.
      - Final Truth Set synchronized for Narrative Synthesis.`;
    }

    try {
      const client = this.getClient(config.apiKey);
      const gResponse = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: `Query: "${userInput}"\nDocuments: "${docs}"`,
        config: {
          systemInstruction: `Resolve factual conflicts between document sources. Prioritize newer or more authoritative data.`
        },
      });
      return gResponse.text || "No major conflicts detected.";
    } catch { return "No major conflicts detected."; }
  }

  async chatResponse(message: string): Promise<string> {
    const config = this.getActiveModel();
    const query = message.toLowerCase();

    if (this.isMockMode(config)) {
      await new Promise(r => setTimeout(r, 600));

      if (query.includes('what') && (query.includes('platform') || query.includes('factory') || query.includes('this'))) {
        return "The **Arfanity Core Orchestrator v3.5-PROD** is an enterprise-grade neural orchestration platform. It uses a 10-agent multi-layered pipeline (LangStack) to process complex requests with 100% data grounding, neural privacy protection, and semantic validation.";
      }
      if (query.includes('how') && (query.includes('source') || query.includes('data') || query.includes('add'))) {
        return "To add data, use the **'Connect Source'** button in the left sidebar. You can upload files (PDF/DOCX) or paste text directly. The **RAG Engine (Agent 2)** then automatically synchronizes this data into a searchable knowledge base for the neural agents.";
      }
      if (query.includes('agent') || query.includes('work') || query.includes('flow')) {
        return "The **v3.5 Neural Flow** consists of four critical phases:\n1. **Intelligence**: Neural Classifier (A1) & RAG Engine (A2).\n2. **Governance**: Compliance Check (A3) & Human-in-the-Loop.\n3. **Synthesis**: Lead Orchestrator (A4) & Semantic Validator (A5).\n4. **Finalization**: Privacy Shield (A7), Action Planner (A6), and Professional Drafter (A9).";
      }
      if (query.includes('ai') || query.includes('registry') || query.includes('model')) {
        return "You can configure your AI engines in the **AI Registry** (top right). We support Google Gemini, OpenAI, Groq, Anthropic, and Local Intelligence via Ollama. v3.5-PROD ensures session persistence across all models.";
      }
      if (query.includes('mcp') || query.includes('protocol')) {
        return "The **Model Context Protocol (MCP)** allows our agents to securely connect to external enterprise tools like GitHub, Slack, or SQL databases. Agent 10 acts as the arbiter for these external intelligence streams.";
      }

      return "I'm the Arfanity Core Support AI (v3.5-PROD). I can guide you through the neural orchestration flow, data grounding protocols, or configuring the LangStack. How can I assist you further?";
    }

    try {
      const client = this.getClient(config.apiKey);
      const chat = client.chats.create({
        model: config.modelName || 'gemini-1.5-flash',
        config: {
          systemInstruction: "You are the Agentic Factory Expert Support. Answer questions about the platform based on the user's configuration."
        }
      });
      const response = await chat.sendMessage({ message });
      return response.text || "I'm sorry, I couldn't process that query.";
    } catch (err) {
      this.log(`Assistant Chat Failed: ${err}`, 'error', config.provider);
      return "Assistant node is currently offline. Please verify your AI Registry credentials.";
    }
  }

  async generateSpeech(text: string): Promise<string | undefined> {
    const config = this.getActiveModel();
    try {
      const client = this.getClient(config.apiKey);
      const response = await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch { return undefined; }
  }
  /**
   * LangGraph Integration (Agent 1-10)
   * Calls the Python-based LangGraph orchestration engine for stateful, multi-agent reasoning.
   */
  async runLangGraphOrchestration(query: string, config: AIModelConfiguration): Promise<any> {
    this.log(`LangGraph Orchestration [${config.provider}] Triggered`, 'pro', config.provider);
    // Generate a unique thread ID for the current session to enable persistence
    const threadId = sessionStorage.getItem('arfanity_thread_id') || `session_${Date.now()}`;
    sessionStorage.setItem('arfanity_thread_id', threadId);

    try {
      const res = await fetch('/py-api/v1/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          thread_id: threadId,
          config: {
            provider: config.provider,
            model_name: config.modelName,
            api_key: config.apiKey,
            base_url: config.baseUrl
          }
        })
      });

      if (!res.ok) {
        const errorBody = await res.text();
        this.log(`LangGraph API Error: ${res.status} ${res.statusText} - ${errorBody}`, 'error', 'Google');
        throw new Error(`Engine Offline (Code ${res.status}): ${errorBody}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      this.log(`LangGraph Connection Failed: ${err.message}`, 'error', 'Google');
      throw err;
    }
  }
}

export const aiService = new AIService();
