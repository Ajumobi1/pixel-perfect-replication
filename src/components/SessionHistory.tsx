import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, ChevronDown, ScanSearch, Wand2, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistory, type HistoryEntry } from "@/components/HistoryContext";

const typeConfig = {
  "text-detection": { icon: ScanSearch, label: "Text Detection", color: "text-primary" },
  humanize: { icon: Wand2, label: "Humanizer", color: "text-accent" },
  "media-detection": { icon: Shield, label: "Media Scan", color: "text-primary" },
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function EntryCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[entry.type];
  const Icon = config.icon;

  const isWarning =
    entry.result.toLowerCase().includes("ai") ||
    entry.result.toLowerCase().includes("deepfake");

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-xl border border-border/30 overflow-hidden gradient-border"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-muted/20 transition-colors"
      >
        <div className={`p-2 rounded-lg ${entry.type === "humanize" ? "bg-accent/10" : "bg-primary/10"} shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-semibold text-foreground">{config.label}</span>
            <span
              className={`text-[10px] font-display px-2 py-0.5 rounded-full ${
                isWarning ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
              }`}
            >
              {entry.result}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50 font-display tabular-nums">
              {formatTime(entry.timestamp)}
            </span>
            {entry.confidence && (
              <span className="text-[10px] text-muted-foreground/50 font-display ml-1">
                · {entry.confidence}
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2 border-t border-border/20 pt-2.5">
              <div>
                <span className="text-[10px] font-display text-muted-foreground/50 uppercase tracking-wider">Input</span>
                <p className="text-xs text-foreground/80 mt-0.5 line-clamp-3">{entry.input}</p>
              </div>
              {entry.humanized && (
                <div>
                  <span className="text-[10px] font-display text-muted-foreground/50 uppercase tracking-wider">Output</span>
                  <p className="text-xs text-foreground/80 mt-0.5 line-clamp-3">{entry.humanized}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const SessionHistory = () => {
  const { entries, clearHistory } = useHistory();
  const [collapsed, setCollapsed] = useState(false);

  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-hover gradient-border rounded-2xl p-6 md:p-8 noise-overlay"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">Session History</h2>
            <p className="text-sm text-muted-foreground">
              {entries.length} result{entries.length !== 1 ? "s" : ""} this session
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground h-8 px-3 font-display text-xs rounded-lg"
          >
            {collapsed ? "Show" : "Hide"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 max-h-[400px] overflow-y-auto pr-1"
          >
            <AnimatePresence>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SessionHistory;
