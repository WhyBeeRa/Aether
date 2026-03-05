from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import uuid

import json
import os
from pathlib import Path
from pipeline import AetherPipeline
from models import GalleryItem, LabAnalysis, TrustScore, ToolMetrics, VisualQuality, AuditLog

app = FastAPI(title="Aeather API", description="Backend for the Agentic Grid", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    # Allow exact Vite origins (no trailing slashes, strict matching)
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:3000" # Adding 3000 just in case Vite increments
    ],
    allow_credentials=True,
    # Limit methods instead of ["*"] for strictness, though for local dev * is often fine. Keep it clean.
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

from dotenv import load_dotenv
load_dotenv()

# Initialize Single Source of Truth
pipeline = AetherPipeline()

# Initialize Vault (Persistence Layer)
from persistence import AetherVault
vault = AetherVault()

# Initialize Semantic Search Engine
from search_engine import AetherSearchEngine
search_engine = AetherSearchEngine()

@app.on_event("startup")
async def startup_event():
    print("Initializing Aether Backend...")
    seed_file = Path(__file__).parent / "seed_data.json"
    
    try:
        if seed_file.exists():
            print(f"Found seed_data.json at {seed_file}. Attempting to load...")
            with open(seed_file, "r", encoding="utf-8-sig") as f:
                seed_data = json.load(f)
            
            # Allow seed_data to be a list or a single dict
            if isinstance(seed_data, dict):
                seed_data = [seed_data]
                
            for tool_data in seed_data:
                tool_name = tool_data.get("tool_name")
                if not tool_name:
                    continue
                
                # Check if tool exists, if so we might skip or append. For MVP, we'll recreate or skip
                # Actually, let's just create a mock if it doesn't exist, or update intents if it does.
                existing_tool = vault.get_tool(tool_name)
                
                intents_mapped = tool_data.get("intents_mapped", [])
                job_to_be_done = [intent.get("intent_description", "") for intent in intents_mapped if intent.get("intent_description")]
                
                if existing_tool:
                    print(f"Tool {tool_name} already in Vault. Skipping seed overwrite to preserve original data.")
                    continue
                
                # Create default metrics for seeding
                analysis = LabAnalysis(
                    tool_name=tool_name,
                    metrics=ToolMetrics(
                        accuracy=4, speed=4, value=4, ease_of_use=4,
                        learning_curve="בינוני", pricing="Freemium", integration="Web"
                    ),
                    visual_quality=VisualQuality.MID,
                    job_to_be_done=job_to_be_done,
                    executive_summary=f"Seeded from Data Ingestion. Category: {tool_data.get('category', 'All')}",
                    pros=["Seeded Data"],
                    cons=["Seeded Data"],
                    use_cases=job_to_be_done
                )
                
                avg_score = sum(intent.get("success_score", 5) for intent in intents_mapped) / max(1, len(intents_mapped))
                trust_score = min(100.0, avg_score * 10.0) # Convert 1-10 to 10-100
                
                audit = AuditLog(tool_name=tool_name, action="Seed Ingestion", reason="Loaded from seed_data.json", new_trust_score=trust_score)
                vault.save_tool(tool_name=tool_name, analysis=analysis, trust_score=trust_score, gallery=[], audit_log=audit)
                print(f"Successfully seeded '{tool_name}' from JSON.")
    except Exception as e:
        print(f"Warning: Failed to load seed_data.json gracefully. Server will still start. Error: {e}")

# Map: task_id -> status (Keep in-memory for now as disjointed tasks)
task_status: Dict[str, str] = {}

async def run_pipeline_task(task_id: str, intent: str):
    """
    Background task wrapper for the pipeline.
    """
    try:
        task_status[task_id] = "running"
        
        # PIPELINE RUN
        result = await pipeline.run_pipeline(intent)
        
        if result["status"] == "success":
            # Vault handles saving internally now via Pipeline or we do it here?
            # Pipeline is the orchestrator, so ideally Pipeline saves to Vault.
            # BUT, we need to pass the Vault to the pipeline or have pipeline init it.
            # For this Phase, let's have the Pipeline return the data and WE save it here 
            # OR better: The Pipeline should check the Vault first (Logic Gate).
            
            # Update: Pipeline now handles Vault logic internally (see pipeline.py updates).
            # So result comes back either from Cache or Fresh Run.
            
            task_status[task_id] = "completed"
        elif result["status"] == "rejected":
             task_status[task_id] = "completed_rejected"
        else:
            task_status[task_id] = f"failed: {result.get('reason')}"
            
    except Exception as e:
        print(f"Pipeline Critical Error: {e}")
        task_status[task_id] = "error"

@app.get("/")
def read_root():
    stats = vault.get_stats()
    return {"status": "online", "system": "Aether Agentic Grid", "tools_indexed": stats["verified_tools_count"]}

@app.post("/pipeline/trigger")
async def trigger_pipeline(intent: str, background_tasks: BackgroundTasks):
    """
    The 'Red Button'. Triggers the autonomous agents in the background.
    Returns a Task ID for polling.
    """
    task_id = str(uuid.uuid4())
    background_tasks.add_task(run_pipeline_task, task_id, intent)
    return {"message": "Pipeline triggered", "task_id": task_id, "intent": intent}

@app.get("/pipeline/status/{task_id}")
def get_status(task_id: str):
    status = task_status.get(task_id, "unknown")
    return {"task_id": task_id, "status": status}

