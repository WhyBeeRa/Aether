import { useState, useEffect } from "react";
import { Search, Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? "bg-aether-black/80 backdrop-blur-md border-b border-aether-border"
                    : "bg-transparent backdrop-blur-sm"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aether-accent to-blue-600 blur-[2px] opacity-80 animate-pulse" />
                    <span className="text-xl font-medium tracking-tight text-white/90">
                        Aether
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {["Discover", "Library", "Agents", "Settings"].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
}
