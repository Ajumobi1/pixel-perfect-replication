import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiBase, setApiBase, isDemoMode, setDemoMode } from "@/lib/api";

const ApiConfig = () => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(getApiBase());
  const [demo, setDemo] = useState(isDemoMode());

  const handleSave = () => {
    setApiBase(url);
    setDemoMode(demo);
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {demo && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-display bg-accent/10 text-accent px-3 py-1.5 rounded-full flex items-center gap-1.5 glass"
          >
            <Zap className="w-3 h-3" /> Demo
          </motion.span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-foreground glass rounded-full w-9 h-9 p-0"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-16 right-4 z-50 glass glow-border rounded-xl p-5 w-80 gradient-border"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-display font-bold text-foreground">Configuration</span>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-6 w-6 p-0 text-muted-foreground">
                <X className="w-3 h-3" />
              </Button>
            </div>

            <label className="flex items-center gap-2.5 mb-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={demo}
                onChange={(e) => setDemo(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">Demo Mode</span>
            </label>

            {!demo && (
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-api.onrender.com"
                className="bg-muted/30 border-border/40 text-foreground text-sm mb-4 rounded-lg"
              />
            )}

            <Button onClick={handleSave} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xs rounded-lg">
              Save & Reload
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApiConfig;
