import { useState } from "react";
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
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {demo && (
          <span className="text-xs font-display bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1">
            <Zap className="w-3 h-3" /> Demo Mode
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {open && (
        <div className="fixed top-14 right-4 z-50 glass glow-border rounded-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-bold text-foreground">Configuration</span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-6 w-6 p-0 text-muted-foreground">
              <X className="w-3 h-3" />
            </Button>
          </div>

          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={demo}
              onChange={(e) => setDemo(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Demo Mode (no backend needed)</span>
          </label>

          {!demo && (
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-api.onrender.com"
              className="bg-muted/50 border-border/50 text-foreground text-sm mb-3"
            />
          )}

          <Button onClick={handleSave} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xs">
            Save & Reload
          </Button>
        </div>
      )}
    </>
  );
};

export default ApiConfig;
