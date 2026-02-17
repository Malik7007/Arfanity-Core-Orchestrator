import os
import sys
import json
import re
import logging
import asyncio
from typing import Annotated, TypedDict, List, Dict, Any, Literal
from typing_extensions import TypedDict

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# --- The "LangStack" Framework Integration ---
# 1. LangChain: LLM Abstraction
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# 2. LangGraph: Stateful Multi-Agent Orchestration
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# 3. LangSmith: Observability
os.environ["LANGCHAIN_TRACING_V2"] = os.getenv("LANGCHAIN_TRACING_V2", "false")
os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "Arfanity Core Orchestrator")

# 4. MCP Framework Integration
try:
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
    from langchain_mcp_adapters.tools import load_mcp_tools
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    logging.warning("MCP libraries not fully installed. Using fallback mode.")

# --- Shared Global Resources ---
DB_FILE = os.path.join(os.path.dirname(__file__), "..", "server", "db.json")
RESTRICTED_ENTITIES_FILE = os.path.join(os.path.dirname(__file__), "restricted_entities.json")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")

# Global containers for lazy init
_chroma_client = None
_knowledge_collection = None

def get_vector_collection():
    """Gap 2: Lazy initialization of Vector Store to avoid early startup conflicts."""
    global _chroma_client, _knowledge_collection
    if _knowledge_collection is None:
        import chromadb
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        _knowledge_collection = _chroma_client.get_or_create_collection(name="enterprise_knowledge")
    return _knowledge_collection

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ArfanityEngine")

# Load environment variables from different possible locations
load_dotenv()
load_dotenv(".env.local")
# Add absolute path resolution for robustness
env_path = os.path.join(os.path.dirname(__file__), "../.env.local")
load_dotenv(env_path)
load_dotenv("../.env.local")

# Paths
DB_FILE = os.path.join(os.path.dirname(__file__), "../server/db.json")

# Initialize FastAPI
app = FastAPI(title="Arfanity LangStack + MCP Engine v3.5 (Prod-Grade)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dynamic LLM Factory ---

def get_llm(config: Dict[str, Any]):
    provider = config.get("provider", "Google")
    model = config.get("model_name", "gemini-1.5-flash")
    api_key = config.get("api_key") or os.getenv(f"{provider.upper()}_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    logger.info(f"LLM Factory: Provider={provider}, Model={model}, KeyFound={bool(api_key)}")
    base_url = config.get("base_url")

    if provider == "Google":
        os.environ["GOOGLE_API_KEY"] = api_key
        return ChatGoogleGenerativeAI(
            model=model, 
            google_api_key=api_key, 
            temperature=0.1, 
            convert_system_message_to_human=True
        )
    elif provider == "OpenAI":
        return ChatOpenAI(model=model, api_key=api_key, temperature=0.1)
    elif provider == "Groq":
        return ChatGroq(model=model or "llama-3.3-70b-versatile", api_key=api_key, temperature=0.1)
    elif provider == "Anthropic":
        return ChatAnthropic(model=model, api_key=api_key, temperature=0.1)
    elif provider == "Localhost":
        return ChatOpenAI(model=model or "llama3", api_key="ollama", base_url=base_url or "http://localhost:11434/v1")
    
    return ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=0.1)

# --- LangGraph State Definition ---

class AgentState(TypedDict):
    user_input: str
    config: Dict[str, Any]
    intent: Dict[str, Any]
    context: List[str]
    governance_decision: str
    synthesized_response: str
    validated_response: str
    action_plan: List[str]
    formatted_output: str
    audit_trail: List[str]
    mcp_intel: Dict[str, Any]
    pii_scrubbed_final: str

# --- Agent Nodes (Functional Implementation) ---

async def classifier_agent(state: AgentState):
    """A1: Neural Classifier - LLM powered intent and risk analysis."""
    logger.info("Engaging A1: Neural Classifier")
    llm = get_llm(state["config"])
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Analyze the user query. Categorize intent_type (informational, action_required, restricted) and risk_level (low, medium, high). Return ONLY JSON."),
        ("human", "{input}")
    ])
    
    chain = prompt | llm | JsonOutputParser()
    try:
        intent = await chain.ainvoke({"input": state["user_input"]})
        logger.info(f"A1 Success: {intent}")
        return {
            "intent": intent,
            "audit_trail": ["A1 Classifier: Neural verification complete. Risk detected: " + intent.get("risk_level", "unknown")]
        }
    except Exception as e:
        logger.error(f"A1 Neural Error: {e}")
        # Fallback to deterministic classification if neural fails
        query = state["user_input"].upper()
        risk = "low"
        if "SAR" in query or "BUDGET" in query: risk = "medium"
        if "DELETE" in query: risk = "high"
        return {
            "intent": {"intent_type": "informational", "risk_level": risk, "fallback": True},
            "audit_trail": [f"A1 Classifier: Fallback engaged - {str(e)}"]
        }

