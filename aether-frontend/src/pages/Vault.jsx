import React, { useState, useEffect } from 'react';
import { Shield, Clock, TrendingUp, CheckCircle, Search, Layers, Server, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Vault = ({ setAppError }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse URL params
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("q") || "";

    const [tools, setTools] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    useEffect(() => {
        const fetchVaultData = async () => {
            try {
                setIsLoading(true);
                // Fetch stats
                const statsRes = await fetch('http://127.0.0.1:8000/vault/stats');
                if (!statsRes.ok) throw new Error("Failed to fetch vault stats");
                const statsData = await statsRes.json();
                setStats(statsData);

                // Fetch all tools
                const toolsRes = await fetch('http://127.0.0.1:8000/vault/search?q=');
                if (!toolsRes.ok) throw new Error("Failed to fetch vault data");
                const toolsData = await toolsRes.json();
                setTools(toolsData);
            } catch (err) {
                console.error("Vault fetch error:", err);
                if (setAppError) setAppError("שגיאה בטעינת נתוני הכספת.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVaultData();
    }, [setAppError]);

    const categoryKeywords = {
        'פיתוח קוד': ['code', 'dev', 'react', 'tailwind', 'program', 'cursor', 'v0', 'github'],
        'יצירת תמונות ועיצוב': ['image', 'design', 'midjourney', 'art', 'creative', 'ui', 'dall-e', 'luma'],
        'כתיבה וטקסט': ['text', 'write', 'content', 'chat', 'perplexity', 'claude', 'knowledge', 'gpt', 'model'],
        'עריכת וידאו': ['video', 'film', 'edit', 'heygen', 'runway'],
        'דיבוב ושמע': ['audio', 'music', 'vocal', 'sound', 'suno', 'elevenlabs'],
        'שיווק ו-seo': ['marketing', 'seo', 'sales', 'brand', 'campaign'],
        'מצגות משקיעים': ['present', 'gamma', 'slide', 'deck', 'pitch'],
        'כלים ארגוניים': ['enterprise', 'automat', 'zapier', 'workflow', 'make', 'task', 'api']
    };

    const filteredTools = tools.filter(tool => {
        if (!searchQuery.trim()) return true;

        const qLower = searchQuery.toLowerCase().trim();
        const keywords = categoryKeywords[qLower];

        if (keywords) {
            // Category Match Heuristic
            const intents = tool.analysis?.intents_mapped || [];
            const jobs = tool.analysis?.job_to_be_done || [];
            const text_corpus = (
                tool.tool_name + " " +
                intents.map(i => i.intent_description || "").join(" ") + " " +
                jobs.join(" ")
            ).toLowerCase();
            return keywords.some(k => text_corpus.includes(k));
        }

        // Standard Text Match
        return tool.tool_name.toLowerCase().includes(qLower) ||
            tool.analysis?.intents_mapped?.some(intent => (intent.intent_description || "").toLowerCase().includes(qLower));
    });

    return (
        <div className="w-full flex justify-center pb-24 px-4 sm:px-6 lg:px-8 mt-12 animate-in fade-in duration-700">
            <div className="w-full max-w-5xl">

                {/* Header Section */}
                <div className="mb-12 text-center md:text-right">
                    <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <Server className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        הכספת <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500 font-light mx-2">The Vault</span>
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl text-center md:text-right">
                        מאגר הנתונים המלא של Aether. כאן נמצאת האמת הגולמית, לאחר סינון רעשי השיווק, מגובה בהוכחות ויזואליות ודירוג אמון קפדני. השקיפות בהתגלמותה.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Layers className="w-5 h-5 text-cyan-400 mb-4" />
                        <div className="text-3xl font-bold text-white mb-1">{stats?.verified_tools_count || 0}</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest font-medium">כלים מאומתים</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Shield className="w-5 h-5 text-blue-400 mb-4" />
                        <div className="text-3xl font-bold text-white mb-1">{stats?.average_trust_score?.toFixed(1) || "0.0"}</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest font-medium">ממוצע אמון</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CheckCircle className="w-5 h-5 text-indigo-400 mb-4" />
                        <div className="text-3xl font-bold text-white mb-1">{stats?.total_intents_mapped || 0}</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest font-medium">כוונות שמופו</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Clock className="w-5 h-5 text-emerald-400 mb-4" />
                        <div className="text-lg font-bold text-white mb-1 mt-2 tracking-wider">
                            {stats?.last_scan_date ? new Date(stats.last_scan_date).toLocaleDateString('he-IL') : "N/A"}
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-widest font-medium mt-2">סריקה אחרונה</div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="bg-[#040914]/80 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse" />
                            Live Database
                        </h2>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="חיפוש בכספת..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-white placeholder-white/30"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-12 text-center text-white/50 animate-pulse text-sm">מוציא נתונים מהכספת...</div>
                        ) : filteredTools.length === 0 ? (
                            <div className="p-12 text-center text-white/50 text-sm">לא נמצאו נתונים תואמים.</div>
                        ) : (
                            <table className="w-full text-right text-sm">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase tracking-widest text-[0.65rem] font-medium">
                                        <th className="px-6 py-4 font-medium">שם הכלי</th>
                                        <th className="px-6 py-4 font-medium">Trust Score</th>
                                        <th className="px-6 py-4 font-medium hidden md:table-cell">כוונות מרכזיות</th>
                                        <th className="px-6 py-4 font-medium hidden sm:table-cell">דירוג קושי</th>
                                        <th className="px-6 py-4 font-medium lg:text-center">סטטוס אימות</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredTools.map((tool, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(`/tool/${tool.tool_name.toLowerCase().replace(/\s+/g, '-')}`)}>
                                            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                <Link to={`/tool/${tool.tool_name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-cyan-400 transition-colors">
                                                    {tool.tool_name.charAt(0).toUpperCase() + tool.tool_name.slice(1)}
                                                </Link>
                                                {tool.trust_score >= 90 && (
                                                    <span className="px-2 py-0.5 rounded text-[0.6rem] uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                        Elite
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`font-bold ${tool.trust_score >= 85 ? "text-emerald-400" :
                                                        tool.trust_score >= 70 ? "text-amber-400" : "text-red-400"
                                                        }`}>
                                                        {tool.trust_score.toFixed(1)}
                                                    </div>
                                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                                                        <div
                                                            className={`h-full rounded-full ${tool.trust_score >= 85 ? "bg-emerald-400" :
                                                                tool.trust_score >= 70 ? "bg-amber-400" : "bg-red-400"
                                                                }`}
                                                            style={{ width: `${tool.trust_score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell text-white/60">
                                                <div className="flex flex-wrap gap-1">
                                                    {tool.analysis?.intents_mapped?.slice(0, 2).map((intent, i) => (
                                                        <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded truncate max-w-[150px]" title={intent.intent_description}>
                                                            {intent.intent_description}
                                                        </span>
                                                    ))}
                                                    {tool.analysis?.intents_mapped?.length > 2 && (
                                                        <span className="text-xs text-white/30 px-1 py-1">+{tool.analysis.intents_mapped.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell text-white/50 text-xs">
                                                {tool.analysis?.metrics?.learning_curve || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 lg:text-center">
                                                <div className="inline-flex items-center gap-1.5">
                                                    {tool.trust_score >= 70 ? (
                                                        <Shield className="w-4 h-4 text-cyan-400" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                                    )}
                                                    <span className="text-xs text-white/40">
                                                        {new Date(tool.audit_log?.timestamp || Date.now()).toLocaleDateString('he-IL')}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Vault;
