import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiBase, setApiBase } from "@/lib/api";

const ApiConfig = () => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(getApiBase());

  const handleSave = () => {
    setApiBase(url);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 text-muted-foreground hover:text-foreground"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {open && (
        <div className="fixed top-14 right-4 z-50 glass glow-border rounded-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-bold text-foreground">API Configuration</span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-6 w-6 p-0 text-muted-foreground">
              <X className="w-3 h-3" />
            </Button>
          </div>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:5000"
            className="bg-muted/50 border-border/50 text-foreground text-sm mb-3"
          />
          <Button onClick={handleSave} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xs">
            Save
          </Button>
        </div>
      )}
    </>
  );
};

export default ApiConfig;
