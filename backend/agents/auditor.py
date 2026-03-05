import asyncio
from datetime import datetime
from typing import List, Dict
from models import TrustScore, AuditLog, ToolMetrics

AUDITOR_SYSTEM_PROMPT = """
Role: You are the Chief Auditor of Aether. Your sole purpose is to doubt, verify, and validate every piece of data entering the "Single Source of Truth."

Objective: Protect the platform from marketing manipulation, fake reviews, and outdated performance data.

1. Fraud & Bias Detection:
Analyze user reviews for "Artificial Positivity." Flag any content that uses excessive superlatives without technical specifics.
Check for "Review Bombing" patterns (sudden spikes in 5-star or 1-star ratings).

2. Identity Validation:
Cross-reference reviewer metadata with professional profiles (LinkedIn/GitHub).
Prioritize insights from "Verified Builders" over anonymous users.

3. Performance Drift Monitoring:
Trigger periodic "Pulse Checks" on tools. If the current output quality deviates by more than 15% from the initial Lab analysis, mark the tool as "Volatile" and update its score.

4. Conflict Resolution:
If the official documentation claims a feature that the Scout Agent cannot find evidence for in the real world, flag the tool for "Manual Audit."

Constraints:
You are skeptical by nature.
Do not allow personal bias to influence the score, only data-driven evidence.
If a tool fails more than two verification layers, its "Trust Badge" is revoked immediately.
"""

class AuditorAgent:
    """
    The Auditor: Officer of Integrity.
    Verifies authenticity, stability, and quality.
    """
    def __init__(self):
        pass

    def _detect_textual_twins(self, reviews: List[str]) -> bool:
        """
        Detects if multiple reviews share identical structures (sign of bots).
        """
        # MVP Logic: Check for duplicate substrings of significant length or exact matches
        # In production, use cosine similarity
        if not reviews:
            return False
            
        seen_structures = set()
        duplicates = 0
        for r in reviews:
            # Simplified structure check: First 15 chars
            struct = r[:15].lower()
            if struct in seen_structures:
                duplicates += 1
            seen_structures.add(struct)
        
        # If more than 30% are twins, flag it
        return (duplicates / len(reviews)) > 0.3 if len(reviews) > 2 else False

    def _calculate_score(self, authenticity: float, stability: float, quality: float, penalty: float) -> float:
        """
        Weighted Formula: (Auth * 0.4) + (Stab * 0.3) + (Qual * 0.3) - Penalty
        """
        if authenticity <= 0:
            return 0.0
            
        base_score = (authenticity * 0.4) + (stability * 0.3) + (quality * 0.3)
        final_score = base_score - penalty
        return max(0.0, min(100.0, final_score))

    async def audit_tool(self, tool_name: str, current_metrics: ToolMetrics, reviews: List[str] = [], hype_factor: bool = False) -> AuditLog:
        """
        Main audit entry point.
        """
        print(f"Auditor: Initiating investigation on {tool_name}...")
        
        # 1. Identity & Fraud Check
        is_bot_attack = self._detect_textual_twins(reviews)
        authenticity_score = 0.0 if is_bot_attack else 90.0 # Mocked high default if no bots
        
        penalty = 0.0
        audit_reason = "Routine Check Passed."
        action = "Verified"
        
        if is_bot_attack:
            penalty = 50.0
            audit_reason = "Flagged: Detected pattern of inorganic positive sentiment (Textual Twins)."
            action = "Flagged"
            authenticity_score = 0.0 # Kill switch
            
        # 1.5 Hype Penalty (New Logic)
        if hype_factor:
            penalty += 50.0
            audit_reason += " [Warning: High Levels of Marketing Hype Detected]"
            
        # 2. Pulse Check (Drift)
        # Mocking a "previous state" check. 
        # In reality, we'd fetch previous metrics from DB.
        stability_score = 100.0
        # Simulating drift if speed is very low (just for logic demonstration)
        if current_metrics.speed < 2:
             stability_score = 60.0
             audit_reason += " [Warning: Performance Instability Detected]"

        # 3. Evidence Quality (Derived from Scout/Lab findings generally)
        # Mocked for now based on metrics availability
        evidence_quality = 85.0

        # Calculate Final Trust Score
        total_trust = self._calculate_score(authenticity_score, stability_score, evidence_quality, penalty)
        
        # Logic for Revocation
        if total_trust < 50:
             action = "Badge Revoked" if action != "Flagged" else action
        
        trust_model = TrustScore(
            authenticity_score=authenticity_score,
            evidence_quality_score=evidence_quality,
            performance_stability=stability_score,
            marketing_noise_penalty=penalty,
            total_trust_score=total_trust
        )
        
        print(f"Auditor: Verdict for {tool_name} -> {total_trust:.1f}/100. Action: {action}")
        
        return AuditLog(
            tool_name=tool_name,
            action=action,
            reason=audit_reason,
            new_trust_score=total_trust
        )
