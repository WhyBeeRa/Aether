import React from 'react';
import { ArrowLeft, Clock, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Blog() {
    const navigate = useNavigate();

    const labNotes = [
        {
            id: 1,
            title: "מבחן יכולות ל-Claude 3.5 Sonnet: האם הוא באמת טוב יותר בקידוד?",
            date: "12 פברואר, 2026",
            excerpt: "העברנו את המודל החדש של אנתרופיק עשרות מבחני קידוד, מהרחבת קומפוננטות ריאקט ועד ליצירת ארכיטקטורות ענן. הממצאים מפתיעים.",
            readTime: "6 דק' קריאה"
        },
        {
            id: 2,
            title: "עלייתם של סוכני ה-AI האוטונומיים: למה Agentic משנה את חוקי המשחק",
            date: "05 פברואר, 2026",
            excerpt: "סקירה של שינוי הגישה מ-Chatbots טיפשים לסוכנים שמסוגלים לתכנן אסטרטגיה מורכבת ולקבל החלטות מרובות שלבים בפרודקשן.",
            readTime: "8 דק' קריאה"
        },
        {
            id: 3,
            title: "כלי כתיבה AI לעומת בני אדם: תוצאות מבחן הטורינג של Aether",
            date: "28 ינואר, 2026",
            excerpt: "האם מנכ״לים מסוגלים להבחין בין מסמך אסטרטגיה שנכתב על ידי בכיר לבין מסמך שנוצר על ידי ChatGPT לאחר פיינטיונינג? הנתונים המלאים ממחקר המעבדה האחרון.",
            readTime: "5 דק' קריאה"
        }
    ];

    return (
        <div className="w-full flex flex-col items-center pt-24 pb-24 rtl animate-in fade-in duration-700" dir="rtl">
            <main className="w-full max-w-3xl px-6">

                {/* Header */}
                <div className="mb-16 border-b border-white/20 pb-12 relative">
                    <button onClick={() => navigate(-1)} className="absolute top-0 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 mb-8 -translate-y-full">
                        <ArrowLeft className="w-4 h-4" /> חזרה
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-xs font-bold tracking-widest font-mono uppercase mt-6">
                        <FlaskConical className="w-3 h-3" /> מעבדת Aether
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        הערות מעבדה
                    </h1>
                    <p className="text-xl text-white/70 font-medium max-w-2xl">
                        מחשבות, מחקרים, ומבחני שטח שאנחנו עורכים על כלי ה-AI החדשים ביותר. נטול חסויות, נטול ספינים. מה שאתה קורא, זה מה שמצאנו.
                    </p>
                </div>

                {/* Feed */}
                <div className="flex flex-col gap-12">
                    {labNotes.map((note) => (
                        <article key={note.id} className="group cursor-pointer">
                            <div className="flex items-center gap-4 mb-3 text-sm text-white/50 font-mono tracking-wider uppercase">
                                <time>{note.date}</time>
                                <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {note.readTime}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-700 transition-colors underline-offset-4 group-hover:underline">
                                {note.title}
                            </h2>
                            <p className="text-white/70 leading-relaxed font-medium mb-4">
                                {note.excerpt}
                            </p>
                            <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                                קרא את המחקר המלא <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                            </span>
                        </article>
                    ))}
                </div>

            </main>
        </div>
    );
}