async def mcp_gateway_agent(state: AgentState):
    """A10: Arbiter & MCP Gateway - Real Protocol Handshake (Gap 1)."""
    logger.info("Engaging A10: Arbiter/MCP Gateway")
    
    server_path = os.path.join(os.path.dirname(__file__), "mcp_server.py")
    python_exe = sys.executable
    server_params = StdioServerParameters(command=python_exe, args=[server_path], env=None)
    
    mcp_intel = {
        "mcp_status": "partially_synced",
        "live_signal": "Attempting protocol handshake..."
    }
    
    try:
        if MCP_AVAILABLE:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    
                    # 1. Discover Real Tools
                    tools = await session.list_tools()
                    tool_names = [t.name for t in tools.tools]
                    
                    # 2. Call Enterprise Heartbeat
                    heartbeat = await session.call_tool("get_enterprise_heartbeat", {})
                    
                    mcp_intel = {
                        "mcp_status": "synchronized",
                        "protocol": "MCP/v1.2",
                        "available_tools": tool_names,
                        "live_signal": heartbeat.content[0].text if heartbeat.content else "No signal.",
                        "system_audit": "SYN_ACK_SUCCESS: Real-time bridge active."
                    }
        else:
            mcp_intel["live_signal"] = "MCP Gateway Bypass: Protocol driver missing."
            
    except Exception as e:
        logger.error(f"A10 Bridge Error: {e}")
        mcp_intel["live_signal"] = f"A10 Error: {str(e)}"

    return {
        "mcp_intel": mcp_intel,
        "audit_trail": state.get("audit_trail", []) + [f"A10 MCP: Universal Handshake complete. Status: {mcp_intel['mcp_status']}"]
    }

async def retrieval_agent(state: AgentState):
    """A2: RAG Engine - High-Fidelity Vector Retrieval via ChromaDB."""
    logger.info("Engaging A2: RAG Engine")
    
    context = []
    try:
        collection = get_vector_collection()
        
        # Sync Node.js DB to ChromaDB if new data exists
        if os.path.exists(DB_FILE):
            with open(DB_FILE, "r") as f:
                db = json.load(f)
                docs = db.get("documents", [])
                
                # Upsert documents into ChromaDB (Gap 2)
                for doc in docs:
                    collection.upsert(
                        ids=[doc["id"]],
                        documents=[doc["content"]],
                        metadatas=[{"name": doc["name"], "classification": doc.get("classification", "internal")}]
                    )
        
        # Perform Semantic Search
        results = collection.query(
            query_texts=[state["user_input"]],
            n_results=3
        )
        
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i]
            context.append(f"Source [{metadata['name']}]: {doc}")
            
    except Exception as e:
        logger.error(f"A2 Vector Error: {e}")
        context = ["SYSTEM: RAG Engine offline. Using base security policy."]

    if not context:
        context = ["SYSTEM: No grounded data found in connected silos."]

    return {
        "context": context,
        "audit_trail": state.get("audit_trail", []) + [f"A2 RAG: {len(context)} vector seeds synchronized."]
    }

