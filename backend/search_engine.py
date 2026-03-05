import os
import json
import asyncio
import google.generativeai as genai
from typing import List, Dict
from pydantic import BaseModel

from persistence import AetherVault

SEARCH_SYSTEM_PROMPT = """You are the Aether Semantic Search Engine.
Your job is to deeply understand a user's natural language query (intent) and match it against a provided list of AI tools.
You must not just do keyword matching; you must look at the 'job to be done' and the 'intents_mapped' for each tool.
Rank the tools by how well they solve the user's specific problem.
Take into account the 'trust_score' of the tools if multiple tools match.

You must return a STRICT JSON array of objects.
Each object should have:
- "tool_name": The exact name of the matched tool.
- "match_reason": A short 1-sentence explanation of why this is a good match for the query.
- "relevance_score": A score from 0 to 100 indicating how perfect the match is.

Only return tools that are reasonably relevant. Do not include tools that cannot solve the user's problem.
Return a maximum of 5 tools. If no tools match, return an empty array [].
"""

class RankedTool(BaseModel):
    tool_name: str
    match_reason: str
    relevance_score: int

class SearchEngineResponse(BaseModel):
    results: List[RankedTool]

class AetherSearchEngine:
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        # Configure genai explicitly to use GEMINI_API_KEY if present
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)

        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=SEARCH_SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(
                temperature=0.1, # Keep it deterministic
                response_mime_type="application/json",
                response_schema=SearchEngineResponse
            )
        )
        self.vault = AetherVault()

    async def semantic_search(self, query: str) -> List[Dict]:
        tools = self.vault.search_tools("")
        if not tools:
            return []

        # Prepare context (strip heavy fields like base64 images to save tokens)
        tools_context = []
        for t in tools:
            analysis = t.get("analysis", {})
            intents = analysis.get("intents_mapped", [])
            tools_context.append({
                "tool_name": t.get("tool_name"),
                "executive_summary": analysis.get("executive_summary", ""),
                "trust_score": t.get("trust_score"),
                "intents_mapped": intents
            })

        prompt = f"User Query: {query}\n\nAvailable Tools in Vault:\n{json.dumps(tools_context, ensure_ascii=False)}"

        try:
            # We add an explicit timeout at the Google API level as well if supported by the client,
            # but wrapping it in asyncio.wait_for ensures the thread itself doesn't hang forever.
            response = await asyncio.wait_for(
                asyncio.to_thread(self.model.generate_content, prompt),
                timeout=55.0  # 55 seconds to allow FastAPI to handle the 60s frontend timeout safely
            )
            
            data = json.loads(response.text)
            ranked_results = data.get("results", [])
            
            final_tools = []
            for r in ranked_results:
                tool_data = next((t for t in tools if t["tool_name"].lower() == r.get("tool_name", "").lower()), None)
                if tool_data:
                    # Inject the match reason specifically for the UI to show
                    tool_data["match_reason"] = r.get("match_reason", "התאמה נמצאה על בסיס כוונת המשתמש")
                    tool_data["relevance_score"] = r.get("relevance_score", 0)
                    final_tools.append(tool_data)
                    
            # Sort final tools by relevance score descending
            final_tools.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
            return final_tools

        except asyncio.TimeoutError:
            print("[SearchEngine] Gemini API request timed out after 55 seconds.")
            raise Exception("Search engine timed out analyzing complex intent. Please try again.")
        except json.JSONDecodeError as e:
            print(f"[SearchEngine] Failed to parse Gemini JSON: {e}")
            raise Exception("Search engine returned invalid formatting. Please try again.")
        except Exception as e:
            print(f"[SearchEngine] Critical Error: {e}")
            raise Exception(f"Search engine error: {str(e)}")
