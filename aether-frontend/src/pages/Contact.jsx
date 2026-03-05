import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
    const navigate = useNavigate();

    return (
        <div className="w-full flex flex-col items-center pt-24 pb-24 rtl animate-in fade-in duration-700" dir="rtl">
            <main className="w-full max-w-2xl px-6">

                {/* Header */}
                <div className="mb-16">
                    <button onClick={() => navigate(-1)} className="text-white/50 hover:text-white mb-8 transition-colors flex items-center gap-2 text-sm font-bold bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 aspect-fit inline-flex w-auto">
                        <ArrowLeft className="w-4 h-4" /> חזרה
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        יצירת קשר
                    </h1>
                    <p className="text-lg text-white/70 font-medium leading-relaxed">
                        יש לך מידע על כלי שפספסנו? רוצה לדווח על חוסר דיוק בנתוני המעבדה שלנו? אנחנו כאן כדי לשמוע.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-10 shadow-sm">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">שם מלא</label>
                                <input type="text" placeholder="ישראל ישראלי" className="w-full p-3.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-neutral-900 outline-none transition-all placeholder:text-white/50" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">אימייל לחזרה</label>
                                <input type="email" placeholder="email@example.com" className="w-full p-3.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium font-mono text-sm focus:ring-2 focus:ring-neutral-900 outline-none transition-all placeholder:text-white/50" dir="ltr" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">נושא הפנייה</label>
                            <select className="w-full p-3.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-neutral-900 outline-none transition-all appearance-none">
                                <option>הצעה לבדיקת כלי במעבדה</option>
                                <option>דיווח על חוסר דיוק</option>
                                <option>פנייה עסקית / שותפות אקדמית</option>
                                <option>אחר</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">תוכן ההודעה</label>
                            <textarea placeholder="פרט כאן את תוכן הפנייה בצורה הברורה ביותר..." className="w-full p-3.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-neutral-900 outline-none transition-all placeholder:text-white/50 resize-none h-32 leading-relaxed text-sm"></textarea>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs text-white/60 font-medium inline-flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> אנחנו עונים קלינית מהר, בדרך כלל תוך שעות.
                            </span>
                            <button type="submit" className="px-8 py-3.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/10 backdrop-blur-md text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]">
                                שלח פנייה
                            </button>
                        </div>
                    </form>
                </div>

            </main>
        </div>
    );
}
