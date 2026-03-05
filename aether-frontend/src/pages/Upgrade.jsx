import React from 'react';
import { ArrowLeft, CheckCircle, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Upgrade() {
    const navigate = useNavigate();

    return (
        <div className="w-full flex flex-col items-center pt-16 pb-24 rtl animate-in fade-in duration-700" dir="rtl">
            <main className="w-full max-w-4xl px-6 flex flex-col md:flex-row gap-8">

                {/* Visual / Info Column */}
                <div className="flex-1 flex flex-col pt-8 md:pr-4">
                    <button onClick={() => navigate(-1)} className="self-start text-white/50 hover:text-white mb-8 transition-colors flex items-center gap-2 text-sm font-bold">
                        <ArrowLeft className="w-4 h-4" /> חזרה לחבילות
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                        שדרוג ל-<span className="text-emerald-600">Aether Pro</span>
                    </h1>
                    <p className="text-white/70 font-medium leading-relaxed mb-8">
                        קבל גישה מלאה לכספת הנתונים האדריכלית, ללא הגבלות, ללא מסננים מסחריים. רק האמת המחקרית, זמינה 24/7.
                    </p>

                    <div className="space-y-4 mb-8">
                        {['גישה לכל דוחות ה-Pros/Cons המלאים', 'התאמות אינטנט מקסימליות ללא הגבלה', 'שמירת כלים ומעקב בספריות אישיות'].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-white/80 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <Shield className="w-8 h-8 text-white/50 shrink-0" />
                        <p className="text-xs text-white/60 font-medium">
                            התשלום מאובטח בתקני ההצפנה המחמירים ביותר. ללא התחייבות, ניתן לביטול בכל עת מלוח הבקרה.
                        </p>
                    </div>
                </div>

                {/* Checkout Column */}
                <div className="flex-1 flex justify-center md:justify-end">
                    <div className="w-full max-w-sm flex flex-col p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/20 shadow-xl relative overflow-hidden">
                        {/* Decorative Top */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                            <div>
                                <h3 className="font-bold text-white text-lg">Aether Pro</h3>
                                <p className="text-sm text-white/60">תשלום חודשי</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-white">₪49</span>
                            </div>
                        </div>

                        {/* Minimalist Payment Placeholder */}
                        <div className="space-y-4 mb-8">
                            <div className="w-full">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">שם על הכרטיס</label>
                                <input type="text" placeholder="ישראל ישראלי" className="w-full p-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-neutral-900 focus:border-white/20 outline-none transition-all placeholder:text-white/50" />
                            </div>
                            <div className="w-full">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">מספר כרטיס</label>
                                <div className="w-full flex items-center bg-white/5 backdrop-blur-md border border-white/20 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-neutral-900 focus-within:border-white/20 transition-all">
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-transparent outline-none text-white font-medium placeholder:text-white/50" dir="ltr" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">תוקף</label>
                                    <input type="text" placeholder="MM/YY" className="w-full p-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium outline-none placeholder:text-white/50 text-center" dir="ltr" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">CVC</label>
                                    <input type="text" placeholder="123" className="w-full p-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium outline-none placeholder:text-white/50 text-center" dir="ltr" />
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/10 backdrop-blur-md text-white font-bold text-sm shadow-lg flex justify-center items-center gap-2 transition-transform active:scale-[0.98]">
                            <Zap className="w-4 h-4" /> תשלום ופתיחת הכספת
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