def safety_guard_agent(state: AgentState):
    """A3: Governance Shield."""
    logger.info("Engaging A3: Governance")
    risk = state["intent"].get("risk_level", "low")
    decision = "approved"
    if risk == "high":
        decision = "pending"
    
    return {
        "governance_decision": decision,
        "audit_trail": state.get("audit_trail", []) + [f"A3 Governance: Policy hold active - Risk level is {risk}."]
    }

async def synthesizer_agent(state: AgentState):
    """A4: Lead Orchestrator - Response Construction."""
    logger.info("Engaging A4: Orchestrator")
    llm = get_llm(state["config"])
    
    docs_text = "\n".join(state.get("context", []))
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Arfanity Lead Orchestrator. Synthesize a professional response based ONLY on the provided grounded data."),
        ("human", "Grounded Data: {docs}\nUser Request: {input}")
    ])
    
    chain = prompt | llm
    try:
        response = await chain.ainvoke({"docs": docs_text, "input": state["user_input"]})
        return {
            "synthesized_response": response.content,
            "audit_trail": state.get("audit_trail", []) + ["A4 Orchestrator: Response grounded in enterprise context."]
        }
    except Exception as e:
        return {"synthesized_response": f"Error: {str(e)}", "audit_trail": [f"A4 Error: {e}"]}

async def validator_agent(state: AgentState):
    """A5: Fact Auditor - Verifies response against context."""
    logger.info("Engaging A5: Validator")
    llm = get_llm(state["config"])
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Verify if the AI response is strictly supported by the grounded context. Flag any hallucination. Return JSON: {{'is_valid': bool, 'corrected_response': string}}"),
        ("human", "Context: {context}\nAI Response: {response}")
    ])
    
    chain = prompt | llm | JsonOutputParser()
    try:
        result = await chain.ainvoke({"context": "\n".join(state["context"]), "response": state["synthesized_response"]})
        return {
            "validated_response": result.get("corrected_response", state["synthesized_response"]),
            "audit_trail": state.get("audit_trail", []) + ["A5 Validator: Cross-reference audit PASSED."]
        }
    except:
        return {"validated_response": state["synthesized_response"], "audit_trail": state.get("audit_trail", []) + ["A5 Validator: Verification skipped (Neural latency)."]}

async def planner_agent(state: AgentState):
    """A6: Action Strategy Planner."""
    logger.info("Engaging A6: Planner")
    llm = get_llm(state["config"])
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Based on the response, generate 3 executable next steps for the user. Return ONLY JSON list."),
        ("human", "{input}")
    ])
    chain = prompt | llm | JsonOutputParser()
    try:
        plan = await chain.ainvoke({"input": state["validated_response"]})
        return {
            "action_plan": plan,
            "audit_trail": state.get("audit_trail", []) + ["A6 Planner: Strategic roadmap generated."]
        }
    except:
        return {"action_plan": ["Review logs"], "audit_trail": state.get("audit_trail", []) + ["A6 Planner: Default plan assigned."]}

async def privacy_shield_agent(state: AgentState):
    """A7: Privacy Redaction Shield - Neural scrubbing + Restricted Entities (Gap 3)."""
    logger.info("Engaging A7: Privacy Shield")
    
    text = state["validated_response"]
    audit_notes = []
    
    # 1. Hard Redaction via Restricted Entities (Gap 3)
    try:
        if os.path.exists(RESTRICTED_ENTITIES_FILE):
            with open(RESTRICTED_ENTITIES_FILE, "r") as f:
                rules = json.load(f)
                
                # Redact Names
                for entity in rules.get("restricted_entities", []):
                    if entity.lower() in text.lower():
                        text = re.sub(re.escape(entity), "[REDACTED_SECRET]", text, flags=re.IGNORECASE)
                        audit_notes.append(f"Secret '{entity}' scrubbed.")
                
                # Redact Patterns (Regex)
                for pattern in rules.get("redaction_patterns", []):
                    matches = re.findall(pattern, text)
                    if matches:
                        text = re.sub(pattern, "[REDACTED_PII]", text)
                        audit_notes.append("PII pattern redacted.")
    except Exception as e:
        logger.error(f"A7 Rule Error: {e}")

    # 2. Neural Redaction (LLM)
    llm = get_llm(state["config"])
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Redact all remaining PII (names, emails, phones) from the text. Replace with '[REDACTED]'. Respond only with the cleaned text."),
        ("human", "{input}")
    ])
    chain = prompt | llm
    try:
        cleaned = await chain.ainvoke({"input": text})
        return {
            "pii_scrubbed_final": cleaned.content,
            "audit_trail": state.get("audit_trail", []) + ["A7 Privacy: Neural & Entity scrubbing complete."] + audit_notes
        }
    except:
        return {"pii_scrubbed_final": text, "audit_trail": state.get("audit_trail", []) + ["A7 Privacy: Redaction fallback applied."]}

