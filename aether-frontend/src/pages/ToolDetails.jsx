import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertTriangle, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

export default function ToolDetails({ setAppError }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tool, setTool] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE = "http://localhost:8000";

    useEffect(() => {
        const fetchToolData = async () => {
            setIsLoading(true);
            setAppError(null);

            try {
                // Fetch the specific tool by Name/ID. 
                // In Aether, the ID is typically the tool_name currently.
                const response = await fetch(`${API_BASE}/tool/${encodeURIComponent(id)}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setAppError(`הכלי "${id}" לא נמצא באינדקס שלנו.`);
                        navigate('/'); // Clinical Fallback: silently return home
                        return;
                    }
                    throw new Error("Failed to fetch tool details");
                }

                const data = await response.json();
                setTool(data);

            } catch (error) {
                setAppError("לא הצלחנו לטעון את נתוני הכלי כרגע. נסה שוב מאוחר יותר.");
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchToolData();
        }
    }, [id, navigate, setAppError]);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center w-full animate-in fade-in duration-500">
                <span className="text-white/60 font-medium text-sm tracking-widest uppercase">מאחזר נתונים מהכספת...</span>
            </div>
        );
    }

    if (!tool) return null;

    // Safety accessors for the nested API data
    const analysis = tool.analysis || {};
    const executiveSummary = analysis.executive_summary || "אין תקציר מנהלים זמין.";
    const stringsPros = analysis.pros || [];
    const stringsCons = analysis.cons || [];
    const useCases = analysis.use_cases || [];
    const intentsMapped = analysis.intents_mapped || [];
    const metrics = analysis.metrics || {};

    // Deep Intelligence Fields
    const limitations = analysis.limitations || [];
    const privacyPolicy = analysis.privacy_policy || 'לא ידוע (דרוש אימות נוסף)';
    const socialProof = analysis.social_proof || null;

    // Determine trusting UI color scale (Aether Trust Score)
    const trustScore = tool.trust_score || 0;
    const isHighlyTrusted = trustScore >= 90;
    const isModeratelyTrusted = trustScore >= 70 && trustScore < 90;

    const trustColorText = isHighlyTrusted ? 'text-emerald-500' : isModeratelyTrusted ? 'text-amber-500' : 'text-red-500';
    const trustColorBg = isHighlyTrusted ? 'bg-emerald-50' : isModeratelyTrusted ? 'bg-amber-50' : 'bg-red-50';
    const trustColorBorder = isHighlyTrusted ? 'border-emerald-200' : isModeratelyTrusted ? 'border-amber-200' : 'border-red-200';

    // MY STACK (LOCAL STORAGE LOGIC)
    const [isSaved, setIsSaved] = useState(false);
    const toolId = tool.id || tool.name?.trim().toLowerCase().replace(/\s+/g, '-');

    useEffect(() => {
        if (toolId) {
            const savedStack = JSON.parse(localStorage.getItem('aether_saved_stack') || '[]');
            setIsSaved(savedStack.includes(toolId));
        }
    }, [toolId]);

    const toggleSave = () => {
        if (!toolId) return;
        let savedStack = JSON.parse(localStorage.getItem('aether_saved_stack') || '[]');

        if (isSaved) {
            savedStack = savedStack.filter(id => id !== toolId);
            setIsSaved(false);
        } else {
            savedStack.push(toolId);
            setIsSaved(true);
        }
        localStorage.setItem('aether_saved_stack', JSON.stringify(savedStack));
    };

    return (
        <div className="w-full max-w-4xl flex flex-col items-center pb-24 animate-in slide-in-from-bottom-4 fade-in duration-700 rtl" dir="rtl">

            {/* Nav Back */}
            <div className="w-full flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowRight className="w-4 h-4" />
                    חזרה לתוצאות
                </button>

                {/* Save to Stack Button */}
                <button
                    onClick={toggleSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isSaved ? 'bg-white/10 border-white/30 text-white shadow-sm' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20'}`}
                >
                    {isSaved ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> במחסנית שלי</>
                    ) : (
                        <><ShieldCheck className="w-4 h-4" /> שמור למחסנית</>
                    )}
                </button>
            </div>

            {/* Header: The Truth Card Identity */}
            <div className={`w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 mb-8 border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isHighlyTrusted ? 'border-white/20' : 'border-white/20'}`}>

                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold text-white mb-2 truncate max-w-lg">{tool.name}</h1>
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <span className="text-white/60">Aether Objective Analysis</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                        <span className={`${tool.status === 'verified' ? 'text-emerald-600' : 'text-amber-600'} flex items-center gap-1`}>
                            {tool.status === 'verified' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {tool.status === 'verified' ? 'מאומת' : 'בבדיקה'}
                        </span>
                    </div>
                </div>

                {/* Trust Score Badge */}
                <div className={`flex flex-col items-center justify-center p-4 rounded-2xl w-32 border ${trustColorBg} ${trustColorBorder}`}>
                    <span className="text-xs uppercase tracking-widest font-semibold text-white/60 mb-1">Trust Score</span>
                    <span className={`text-4xl font-bold ${trustColorText}`}>{trustScore.toFixed(1)}</span>
                </div>
            </div>

            {/* Section 1: Executive Summary */}
            <section className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/20 shadow-xl mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2 h-full bg-white/20 backdrop-blur-md rounded-r-3xl transition-all group-hover:w-3"></div>
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">תקציר מנהלים / Executive Summary</h2>
                <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed font-medium">
                    {executiveSummary}
                </p>

                {/* Technical Meta Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 mt-8 border-t border-white/10">
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">עקומת למידה</span>
                        <span className="text-white text-sm font-semibold">{metrics.learning_curve || 'לא ידוע'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">תמחור</span>
                        <span className="text-white text-sm font-semibold">{metrics.pricing || 'לא ידוע'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">אינטגרציה חכמה</span>
                        <span className="text-white text-sm font-semibold">{metrics.integration || 'API / Web'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">אומת לאחרונה</span>
                        <span className="text-white text-sm font-semibold">{metrics.last_verified ? new Date(metrics.last_verified).toLocaleDateString('he-IL') : 'היום'}</span>
                    </div>
                </div>
            </section>

            {/* INTENT PIPELINE - NEW SECTION */}
            {intentsMapped.length > 0 && (
                <section className="w-full mb-8">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 pr-2">אינטנטים מאומתים</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {intentsMapped.map((intent, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm hover:border-white/30 transition-all">
                                <div className="flex flex-col mb-3 md:mb-0">
                                    <span className="text-white font-bold mb-1">{intent.intent_description}</span>
                                    {intent.trade_off && (
                                        <span className="text-white/60 text-xs flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                                            {intent.trade_off}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-2.5 bg-white/10 backdrop-blur-md rounded-full overflow-hidden">
                                        <div className="h-full bg-white/20 backdrop-blur-md rounded-full" style={{ width: `${intent.success_score}%` }}></div>
                                    </div>
                                    <span className="text-sm font-black text-white w-12 text-left">{intent.success_score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Section 2: Clinical Matrix (Pros / Cons) */}
            <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

                {/* PROS */}
                <div className="flex flex-col p-8 rounded-3xl bg-emerald-50/50 border border-emerald-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        יתרונות (למה כן)
                    </h3>
                    <ul className="space-y-4">
                        {stringsPros.length > 0 ? stringsPros.map((pro, index) => {
                            const parts = pro.split(':');
                            const hasTitle = parts.length > 1;
                            return (
                                <li key={index} className="flex items-start gap-4 text-emerald-900 text-sm leading-relaxed">
                                    <span className="text-emerald-500 font-bold mt-1 text-lg leading-none">•</span>
                                    <div>
                                        {hasTitle ? (
                                            <><span className="font-bold block mb-1">{parts[0]}</span><span className="text-emerald-700">{parts.slice(1).join(':')}</span></>
                                        ) : (
                                            <span className="text-emerald-800">{pro}</span>
                                        )}
                                    </div>
                                </li>
                            )
                        }) : (
                            <li className="text-emerald-400 text-sm">אין נתונים מאומתים.</li>
                        )}
                    </ul>
                </div>

                {/* CONS & LIMITATIONS */}
                <div className="flex flex-col p-8 rounded-3xl bg-amber-50/50 border border-amber-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-amber-500" />
                        חסרונות (למה לא)
                    </h3>
                    <ul className="space-y-4 mb-6">
                        {stringsCons.length > 0 ? stringsCons.map((con, index) => {
                            const parts = con.split(':');
                            const hasTitle = parts.length > 1;
                            return (
                                <li key={index} className="flex items-start gap-4 text-amber-900 text-sm leading-relaxed">
                                    <span className="text-amber-500 font-bold mt-1 text-lg leading-none">•</span>
                                    <div>
                                        {hasTitle ? (
                                            <><span className="font-bold block mb-1">{parts[0]}</span><span className="text-amber-700">{parts.slice(1).join(':')}</span></>
                                        ) : (
                                            <span className="text-amber-800">{con}</span>
                                        )}
                                    </div>
                                </li>
                            )
                        }) : (
                            <li className="text-amber-400 text-sm">אין נתונים מאומתים.</li>
                        )}
                    </ul>

                    {/* DEEP INTELLIGENCE: Limitations (Phase 7 expansion) */}
                    {limitations.length > 0 && (
                        <div className="mt-auto border-t border-amber-500/10 pt-4">
                            <h4 className="text-xs font-bold text-amber-900/60 uppercase tracking-widest mb-3">מגבלות טכניות קשיחות</h4>
                            <ul className="space-y-2">
                                {limitations.map((lim, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-amber-800/80 text-xs">
                                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                                        <span>{lim}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            {/* DEEP INTELLIGENCE: Privacy & Social Proof */}
            <section className="w-full flex flex-col md:flex-row gap-6 mb-12">
                <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">מדיניות פרטיות</span>
                        <span className="text-white/90 text-sm font-medium leading-relaxed">{privacyPolicy}</span>
                    </div>
                </div>
                {socialProof && (
                    <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm flex items-start gap-4">
                        <div className="text-2xl text-white/30 font-serif leading-none mt-1">"</div>
                        <div className="flex flex-col">
                            <span className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">עדויות שטח</span>
                            <span className="text-white/90 text-sm italic leading-relaxed">{socialProof}</span>
                        </div>
                    </div>
                )}
            </section>

            {/* Section 3: Targeted Use Cases (Pills) */}
            <section className="w-full mb-12">
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6">תרחישי שימוש אידיאליים</h2>
                <div className="flex flex-wrap gap-2">
                    {useCases.length > 0 ? useCases.map((uc, index) => (
                        <div key={index} className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/20 text-white/80 text-sm font-medium shadow-sm">
                            {uc}
                        </div>
                    )) : (
                        <span className="text-white/50 text-sm">לא הוגדרו תרחישים ספציפיים.</span>
                    )}
                </div>
            </section>

            {/* Final CTA Launcher */}
            <div className="w-full flex justify-center mt-8 border-t border-white/10 pt-12">
                <button className="flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/10 backdrop-blur-md transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    הפעל את הכלי
                    <ExternalLink className="w-5 h-5" />
                </button>
            </div>

        </div>
    );
}
