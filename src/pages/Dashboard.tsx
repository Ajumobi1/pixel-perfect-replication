import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Film, ScanSearch, Wand2, Shield, ArrowLeft, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";

interface ScanRecord {
  id: string;
  scan_type: string;
  input_text: string | null;
  file_name: string | null;
  result: string;
  confidence: string | null;
  frame_analysis: any;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof ScanSearch; label: string; color: string }> = {
  "text-detection": { icon: ScanSearch, label: "Text Detection", color: "text-primary" },
  humanize: { icon: Wand2, label: "Humanizer", color: "text-accent" },
  "media-detection": { icon: Shield, label: "Media Scan", color: "text-primary" },
  "video-scan": { icon: Film, label: "Video Scan", color: "text-accent" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchScans = async () => {
      const { data } = await supabase
        .from("scan_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setScans((data as ScanRecord[]) || []);
      setLoading(false);
    };
    fetchScans();
  }, [user]);

  const deleteScan = async (id: string) => {
    await supabase.from("scan_results").delete().eq("id", id);
    setScans((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <ParticleField />
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Scan History</h1>
            <p className="text-sm text-muted-foreground">
              {scans.length} scan{scans.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : scans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex p-4 rounded-2xl bg-muted/30 mb-4">
              <History className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-display">No scans yet</p>
            <p className="text-sm text-muted-foreground/50 mt-1">
              Your scan results will appear here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {scans.map((scan, i) => {
                const config = typeConfig[scan.scan_type] || typeConfig["text-detection"];
                const Icon = config.icon;
                const isWarning =
                  scan.result.toLowerCase().includes("ai") ||
                  scan.result.toLowerCase().includes("deepfake");

                return (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass rounded-xl border border-border/30 p-4 gradient-border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          scan.scan_type === "humanize" || scan.scan_type === "video-scan"
                            ? "bg-accent/10"
                            : "bg-primary/10"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-display font-semibold text-foreground">
                            {config.label}
                          </span>
                          <span
                            className={`text-[10px] font-display px-2 py-0.5 rounded-full ${
                              isWarning
                                ? "bg-warning/10 text-warning"
                                : "bg-success/10 text-success"
                            }`}
                          >
                            {scan.result}
                          </span>
                          {scan.confidence && (
                            <span className="text-[10px] text-muted-foreground/50 font-display">
                              {scan.confidence}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-2.5 h-2.5 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground/50 font-display">
                            {new Date(scan.created_at).toLocaleDateString()} ·{" "}
                            {new Date(scan.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {scan.input_text && (
                          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                            {scan.input_text}
                          </p>
                        )}
                        {scan.file_name && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            📎 {scan.file_name}
                          </p>
                        )}
                        {scan.frame_analysis && (
                          <p className="text-xs text-accent/70 mt-1">
                            🎬 {(scan.frame_analysis as any[]).length} frames analyzed
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteScan(scan.id)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
