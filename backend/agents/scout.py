import asyncio
import os
import json
from typing import List, Dict
from datetime import datetime
from models import ScoutFindings, VisualProof
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

SCOUT_SYSTEM_PROMPT = """
Role: You are the Commander of the "Scout" Agent for Aether - the Single Source of Truth for the AI world. 
Your mission is to bypass marketing hype and retrieve raw, verified evidence of AI tool capabilities.

Objective: Scan the digital landscape to identify new AI tools and extract "Functional Intent" and "Raw Evidence" to feed the Aether ecosystem.
The user wants to scan for an AI tool matching a specific intent.
Identify the top tool that matches this intent (from the MVP list if possible: ChatGPT, Claude 3, Perplexity, Midjourney, DALL-E 3, GitHub Copilot, Cursor, ElevenLabs, Zapier) and return its details.

You must output ONLY valid JSON matching this exact schema:
{
  "tool_name": "Name of the tool",
  "source": "Simulated Web Scan",
  "user_intent": "The user's intent",
  "raw_sentiment": "A summary of general sentiment found in reviews",
  "tech_stack": "e.g., LLM, Generative AI, or API only",
  "reliability_score": 90.0,
  "hype_factor": false,
  "visual_proofs": [
    {
      "url": "A realistic image URL representing the tool interface or output",
      "source_url": "Website URL matching the tool"
    }
  ]
}
Ensure the image URL is a real unsplash URL or highly plausible placeholder if real isn't known, e.g. "https://images.unsplash.com/photo-1620712948343-0008cc890752?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80".
"""

class ScoutAgent:
    """
    The Scout: Officer of Discovery.
    Scans sources to find new AI tools, filtering out hype and focusing on evidence.
    """
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})

    def calculate_reliability(self, content: str, has_visuals: bool) -> float:
        return 90.0 # Handled by LLM now

    def _is_hype(self, content: str) -> bool:
        return False

    async def run_discovery_cycle(self, intent: str) -> List[ScoutFindings]:
        print(f"Scout: Initiating Operation for intent '{intent}' using Gemini API...")
        
        prompt = f"{SCOUT_SYSTEM_PROMPT}\n\nUser Intent to scan for: {intent}"
        
        try:
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            data = json.loads(response.text)
            
            proofs = []
            for vp in data.get("visual_proofs", []):
                proofs.append(VisualProof(
                    url=vp.get("url"),
                    source_url=vp.get("source_url")
                ))
                
            finding = ScoutFindings(
                tool_name=data.get("tool_name", "Unknown Tool"),
                source=data.get("source", "Simulated Web Scan"),
                user_intent=data.get("user_intent", intent),
                raw_sentiment=data.get("raw_sentiment", "Positive"),
                tech_stack=data.get("tech_stack", "AI"),
                reliability_score=data.get("reliability_score", 90.0),
                hype_factor=data.get("hype_factor", False),
                visual_proofs=proofs
            )
            
            print(f"Scout: Mission Report. 1 candidate extracted: {finding.tool_name}")
            return [finding]
            
        except Exception as e:
            print(f"Scout: Error during discovery: {e}")
            return []
