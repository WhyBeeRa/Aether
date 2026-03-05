import os
import sys
from pathlib import Path

# Add backend directory to sys.path so we can import from models and persistence
sys.path.append(str(Path(__file__).resolve().parent))

from models import (
    LabAnalysis, ToolMetrics, VisualQuality, GalleryItem, AuditLog, IntentMapping
)
from persistence import AetherVault

def run_seed():
    print("Initiating Default Data Seeding for Phase 4 (Intent Engine Enabled)...")
    vault = AetherVault()
    
    # Tool 1: Gamma AI
    gamma_analysis = LabAnalysis(
        tool_name="Gamma AI",
        metrics=ToolMetrics(
            accuracy=4, speed=5, value=5, ease_of_use=5,
            learning_curve="קל מאוד",
            pricing="Freemium (קרדיטים)",
            integration="ייצוא ל-PDF / Web"
        ),
        visual_quality=VisualQuality.HIGH,
        job_to_be_done=["מצגות", "בניית מצגות משקיעים"],
        intents_mapped=[
            IntentMapping(intent_description="בניית מצגת משקיעים מתוך טקסט", success_score=98.5, trade_off="העיצוב גנרי מעט"),
            IntentMapping(intent_description="סיכום פגישה ויזואלי", success_score=95.0, trade_off=None),
            IntentMapping(intent_description="הכנת מערך שיעור אינטראקטיבי", success_score=88.0, trade_off="קשה לשלוט בפריסות מורכבות")
        ],
        executive_summary="התאמה מושלמת לכוונת המשתמש: מייצר מצגות משקיעים מטקסט בתוך שניות עם עיצוב מובנה. מיועד למי שרוצה לדלג על עיצוב ידני ולהתמקד בתוכן.",
        pros=["מהירות: יצירת דראפט ראשוני בשניות", "עיצוב טבעי: פלטפורמה הדואגת לחוויה ויזואלית מצוינת"],
        cons=["התאמה אישית: קשה לעצב פיקסל-פרפקט פריטים מסוימים", "תבניות מוגבלות: יכול לחזור על עצמו למשתמשים מתקדמים"],
        use_cases=["מצגות משקיעים (Pitch Decks)", "הדרכות מוצר", "סיכומי פגישות ויזואליים"]
    )
    
    gamma_gallery = [
        GalleryItem(
            tool_id="gamma-ai",
            media_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            style_tags=["מצגת", "Data Visualization"],
            prompt_recipe={"prompt": "Startup pitch deck for an organic coffee brand"},
            is_featured=True,
            trust_badge_visible=True
        )
    ]
    
    # Tool 2: Cursor
    cursor_analysis = LabAnalysis(
        tool_name="Cursor",
        metrics=ToolMetrics(
            accuracy=5, speed=5, value=5, ease_of_use=3,
            learning_curve="מיועד למפתחים",
            pricing="תשלום חודשי ($20)",
            integration="VS Code / GitHub Projects"
        ),
        visual_quality=VisualQuality.HIGH,
        job_to_be_done=["פיתוח קוד", "כתיבת אפליקציות"],
        intents_mapped=[
            IntentMapping(intent_description="בניית אפליקציה מבוססת React ו-Tailwind", success_score=99.0, trade_off=None),
            IntentMapping(intent_description="כתיבת דף נחיתה מקוד ללא ניסיון קודם", success_score=75.0, trade_off="עדיין דורש הבנה טכנית בסיסית של הפקודות"),
            IntentMapping(intent_description="דיבוג שגיאות עמוקות בשרת (Backend)", success_score=92.5, trade_off="תלוי בגישה פתוחה לקבצים")
        ],
        executive_summary="הכלי שכבש את קהילת המפתחים. עורך קוד מבוסס בינה מלאכותית מלאה, שנבנה על התשתית של VS Code אבל מבין את התיקייה כולה.",
        pros=["הקשר רחב: מבין את כל מאגר הקוד (Codebase)", "חוויה חלקה: UI טבעי בתוך סביבת עבודה מוכרת"],
        cons=["קהל יעד: לא מתאים להדיוטות / No-code", "פרטיות: רגישות לחברות שדורשות on-prem"],
        use_cases=["פיתוח Full Stack", "דיבוג באגים (Debugging)", "תיעוד אלקטרוני ושיפור מאגרי קוד"]
    )
    
    cursor_gallery = [
        GalleryItem(
            tool_id="cursor-ide",
            media_url="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            style_tags=["Code", "IDE"],
            prompt_recipe={"prompt": "Generate a full React authentication flow"},
            is_featured=True,
            trust_badge_visible=True
        )
    ]
    
    # Tool 3: Midjourney
    mj_analysis = LabAnalysis(
        tool_name="Midjourney",
        metrics=ToolMetrics(
            accuracy=4, speed=3, value=4, ease_of_use=2,
            learning_curve="קשה",
            pricing="תשלום חודשי ($10-$30)",
            integration="Discord / Web Alpha"
        ),
        visual_quality=VisualQuality.HIGH,
        job_to_be_done=["יצירת תמונות", "אמנות AI", "עיצוב ויזואלי"],
        intents_mapped=[
            IntentMapping(intent_description="יצירת תמונות מציאותיות וריאליסטיות", success_score=98.0, trade_off="דורש שליטה בפרמטרים של מצלמה"),
            IntentMapping(intent_description="המרת טקסט ללוגו (Typography)", success_score=50.0, trade_off="מתקשה המון עם טקסטים עקביים"),
            IntentMapping(intent_description="קונספט ארט לפיתוח משחק", success_score=99.5, trade_off=None)
        ],
        executive_summary="פלטפורמת יצירת התמונות המתקדמת בעולם מבחינה אמנותית. מניבה אסתטיקה ברמת אולפן אבל מצריכה שליטה בפרמטרים והבנה כיצד לכתוב רצפט מדויק.",
        pros=["איכות צילום: הפלטפורמה המובילה לפוטו-ריאליזם", "סגנון אמנותי: מגוון אדיר של השפעות מציירים, במאים ורזולוציות"],
        cons=["ממשק: דורש שימוש בדיסקורד או באתר אלפא לחלק מהמשתמשים", "עקומת למידה: שימוש בפרמטרים מורכבים (--v 6.0, --ar)"],
        use_cases=["קונספט ארט לסדרות ומשחקים", "צילום מוצר לחנויות E-commerce", "תמונות אווירה לשיווק בלוגים"]
    )
    
    mj_gallery = [
        GalleryItem(
            tool_id="midjourney-v6",
            media_url="https://images.unsplash.com/photo-1681412330368-24ccdf8ded02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            style_tags=["Generative Art", "Fashion Photography"],
            prompt_recipe={"prompt": "Editorial fashion photography of a cybernetic model in Tokyo, shot on 35mm --ar 16:9 --style raw"},
            is_featured=True,
            trust_badge_visible=True
        )
    ]

    # Save to Vault
    for tool_name, analysis, score, gallery in [
        ("Gamma AI", gamma_analysis, 94.5, gamma_gallery),
        ("Cursor", cursor_analysis, 98.2, cursor_gallery),
        ("Midjourney", mj_analysis, 96.0, mj_gallery)
    ]:
        audit = AuditLog(tool_name=tool_name, action="Seed Verification", reason="Initial Phase 4 DB Setup", new_trust_score=score)
        vault.save_tool(tool_name=tool_name, analysis=analysis, trust_score=score, gallery=gallery, audit_log=audit)
        
    print("Database seeding successfully completed.")

if __name__ == "__main__":
    run_seed()
