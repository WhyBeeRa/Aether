import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, List, Any
from models import AuditLog, LabAnalysis, GalleryItem, TrustScore

from pathlib import Path

# Database File Path
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "vault.db"

class AetherVault:
    """
    The Memory Layer.
    Manages persistence for the Aether ecosystem.
    """
    def __init__(self):
        self._init_db()

    def _init_db(self):
        """
        Initialize the SQLite database schema.
        """
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # 1. Verified Tools (The Core Truth)
        c.execute('''CREATE TABLE IF NOT EXISTS verified_tools (
                        tool_name TEXT PRIMARY KEY,
                        last_updated TIMESTAMP,
                        trust_score REAL,
                        intent_category TEXT,
                        analysis_json TEXT,  -- Storing complex objects as JSON for MVP flexibility
                        gallery_json TEXT
                    )''')

        # 2. Audit History (The Trail)
        c.execute('''CREATE TABLE IF NOT EXISTS audit_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        tool_name TEXT,
                        timestamp TIMESTAMP,
                        action TEXT,
                        reason TEXT,
                        score_snapshot REAL
                    )''')
        
        # 3. Search Index (Simplified for MVP - in prod use vector DB)
        c.execute('''CREATE TABLE IF NOT EXISTS search_index (
                        tool_name TEXT,
                        keyword TEXT,
                        PRIMARY KEY (tool_name, keyword)
                    )''')

        conn.commit()
        conn.close()

    def save_tool(self, tool_name: str, analysis: LabAnalysis, trust_score: float, gallery: List[GalleryItem], audit_log: AuditLog):
        """
        Saves a fully verified tool to the Vault.
        """
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        timestamp = datetime.now()
        
        # Serialize complex objects
        analysis_json = analysis.json()
        gallery_json = json.dumps([item.dict() for item in gallery], default=str)
        
        # Upsert into Verified Tools
        c.execute('''INSERT OR REPLACE INTO verified_tools 
                     (tool_name, last_updated, trust_score, intent_category, analysis_json, gallery_json)
                     VALUES (?, ?, ?, ?, ?, ?)''',
                  (tool_name.lower(), timestamp, trust_score, str(analysis.job_to_be_done), analysis_json, gallery_json))
        
        # Log Audit
        c.execute('''INSERT INTO audit_history (tool_name, timestamp, action, reason, score_snapshot)
                     VALUES (?, ?, ?, ?, ?)''',
                  (tool_name.lower(), timestamp, audit_log.action, audit_log.reason, audit_log.new_trust_score))
        
        # Update Search Index (Basic Keyword Mapping)
        # Clear old keywords first
        c.execute("DELETE FROM search_index WHERE tool_name = ?", (tool_name.lower(),))
        
        keywords = set(analysis.job_to_be_done + [tool_name.lower()] + analysis.tool_name.lower().split())
        for kw in keywords:
            c.execute("INSERT OR IGNORE INTO search_index (tool_name, keyword) VALUES (?, ?)", (tool_name.lower(), kw.lower()))

        conn.commit()
        conn.close()
        print(f"[Vault] Tool '{tool_name}' secured in the Vault.")

    def get_tool(self, tool_identifier: str) -> Optional[Dict]:
        """
        Retrieves a tool from the Vault IF it is valid (not expired).
        Can query by exact tool_name or slugified id.
        """
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        
        # Try exact match first
        c.execute("SELECT * FROM verified_tools WHERE tool_name = ?", (tool_identifier.lower(),))
        row = c.fetchone()
        
        # Try slug match if not found
        if not row:
            c.execute("SELECT * FROM verified_tools WHERE replace(lower(tool_name), ' ', '-') = ?", (tool_identifier.lower(),))
            row = c.fetchone()
            
        conn.close()
        
        if not row:
            return None
            
        # Expiration Logic (7 Days)
        last_updated = datetime.fromisoformat(str(row['last_updated']))
        if datetime.now() - last_updated > timedelta(days=7):
            print(f"[Vault] Tool '{row['tool_name']}' found but EXPIRED. Triggering Pulse Check.")
            return None # Treat as not found to trigger re-verification
            
        # Reconstruct Data
        slug_id = row['tool_name'].strip().lower().replace(' ', '-')
        return {
            "id": slug_id,
            "tool_name": row['tool_name'],
            "last_updated": row['last_updated'],
            "trust_score": row['trust_score'],
            "analysis": json.loads(row['analysis_json']),
            "gallery": json.loads(row['gallery_json']),
            "status": "success" # Implicitly success if in DB
        }

    def search_tools(self, query: str) -> List[Dict]:
        """
        Searches the Vault for tools matching the query (Intent or Name).
        """
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        
        if not query.strip():
            # If query is empty, return ALL tools
            c.execute('SELECT * FROM verified_tools')
        else:
            # Simple LIKE search on the index
            c.execute('''SELECT DISTINCT vt.* FROM verified_tools vt
                         JOIN search_index si ON vt.tool_name = si.tool_name
                         WHERE si.keyword LIKE ?''', (f"%{query.lower()}%",))
        
        rows = c.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            slug_id = row['tool_name'].strip().lower().replace(' ', '-')
            results.append({
                "id": slug_id,
                "tool_name": row['tool_name'],
                "trust_score": row['trust_score'],
                "analysis": json.loads(row['analysis_json']),
                "gallery": json.loads(row['gallery_json']),
            })
            
        return results

    def get_stats(self) -> Dict:
         conn = sqlite3.connect(DB_PATH)
         c = conn.cursor()
         
         # count
         c.execute("SELECT COUNT(*) FROM verified_tools")
         count = c.fetchone()[0] or 0
         
         # average trust score
         c.execute("SELECT AVG(trust_score) FROM verified_tools")
         avg_score = c.fetchone()[0] or 0.0
         
         # last scan date
         c.execute("SELECT MAX(last_updated) FROM verified_tools")
         last_scan = c.fetchone()[0]
         
         # For unique intents mapped
         c.execute("SELECT analysis_json FROM verified_tools")
         rows = c.fetchall()
         
         unique_intents = set()
         for row in rows:
             if row[0]:
                 try:
                     analysis = json.loads(row[0])
                     intents = analysis.get("intents_mapped", [])
                     for intent in intents:
                         desc = intent.get("intent_description")
                         if desc:
                             unique_intents.add(desc.lower().strip())
                 except Exception:
                     pass
                     
         conn.close()
         return {
             "verified_tools_count": count,
             "average_trust_score": avg_score,
             "total_intents_mapped": len(unique_intents),
             "last_scan_date": last_scan
         }
