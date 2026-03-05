import React, { useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

export default function Pricing() {
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

    return (
        <div className="w-full flex flex-col items-center pt-24 pb-24 rtl animate-in fade-in duration-700" dir="rtl">
            <main className="w-full max-w-5xl px-6 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-16 max-w-2xl">
                    <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">
                        אדריכלות שקופה
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                        תמחור פשוט וקליני,<br />ללא הפתעות אלגוריתמיות.
                    </h1>
                    <p className="text-lg text-white/70 font-medium">
                        האמת צריכה להיות זמינה לכולם. הכלים העצמתיים שלנו דורשים משאבים מורכבים במעבדה ולכן אנו מציעים רמות גישה מדורגות לעומק המידע.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1 rounded-full mb-16 border border-white/20 shadow-sm">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white/5 backdrop-blur-md text-white shadow-sm' : 'text-white/60 hover:text-white/90'}`}
                    >
                        תשלום חודשי
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white/5 backdrop-blur-md text-white shadow-sm' : 'text-white/60 hover:text-white/90'}`}
                    >
                        תשלום שנתי
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">חיסכון 20%</span>
                    </button>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">

                    {/* Free Tier */}
                    <div className="flex flex-col p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-md border border-white/20 shadow-sm hover:shadow-md transition-all relative">
                        <div className="mb-6 border-b border-white/10 pb-6">
                            <h3 className="text-xl font-bold text-white mb-2">אדריכל חופשי (Free)</h3>
                            <p className="text-white/60 text-sm h-10">חיפוש בסיסי וגישה לדוחות המבוא של מעבדת Aether.</p>
                            <div className="mt-8 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">₪0</span>
                                <span className="text-white/50 font-medium tracking-wide">/ לחודש</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            {['מנוע חיפוש מבוסס אינטנטים', 'תקצירי Lab בסיסיים', 'שמירה של עד 5 כלים בתיקייה (My Stack)', 'חיווי Trust Score ציבורי'].map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-neutral-300 shrink-0" />
                                    <span className="text-white/80 font-medium text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-4 rounded-xl border border-white/20 text-white font-bold text-sm bg-white/5 backdrop-blur-md hover:bg-white/10 backdrop-blur-md transition-colors">
                            התחל בחינם עכשיו
                        </button>
                    </div>

                    {/* Pro Tier (Highlighted) */}
                    <div className="flex flex-col p-8 md:p-10 rounded-3xl bg-white/20 backdrop-blur-md border border-white/10 shadow-xl relative overflow-hidden transform md:-translate-y-4 z-10">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 backdrop-blur-md/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="mb-6 border-b border-white/10 pb-6 relative">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-400" />
                                אדריכל מתקדם (Pro)
                            </h3>
                            <p className="text-white/50 text-sm h-10">גישה מלאה לעומק הכספת, ניתוחי העדפות ומסד הנתונים הקליני.</p>
                            <div className="mt-8 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">
                                    {billingCycle === 'monthly' ? '₪49' : '₪39'}
                                </span>
                                <span className="text-white/60 font-medium tracking-wide">/ לחודש</span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-emerald-400/80 text-xs mt-2 font-medium">החיוב הינו שנתי (₪468 קבוע)</p>
                            )}
                        </div>
                        <ul className="space-y-4 mb-10 flex-1 relative">
                            {['גישה מלאה לעומק הכספת (Vault)', 'דוחות מפורטים של Pros/Cons', 'התאמות אינטנט מדויקות ללא הגבלה', 'שמירת כלים ומעקב טרנדים בספריות', 'ניתוחי עקומת למידה ותמחור נסתר', 'תמיכה בעדיפות (Client First)'].map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-neutral-200 font-medium text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="/upgrade" className="w-full py-4 text-center rounded-xl bg-white/5 backdrop-blur-md text-white font-bold text-sm hover:bg-white/10 backdrop-blur-md transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] relative block">
                            שדרג לפרימיום
                        </a>
                    </div>

                </div>

                {/* Enterprise/API Teaser */}
                <div className="mt-16 text-center">
                    <p className="text-white/60 text-sm font-medium">בונה פלטפורמה? מעוניין בנתוני המעבדה ב-JSON?</p>
                    <a href="/api-docs" className="inline-flex items-center gap-2 mt-2 text-white font-bold hover:underline underline-offset-4 decoration-2 decoration-neutral-300 transition-all">
                        קרא על ה-API האדריכלי שלנו (למפתחים)
                    </a>
                </div>

            </main>
        </div>
    );
}
