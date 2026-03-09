import { motion } from "framer-motion";
import { Shield, ScanSearch, Wand2, Image } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { icon: ScanSearch, label: "Detect", href: "#detect" },
  { icon: Wand2, label: "Humanize", href: "#humanize" },
  { icon: Image, label: "Media", href: "#media" },
];

const Navbar = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
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

      <div className="h-4 w-px bg-border/50" />

      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => scrollTo(item.href)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-xs font-display"
        >
          <item.icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}

      <div className="h-4 w-px bg-border/50" />
      <ThemeToggle />
    </motion.nav>
  );
};

export default Navbar;
