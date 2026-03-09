import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { humanizeText, isDemoMode, type HumanizeResult } from "@/lib/api";
import { useHistory } from "@/components/HistoryContext";

const TextHumanizer = () => {
  const { addEntry } = useHistory();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await humanizeText(text);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Humanize failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.humanized) {
      navigator.clipboard.writeText(result.humanized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-hover glow-border rounded-xl p-6 md:p-8 group"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors"
        >
          <Wand2 className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Text Humanizer</h2>
          <p className="text-sm text-muted-foreground">Rewrite AI text to sound more natural</p>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste AI-generated text to humanize..."
        className="min-h-[160px] bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground resize-none mb-4 font-body focus:glow-border transition-shadow duration-300"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-display tabular-nums">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <Button
          onClick={handleHumanize}
          disabled={loading || !text.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display hover-lift"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Humanize
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4"
          >
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display text-primary">Humanized Output</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground h-7 px-2"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="w-3 h-3 text-success" />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy className="w-3 h-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.humanized}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground font-display tabular-nums">
                <span>Words used: {result.words_used}</span>
                <span>Remaining: {result.words_remaining}</span>
              </div>
              {isDemoMode() && (
                <p className="mt-2 text-xs text-muted-foreground/70 italic border-t border-border/30 pt-2">
                  ⚡ Demo result — connect a real API for actual humanization
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TextHumanizer;
