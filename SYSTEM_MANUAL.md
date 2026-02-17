# 📖 Arfanity Core Orchestrator: System Manual v3.5-PROD

## 🎯 Introduction
The **Arfanity Core Orchestrator** is a production-grade multi-layered AI system designed for secure, grounded, and governed intelligence. This manual explains how to operate the system, manage data, and interpret results in the v3.5-PROD environment.

---

## 🚀 Getting Started

### 1. Connecting Knowledge Sources
The orchestrator relies on your data for grounding. Without it, the system will enter a "Safe Mode" and refuse to speculate.
- **How to Connect**: Use the **"Connect Source"** button in the sidebar.
- **Supported Formats**: PDF, DOCX, and raw Text (via Paste).
- **Verification**: Once connected, you will see the documents listed in the sidebar with a **"Connected"** status. The **RAG Engine (A2)** will automatically sync these for grounding.

### 2. Selecting Your Engine
You have two ways to interact with Arfanity:
- **Standard Engine (Default)**: Best for quick, conversational queries and single-source lookups using high-performance LLMs.
- **Advanced Engine (LangStack v3.5)**: Click **"Enable Advanced Engine"** to engage the full **10-agent neural pipeline**. Use this for complex, multi-source reasoning, strategic planning, and missions requiring high-fidelity privacy scrubbing.

### 3. AI Registry Management
Switch between AI providers (Gemini, OpenAI, Groq, Anthropic, Ollama) on the fly.
- Click **"AI Registry"** in the header.
- Assign specific providers and models as the system default.
- The system will automatically use your primary choice for both Standard and Advanced missions.

---

## 🏛 The Governance Protocol

### Human-in-the-Loop (HITL)
For high-risk requests (e.g., deleting data, accessing sensitive financial secrets, or large-scale purges), the system will trigger a **Governance Intervention**.
1. **Halt**: The Mission will pause after the **Neural Classifier (A1)** detects critical intent and the **Governance Agent (A3)** performs its risk check.
2. **Review**: A "Governance Intervention Required" box will appear with the reasoning.
3. **Action**: You must manually click **"Approve Access"** or **"Deny Request"**.
4. **Resumption**: Upon approval, the mission will continue to final synthesis and validation.

---

## 🖥 Terminal & Monitoring

### Real-time Logs
The **System Monitor** (Terminal) provides a live stream of what the agents are thinking:
- `[SYSTEM]`: Infrastructure and server-level updates.
- `[MISSION]`: Live agent handovers and neural reasoning logs.
- `[AUDIT]`: Specialized logs from the **Validator (A5)** and **Privacy Shield (A7)**.
- `[SUCCESS/WARN/ERROR]`: Mission status alerts.

---

## 🛡 Privacy & Grounding Protection

### Neural Privacy Shield (A7)
The **Privacy Shield** uses advanced neural scrubbing to redact sensitive information. If the system detects a PII or restricted term, it will replace it with `[REDACTED]` before it reaches your screen.

### Semantic Validator (A5)
Unique to v3.5-PROD, the **Validator** node cross-references the synthesized response against the grounded context. If a hallucination is detected, the agent will attempt to correct the fact or flag it for human review.

---
*For support or configuration help, please contact the Arfanity Core Engineering Team.*
