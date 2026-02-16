# 🌌 Arfanity Core Orchestrator v2.7

![Arfanity AI Agent Factory Banner](/assets/banner.png)

## 🏢 Enterprise Vision
**Arfanity Core Orchestrator** is a state-of-the-art, multi-agent AI framework engineered for high-stakes enterprise workflows. It serves as the intelligent backbone of the Arfanity ecosystem, transforming raw organizational data into governed, actionable insights through a sophisticated sequence of specialized AI agents.

This platform isn't just a chatbot; it is a **Grounded Reasoning Engine** that ensures every response is anchored in verified documentation, filtered for privacy, and audited for compliance.

---

## ⚡ Key Architectural Pillars

### 1. Governed Multi-Agent Workflow (LangGraph)
The system features a dual-engine architecture. While the standard flow handles rapid requests, the **Advanced LangGraph Engine** (Python-based) enables stateful, cyclic reasoning across 10 specialized agents for complex problem-solving.

### 2. Deep RAG (Retrieval-Augmented Generation)
Dynamic ingestion of enterprise knowledge (PDF, DOCX, and Text) with semantic grounding. The system effectively prevents AI hallucinations by strictly enforcing document citation requirements.

### 3. Universal AI Registry
A modular provider layer allowing seamless switching between high-performance LLMs:
*   **Google Gemini 1.5 Pro/Flash** (Primary)
*   **OpenAI GPT-4o**
*   **Anthropic Claude via OpenRouter**
*   **Local Models** (Ollama/Llama 3.1)

---

## 🤖 Meet the Agent Squad
Every request triggers a "Mission" where each agent performs a specific role:

| Agent | Designation | Core Responsibility |
| :--- | :--- | :--- |
| **A1** | **Classifier** | Analyzes intent, detects risk levels, and categorizes requests. |
| **A2** | **RAG Engine** | Performs deep semantic search across attached enterprise knowledge. |
| **A3** | **Governance** | Enforces compliance holds and manages Human-in-the-Loop approvals. |
| **A4** | **Orchestrator** | Synthesizes complex findings into a professional, fluid narrative. |
| **A5** | **Validator** | Cross-references the final response against source facts to ensure accuracy. |
| **A6** | **Planner** | Generates concrete, executable next steps based on the output. |
| **A7** | **Privacy Shield** | Scans for and redacts sensitive PII or internal entity names. |
| **A8** | **Context Memory** | Maintains session coherence and cross-references historical interactions. |
| **A9** | **Drafter** | Formats the final response into enterprise templates (Briefs, Emails, Alerts). |
| **A10** | **Arbiter** | Resolves factual conflicts when multiple data sources provide overlapping data. |

---

## 🎨 Premium Experience & UX
*   **Glassmorphic Design**: A sleek, modern UI featuring blurred backgrounds, vibrant gradients, and premium typography.
*   **3D Agent Avatars**: Custom-generated 3D avatars for each agent with real-time status indicators.
*   **System Monitor**: A real-time, low-level debug terminal showing every API call, latency metric, and token count.
*   **Vocalize Engine**: High-fidelity speech synthesis to read out verified delivery responses.
*   **Adaptive Theme**: Optimized for professional focus with high-contrast elements and smooth micro-animations.

---

## 🛠 Tech Stack
*   **Frontend**: React 19 (TSX), Vite, Tailwind CSS (Vanilla PostCSS), Framer Motion.
*   **Orchestration Engine**: **LangGraph** & **LangChain** (Python 3.14).
*   **Primary AI**: Google Generative AI (Gemini SDK).
*   **Hybrid Backend**: 
    *   **Node.js/Express**: Manages document ingestion, parsing, and UI state.
    *   **Python/FastAPI**: Powers the advanced multi-agent orchestration graph.
*   **State Management**: LocalStorage Persistence and Pythonic Agent State.

---

## 🚀 Installation & Deployment

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   API Key for Google Gemini (configured in `.env.local`)

### Setup Instructions
1. **Clone the Repository**
2. **Setup JavaScript Environment**:
   ```bash
   npm install
   ```
3. **Setup Python Virtual Environment & Dependencies**:
   ```bash
   # This automatically creates a venv and installs LangGraph/LangChain
   npm run setup:py
   ```
4. **Configure Environment**:
   Create a `.env.local` in the root:
   ```env
   VITE_GOOGLE_API_KEY=your_key_here
   ```
5. **Launch the Full Ecosystem**:
   To start the Frontend, Node.js Data Server, and Python LangGraph Engine simultaneously:
   ```bash
   npm run dev:full
   ```

---

## 🛡 Security & Grounding Policy
Arfanity Core Orchestrator operates on a **Safe-by-Design** principle. If no knowledge base is attached, the system strictly halts the RAG sequence, informing the user that "Knowledge is not attached." This ensures the AI never "guesses" enterprise policy from its base training data.

---
*Built with excellence by the Arfanity AI Team.*
