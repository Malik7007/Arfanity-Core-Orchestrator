# 🌌 Arfanity Core Orchestrator v3.5-PROD
![Arfanity AI Agent Factory Banner](/assets/banner.png)

## 🏢 Enterprise Vision
**Arfanity Core Orchestrator** is a production-grade, stateful multi-agent AI framework engineered for high-stakes enterprise workflows. It serves as the intelligent backbone of the Arfanity ecosystem, transforming raw organizational data into governed, actionable insights through the **LangStack** methodology.

This platform isn't just a chatbot; it is a **Neural Reasoning Engine** that ensures every response is anchored in verified documentation, filtered for privacy, and audited for truthfulness by a dedicated semantic validation layer.

---

## ⚡ Key Architectural Pillars (The LangStack)

### 1. Neural Multi-Agent Orchestration (LangGraph)
**v3.5 Upgrade**: Transitioned from deterministic logic to a **Neural Classification** model. The system now utilizes stateful, cyclic reasoning across 10 specialized agents, with persistent session memory enabled by LangGraph checkpoints.

### 2. Universal Model Context Protocol (MCP)
Integrated the **Model Context Protocol (MCP)** as a first-class citizen. This allows our agents to universalize tool and data access across disparate enterprise silos (GitHub, Slack, SQL, etc.) using a standardized, secure communication protocol.

### 3. Deep Semantic RAG & Grounding
Dynamic ingestion of enterprise knowledge (PDF, DOCX, and Text) with high-fidelity semantic grounding. The system effectively prevents AI hallucinations by strictly enforcing document citation and cross-verifying facts through the **Validator (Agent 5)**.

### 4. Enterprise Observability (LangSmith)
Full production-grade tracing for every agent interaction. Every "Mission" is recorded in LangSmith, providing deep audit trails, cost analysis, and performance optimization for your neural pipeline.

---

## 🤖 Meet the Agent Squad
Every request triggers a "Mission" where each agent performs a specific role:

| Agent | Designation | Core Responsibility |
| :--- | :--- | :--- |
| **A1** | **Neural Classifier** | Uses cognitive analysis to detect intent, risk levels, and categorize requests. |
| **A2** | **RAG Engine** | Performs deep semantic search across attached enterprise knowledge and MCP data. |
| **A3** | **Governance** | Enforces compliance holds and manages Human-in-the-Loop approvals for high-risk ops. |
| **A4** | **Lead Orchestrator** | synthesizes complex findings into a professional, grounded enterprise narrative. |
| **A5** | **Semantic Validator** | Truth-audits the response against source facts to eliminate hallucinations. |
| **A6** | **Action Planner** | Generates concrete, executable strategic roadmaps based on verified output. |
| **A7** | **Privacy Shield** | Scans for and redacts sensitive PII or internal entity names using neural scrubbing. |
| **A8** | **Memory Node** | Maintains deep session coherence and historical context via persistence layer. |
| **A9** | **Drafter** | Formats final output into enterprise templates (Briefs, Emails, Alerts). |
| **A10** | **Arbiter & MCP Gateway** | Universalizes tool access and resolves factual conflicts between disparate sources. |

---

## 🛠 Tech Stack
*   **Frontend**: React 19 (TSX), Vite, Tailwind CSS, Framer Motion.
*   **Orchestration Engine**: **LangGraph** & **LangChain**.
*   **Protocol Layer**: **Model Context Protocol (MCP)** via `fastmcp`.
*   **Hybrid Backend**: 
    *   **Node.js/Express**: Document ingestion, parsing, and UI state.
    *   **Python/FastAPI**: Powers the advanced multi-agent orchestration graph.
*   **Observability**: **LangSmith** Tracing.

---

## 🚀 Installation & Deployment

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   API Keys (Google, OpenAI, Groq, etc.)

### Setup Instructions
1. **Clone the Repository**
2. **Setup JavaScript Environment**: `npm install`
3. **Setup Python Environment**: `npm run setup:py`
4. **Launch the Full Ecosystem**: `npm run dev:full`

---

## � Documentation & Manuals
For more in-depth information, please refer to:
- **[System Architecture](SYSTEM_ARCHITECTURE.md)**: Deep dive into the LangGraph & MCP flow.
- **[MCP Integration Guide](MCP_INTEGRATION.md)**: How to connect new enterprise tools.
- **[System Manual](SYSTEM_MANUAL.md)**: User guide for operators and admins.

---
*Built with excellence by the Arfanity AI Team.*
