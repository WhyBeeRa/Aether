from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class IntentCategory(str, Enum):
    """
    Broad categories for intents, though the system uses semantic search.
    """
    GENERATIVE_ART = "generative_art"
    DATA_ANALYSIS = "data_analysis"
    CODING_ASSISTANT = "coding_assistant"
    WRITING_AID = "writing_aid"
    ENTREPRENEURSHIP = "entrepreneurship"
    OTHER = "other"

class UserIntent(BaseModel):
    """
    Represents the user's raw intent and processed classification.
    """
    raw_query: str
    semantic_tags: List[str] = Field(default_factory=list)
    detected_problems: List[str] = Field(default_factory=list, description="Real-world problems extracted from query")

class ToolReview(BaseModel):
    """
    A review for an AI tool.
    """
    reviewer_id: str
    rating: float = Field(..., ge=0, le=5)
    text: str
    timestamp: datetime = Field(default_factory=datetime.now)
    verified_purchase: bool = False
    expert_level: str = "Beginner" # Beginner, Intermediate, Expert

class AITool(BaseModel):
    """
    The core data model for an AI tool in Aeather.
    """
    id: str
    name: str
    description: str
    website_url: HttpUrl
    pricing_model: str # Free, Freemium, Paid
    
    # Trust Engine Data
    trust_score: float = Field(0.0, ge=0, le=100)
    verified_output_badge: bool = False
    last_benchmark_date: Optional[datetime] = None
    
    # Classification
    intents: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    
    # Social Proof
    gallery_images: List[HttpUrl] = Field(default_factory=list)
    reviews: List[ToolReview] = Field(default_factory=list)

    class Config:
        api_mode = True

class VisualProof(BaseModel):
    """
    Direct evidence of a tool's capability.
    """
    url: HttpUrl
    source_url: HttpUrl = Field(..., description="Where this proof was found (Tweet, Discord, etc.)")
    media_type: str = "image" # image, video, code_snippet
    description: Optional[str] = None

class ScoutFindings(BaseModel):
    """
    Raw findings from a Scout discovery cycle.
    Separated from AITool to track history and model drift.
    """
    tool_name: str
    timestamp: datetime = Field(default_factory=datetime.now)
    source: str
    
    # The Core Truth
    user_intent: str = Field(..., description="Specific problem solved (e.g. 'Automating lead gen' vs 'Marketing tool')")
    raw_sentiment: str = Field(..., description="Technical assertions or complaints from builders")
    tech_stack: str = Field(..., description="No-Code, Low-Code, or API-only")
    
    # Evidence & Reliability
    visual_proofs: List[VisualProof] = Field(default_factory=list)
    reliability_score: float = Field(..., ge=0, le=100, description="Calculated based on evidence vs hype")
    hype_factor: bool = Field(False, description="True if content contains forbidden superlatives")
    
    technical_feasibility: Optional[str] = None

class VisualQuality(str, Enum):
    HIGH = "High" # TV/Movie quality, indistinguishable from reality
    MID = "Mid"   # Good for social media, obvious AI artifacts
    LOW = "Low"   # Glitchy, toy-like

class ToolMetrics(BaseModel):
    """
    The 'Airbnb' style ratings for a tool.
    """
    accuracy: int = Field(..., ge=1, le=5, description="Reliability of output")
    speed: int = Field(..., ge=1, le=5, description="Latency and response time")
    value: int = Field(..., ge=1, le=5, description="Cost vs Performance")
    ease_of_use: int = Field(..., ge=1, le=5, description="No-code vs Developer skills")
    
    # UI Metadata for the 3-Card Drop & ToolDetails
    learning_curve: str = Field(default="בינוני", description="קל מאוד, בינוני, קשה, מיועד למפתחים")
    pricing: str = Field(default="Freemium", description="Freemium, תשלום חודשי, פתוח לכולם")
    integration: str = Field(default="Web / API", description="אינטגרציות מרכזיות, למשל Slack, Web, API מותאם")

    last_verified: datetime = Field(default_factory=datetime.now, description="Critical to track model drift")

class IntentMapping(BaseModel):
    """
    Core Aether Intent Engine mapping.
    Maps a specific user intent to a tool with a verified success score.
    """
    intent_description: str = Field(..., description="E.g., 'Automating investor pitch decks from docs'")
    success_score: float = Field(..., ge=0, le=100, description="How well this tool specifically solves this intent")
    trade_off: Optional[str] = Field(None, description="The catch. E.g., 'Fast, but lacks granular design control'")

class LabAnalysis(BaseModel):
    """
    The Truth. Structured, verified insights from The Lab.
    """
    tool_name: str
    metrics: ToolMetrics
    visual_quality: VisualQuality
    
    # Semantic Mapping
    job_to_be_done: List[str] = Field(..., description="Broad categories (e.g. 'Lead Enrichment', 'Viral Video Creation')")
    
    # THE AETHER INTENT ENGINE
    intents_mapped: List[IntentMapping] = Field(default_factory=list, description="Specific intents this tool solves and how well")
    
    # Perplexity Layer
    executive_summary: str = Field(..., description="Sentence 1: Peak. Sentence 2: Trade-off.")
    pros: List[str] = Field(default_factory=list, description="Array of Pros with a title, e.g. 'Title: Description'")
    cons: List[str] = Field(default_factory=list, description="Array of Cons with a title, e.g. 'Title: Description'")
    use_cases: List[str] = Field(default_factory=list, description="UI pills array")
    
    # Deep Intelligence Fields (Phase 7)
    limitations: List[str] = Field(default_factory=list, description="What the tool explicitly cannot do / struggles with")
    privacy_policy: Optional[str] = Field(default="Unknown", description="e.g. 'Trains on user data', 'Enterprise only'")
    social_proof: Optional[str] = Field(None, description="Summarized user/developer quote validating capability")
    
    source_findings_id: Optional[str] = None # Link back to raw Scout data

class TrustScore(BaseModel):
    """
    The Auditor's Matrix.
    """
    authenticity_score: float = Field(..., ge=0, le=100, description="Reviewer identity verification status")
    evidence_quality_score: float = Field(..., ge=0, le=100, description="Replicability of proofs")
    performance_stability: float = Field(..., ge=0, le=100, description="Drift monitoring score")
    marketing_noise_penalty: float = Field(..., ge=0, le=100, description="Penalty for hype/buzzwords")
    
    total_trust_score: float = Field(..., ge=0, le=100, description="Weighted average: (Auth*0.4)+(Stab*0.3)+(Qual*0.3) - Penalty")
    
    last_audit_date: datetime = Field(default_factory=datetime.now)

class AuditLog(BaseModel):
    """
    The Trail of Truth. History of all verification actions.
    """
    tool_name: str
    timestamp: datetime = Field(default_factory=datetime.now)
    action: str = Field(..., description="Verified, Flagged, Badge Revoked")
    reason: str = Field(..., description="Detailed explanation (e.g., 'Model Drift detected > 15%')")
    new_trust_score: float

class GalleryItem(BaseModel):
    """
    Pinterest-style showcase item.
    """
    tool_id: str
    media_url: HttpUrl
    media_type: str = "image"
    
    # Search & Discovery
    style_tags: List[str] = Field(..., description="Visual categories for search")
    
    # The Recipe (Educational Value)
    prompt_recipe: Dict[str, str] = Field(..., description="Prompt, Negative Prompt, Settings")
    
    # Trust Integration
    is_featured: bool = False
    trust_badge_visible: bool = Field(True, description="Only true if TrustScore > 70")
    audit_log_id: Optional[str] = None