@app.get("/tool/{name}")
def get_tool_data(name: str):
    """
    Returns the 'Truth Card' data: Analysis + Trust Score.
    """
    data = vault.get_tool(name)
    if not data:
        raise HTTPException(status_code=404, detail="Tool not found or not yet verified.")
    
    return {
        "name": data["tool_name"],
        "analysis": data["analysis"],
        "trust_score": data["trust_score"],
        "status": data["status"]
    }

@app.get("/gallery/feed")
def get_gallery_feed():
    """
    Returns the 'Evidence Grid'.
    Fetches all items from the Vault.
    Implements Hybrid Ranking: Sponsored Slot (1-3) + Verified Organic.
    """
    # 1. SPONSORED/PROMOTED SLOT (Logic Injection)
    # in a real app, this comes from an Ad Server based on User Intent
    sponsored_items = [
        {
            "tool_name": "Jasper Enterprise",
            "title": "Jasper Enterprise",
            "summary": "AI marketing platform built for enterprise scale. Brand voice consistency and SOC2 compliance.",
            "trust_score": 98.0, # High trust even for ads
            "source": "Aether Promoted",
            "type": "tool",
            "is_sponsored": True,
            "media_url": "https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "prompt_recipe": {"prompt": "Enterprise marketing campaign"},
            "style_tags": ["Enterprise", "Marketing"],
            "trust_badge_visible": True
        }
        # Add more if needed, typically 1-3 slots
    ]
    
    # 2. ORGANIC / VERIFIED SLOT (from Vault)
    # retrieving everything from the vault
    results = vault.search_tools("") 
    
    organic_feed = []
    for data in results:
        analysis = data["analysis"]
        tool_name = data["tool_name"]
        
        # Determine the primary intent or fallback to category
        primary_intent = "כללי"
        if analysis.get("intents_mapped"):
            primary_intent = analysis["intents_mapped"][0].get("intent_description", "כללי")
            
        tool_info = {
            "tool_name": tool_name,
            "title": tool_name.title(), # capitalization
            "summary": analysis.get("executive_summary", ""),
            "trust_score": data["trust_score"],
            "source": analysis.get("source_findings_id") or "Aether Scout",
            "type": "tool",
            "is_sponsored": False,
            "intents": analysis.get("intents_mapped", []),
            "metrics": analysis.get("metrics", {})
        }

        # If there's a gallery, use the first image for the card, else use a placeholder
        media_url = "https://images.unsplash.com/photo-1620712948343-0008cc890752?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        if data.get("gallery") and len(data["gallery"]) > 0:
             media_url = data["gallery"][0].get("media_url", media_url)
             
        organic_feed.append({
             **tool_info,
             "media_url": media_url,
             "primary_intent": primary_intent
        })
            
    # Combine: Sponsored First -> Then Organic
    full_feed = sponsored_items + organic_feed
    
    return full_feed

@app.get("/vault/search")
def search_vault(q: str):
    """
    Direct search in the Vault.
    """
    return vault.search_tools(q)

@app.get("/search/intent")
async def search_intent(q: str):
    """
    Semantic Search using Gemini Intent Matching.
    """
    if not q.strip():
        return []
        
    try:
        results = await search_engine.semantic_search(q)
        return results
    except Exception as e:
        print(f"[API Error] /search/intent failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/vault/categories/stats")
def get_category_stats():
    results = vault.search_tools("")
    counts = {
        "dev": 0,
        "design": 0,
        "text": 0,
        "video": 0,
        "audio": 0,
        "marketing": 0,
        "presentations": 0,
        "enterprise": 0
    }
    
    for data in results:
        analysis = data.get("analysis", {})
        jobs = analysis.get("job_to_be_done", [])
        intents = analysis.get("intents_mapped", [])
        
        # Combine all descriptive text to search for keywords
        text_corpus = " ".join([str(j) for j in jobs]).lower()
        if isinstance(intents, list):
            for i in intents:
                text_corpus += " " + str(i.get("intent_description", "")).lower()
        tool_name = data.get("tool_name", "").lower()
        text_corpus += " " + tool_name
        
        # Heuristic mapping for categories
        matched = False
        if any(k in text_corpus for k in ["code", "dev", "react", "tailwind", "program", "cursor", "v0", "github"]):
            counts["dev"] += 1
            matched = True
        elif any(k in text_corpus for k in ["image", "design", "midjourney", "art", "creative", "ui", "dall-e", "luma"]):
            counts["design"] += 1
            matched = True
        elif any(k in text_corpus for k in ["text", "write", "content", "chat", "perplexity", "claude", "knowledge", "gpt", "model"]):
            counts["text"] += 1
            matched = True
        elif any(k in text_corpus for k in ["video", "film", "edit", "heygen", "runway"]):
            counts["video"] += 1
            matched = True
        elif any(k in text_corpus for k in ["audio", "music", "vocal", "sound", "suno", "elevenlabs"]):
            counts["audio"] += 1
            matched = True
        elif any(k in text_corpus for k in ["marketing", "seo", "sales", "brand", "campaign"]):
            counts["marketing"] += 1
            matched = True
        elif any(k in text_corpus for k in ["present", "gamma", "slide", "deck", "pitch"]):
            counts["presentations"] += 1
            matched = True
        elif any(k in text_corpus for k in ["enterprise", "automat", "zapier", "workflow", "make", "task", "api"]):
            counts["enterprise"] += 1
            matched = True
            
        if not matched:
            pass # Uncategorized
            
    return counts

@app.get("/vault/stats")
def vault_stats():
    return vault.get_stats()
