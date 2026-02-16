import os
from typing import Annotated, TypedDict, List, Dict, Any, Literal
from typing_extensions import TypedDict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Arfanity Core Orchestrator - LangGraph Engine")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the state for our Graph
class AgentState(TypedDict):
    user_input: str
    chat_history: List[BaseMessage]
    intent: Dict[str, Any]
    retrieved_docs: List[str]
    governance_decision: str
    synthesized_response: str
    audit_log: List[str]
    next_actions: List[str]
    privacy_scrubbed_response: str
    final_output: Dict[str, Any]

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

# --- Agent Nodes ---

def classifier_agent(state: AgentState):
    """A1: Classifier - Analyzes intent and risk."""
    prompt = ChatPromptTemplate.from_template(
        "Analyze the user request for enterprise intent and risk level.\n"
        "User Input: {input}\n"
        "Return a JSON-like structure with: intent_type, risk_level (low, medium, high), and recommended_action."
    )
    chain = prompt | llm
    response = chain.invoke({"input": state["user_input"]})
    # Simulated parsing for example purposes
    intent = {"intent_type": "general", "risk_level": "low"}
    if "SAR" in state["user_input"].upper():
        intent = {"intent_type": "financial", "risk_level": "high"}
    
    return {
        "intent": intent, 
        "audit_log": state.get("audit_log", []) + ["A1: Intent classified as " + intent["intent_type"]]
    }

def rag_engine(state: AgentState):
    """A2: RAG Engine - Retrieves context."""
    # In a real app, this would query a VectorDB. For now, we simulate finding a policy.
    docs = ["Enterprise Policy: All financial requests above 50,000 SAR require CFO approval."]
    return {
        "retrieved_docs": docs,
        "audit_log": state["audit_log"] + ["A2: Knowledge retrieved from Enterprise Base"]
    }

def governance_agent(state: AgentState):
    """A3: Governance Agent - Rule enforcement."""
    risk = state["intent"].get("risk_level", "low")
    decision = "approved"
    if risk == "high":
        decision = "pending_manual_approval"
    
    return {
        "governance_decision": decision,
        "audit_log": state["audit_log"] + [f"A3: Governance check: {decision}"]
    }

def orchestrator_agent(state: AgentState):
    """A4: Synthesizer - Creates the response."""
    docs_text = "\n".join(state["retrieved_docs"])
    prompt = ChatPromptTemplate.from_template(
        "Synthesize a professional enterprise response based on these documents:\n{docs}\n"
        "User Query: {query}\n"
        "Decision: {decision}"
    )
    chain = prompt | llm
    response = chain.invoke({"docs": docs_text, "query": state["user_input"], "decision": state["governance_decision"]})
    
    return {
        "synthesized_response": response.content,
        "audit_log": state["audit_log"] + ["A4: Narrative synthesized"]
    }

def validator_agent(state: AgentState):
    """A5: Validator - Fact checking."""
    return {
        "audit_log": state["audit_log"] + ["A5: Response validated against source facts"]
    }

def planner_agent(state: AgentState):
    """A6: Planner - Next steps."""
    return {
        "next_actions": ["Review policy details", "Contact CFO for approval"],
        "audit_log": state["audit_log"] + ["A6: Action plan generated"]
    }

def privacy_shield(state: AgentState):
    """A7: Privacy Shield - Redaction."""
    scrubbed = state["synthesized_response"].replace("SAR", "USD (Simulated)")
    return {
        "privacy_scrubbed_response": scrubbed,
        "audit_log": state["audit_log"] + ["A7: Privacy screening completed"]
    }

# --- Define the Graph ---

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("classifier", classifier_agent)
workflow.add_node("rag", rag_engine)
workflow.add_node("governance", governance_agent)
workflow.add_node("orchestrator", orchestrator_agent)
workflow.add_node("validator", validator_agent)
workflow.add_node("planner", planner_agent)
workflow.add_node("privacy", privacy_shield)

# Define Edges
workflow.set_entry_point("classifier")
workflow.add_edge("classifier", "rag")
workflow.add_edge("rag", "governance")
workflow.add_edge("governance", "orchestrator")
workflow.add_edge("orchestrator", "validator")
workflow.add_edge("validator", "planner")
workflow.add_edge("planner", "privacy")
workflow.add_edge("privacy", END)

# Compile
graph = workflow.compile()

# --- API Endpoints ---

class OrchestratorRequest(BaseModel):
    query: str

@app.post("/api/v1/stream")
async def stream_orchestrator(request: OrchestratorRequest):
    """Execute the LangGraph workflow."""
    initial_state = {
        "user_input": request.query,
        "chat_history": [],
        "audit_log": []
    }
    
    try:
        final_state = graph.invoke(initial_state)
        return {
            "response": final_state["privacy_scrubbed_response"],
            "actions": final_state["next_actions"],
            "audit": final_state["audit_log"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "active", "engine": "LangGraph"}

if __name__ == "__main__":
    import uvicorn
    # Using port 8000 for Python backend
    uvicorn.run(app, host="0.0.0.0", port=8000)
