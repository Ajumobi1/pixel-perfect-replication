import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Copy, Check, ArrowRight, Sparkles } from "lucide-react";
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
      addEntry({
        type: "humanize",
        input: text.slice(0, 200),
        result: `${res.words_used} words humanized`,
        humanized: res.humanized.slice(0, 200),
      });
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
      id="humanize"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-hover gradient-border rounded-2xl p-6 md:p-8 group noise-overlay"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/15 transition-colors"
        >
          <Wand2 className="w-5 h-5 text-accent" />
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
        className="min-h-[180px] bg-muted/30 border-border/40 text-foreground placeholder:text-muted-foreground/50 resize-none mb-4 font-body focus:glow-border transition-shadow duration-300 rounded-xl"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-display tabular-nums">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <Button
          onClick={handleHumanize}
          disabled={loading || !text.trim()}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-display hover-lift group/btn"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Humanize
          {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5"
          >
            <div className="p-5 rounded-xl bg-muted/30 border border-border/40 gradient-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-display text-accent font-semibold">Humanized Output</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground h-7 px-2"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="w-3.5 h-3.5 text-success" />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy className="w-3.5 h-3.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.humanized}</p>
              <div className="flex gap-4 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground font-display tabular-nums">
                <span>Words used: <span className="text-foreground font-semibold">{result.words_used}</span></span>
                <span>Remaining: <span className="text-foreground font-semibold">{result.words_remaining}</span></span>
              </div>
              {isDemoMode() && (
                <p className="mt-3 text-xs text-muted-foreground/60 italic border-t border-border/20 pt-2">
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
