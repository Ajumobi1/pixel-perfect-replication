import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface HistoryEntry {
  id: string;
  type: "text-detection" | "humanize" | "media-detection";
  timestamp: Date;
  input: string;
  result: string;
  confidence?: string;
  humanized?: string;
}

interface HistoryContextType {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    setEntries((prev) => [
      { ...entry, id: crypto.randomUUID(), timestamp: new Date() },
      ...prev,
    ]);
  }, []);

  const clearHistory = useCallback(() => setEntries([]), []);

  return (
    <HistoryContext.Provider value={{ entries, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}
