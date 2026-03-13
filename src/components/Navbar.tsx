import { motion, AnimatePresence } from "framer-motion";
import { Shield, ScanSearch, Wand2, Image, Film, Menu, X, Smartphone } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: ScanSearch, label: "Detect", href: "#detect" },
  { icon: Wand2, label: "Humanize", href: "#humanize" },
  { icon: Image, label: "Media", href: "#media" },
  { icon: Film, label: "Video", href: "#video-scanner" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } else {
      document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass glow-border rounded-full px-2 py-1.5 flex items-center gap-1"
      >
        <div className="flex items-center gap-1.5 px-3">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold font-display text-gradient hidden sm:inline">TG</span>
        </div>

        <div className="h-4 w-px bg-border/50 hidden sm:block" />

        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => scrollTo(item.href)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-xs font-display"
          >
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </button>
        ))}

        <button
          onClick={() => { navigate("/devices"); setMobileOpen(false); }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-xs font-display"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Devices</span>
        </button>

        <div className="h-4 w-px bg-border/50 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 glass glow-border rounded-2xl p-3 flex flex-col gap-1 min-w-[180px] sm:hidden"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-xs font-display"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => { navigate("/devices"); setMobileOpen(false); }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-xs font-display"
            >
              <Smartphone className="w-4 h-4" />
              <span>Devices</span>
            </button>
            <div className="h-px bg-border/50 my-1" />
            <div className="flex justify-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