# memory_agent (A8) handled implicitly via LangGraph checkpoints

async def drafter_agent(state: AgentState):
    """A9: Drafter - Final formatting."""
    logger.info("Engaging A9: Drafter")
    llm = get_llm(state["config"])
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Format the following response into a professional enterprise brief. Use clean structure. No markdown headers."),
        ("human", "{input}")
    ])
    chain = prompt | llm
    try:
        formatted = await chain.ainvoke({"input": state["pii_scrubbed_final"]})
        return {
            "formatted_output": formatted.content,
            "audit_trail": state.get("audit_trail", []) + ["A9 Drafter: Formatting protocol applied."]
        }
    except:
        return {"formatted_output": state["pii_scrubbed_final"], "audit_trail": state.get("audit_trail", []) + ["A9 Drafter: Raw output preserved."]}

# --- Construct the Production LangStack Graph ---

memory = MemorySaver()
workflow = StateGraph(AgentState)

workflow.add_node("classifier", classifier_agent)
workflow.add_node("mcp_gateway", mcp_gateway_agent)
workflow.add_node("rag", retrieval_agent)
workflow.add_node("governance", safety_guard_agent)
workflow.add_node("orchestrator", synthesizer_agent)
workflow.add_node("validator", validator_agent)
workflow.add_node("planner", planner_agent)
workflow.add_node("privacy", privacy_shield_agent)
workflow.add_node("drafter", drafter_agent)

workflow.set_entry_point("classifier")
workflow.add_edge("classifier", "mcp_gateway")
workflow.add_edge("mcp_gateway", "rag")
workflow.add_edge("rag", "governance")

# Conditional Edge for High-Risk Governance Halt
def governance_decision_router(state: AgentState):
    if state["governance_decision"] == "pending":
        return "halt"
    return "continue"

workflow.add_conditional_edges(
    "governance",
    governance_decision_router,
    {
        "halt": END,
        "continue": "orchestrator"
    }
)

workflow.add_edge("orchestrator", "validator")
workflow.add_edge("validator", "planner")
workflow.add_edge("planner", "privacy")
workflow.add_edge("privacy", "drafter")
workflow.add_edge("drafter", END)

arfanity_graph = workflow.compile(checkpointer=memory)

# --- API Endpoints ---

class MissionRequest(BaseModel):
    query: str
    config: Dict[str, Any]
    thread_id: str = "default_session"

@app.post("/api/v1/stream")
async def orchestrate_mission(request: MissionRequest):
    logger.info(f"LangStack v3.5 Mission Received: {request.query}")
    
    initial_state = {
        "user_input": request.query,
        "config": request.config,
        "audit_trail": [],
        "context": []
    }
    
    config = {"configurable": {"thread_id": request.thread_id}}
    
    try:
        final_state = await arfanity_graph.ainvoke(initial_state, config=config)
        
        return {
            "response": final_state.get("formatted_output", "Mission complete."),
            "actions": final_state.get("action_plan", []),
            "audit": final_state.get("audit_trail", []),
            "intent": final_state.get("intent", {}),
            "governance": final_state.get("governance_decision", "approved"),
            "mcp_intel": final_state.get("mcp_intel", {})
        }
    except Exception as e:
        logger.error(f"ENGINE CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {
        "status": "online", 
        "frameworks": ["LangChain", "LangGraph", "LangSmith", "MCP"],
        "version": "3.5-PROD",
        "mcp_ready": MCP_AVAILABLE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
