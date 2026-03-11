import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/auth")}
        className="text-xs font-display text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full"
      >
        <User className="w-3.5 h-3.5 mr-1.5" />
        Sign In
      </Button>
    );
  }

  const initial = (user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-primary/20 text-primary font-display font-bold text-xs flex items-center justify-center hover:bg-primary/30 transition-colors"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 glass glow-border rounded-xl p-2 min-w-[180px]"
            >
              <div className="px-3 py-2 border-b border-border/30 mb-1">
                <p className="text-xs font-display font-semibold text-foreground truncate">
                  {user.user_metadata?.full_name || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
              >
                <History className="w-3.5 h-3.5" />
                Scan History
              </button>

              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  navigate("/auth");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
