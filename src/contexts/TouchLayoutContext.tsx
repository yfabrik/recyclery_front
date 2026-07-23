import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "touchLayout";

interface TouchLayoutContextValue {
  isTouchLayout: boolean;
  toggleTouchLayout: () => void;
}

const TouchLayoutContext = createContext<TouchLayoutContextValue | null>(null);

function readStoredTouchLayout(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function TouchLayoutProvider({ children }: { children: ReactNode }) {
  const [isTouchLayout, setIsTouchLayout] = useState(readStoredTouchLayout);

  const toggleTouchLayout = useCallback(() => {
    setIsTouchLayout((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isTouchLayout, toggleTouchLayout }),
    [isTouchLayout, toggleTouchLayout],
  );

  return (
    <TouchLayoutContext.Provider value={value}>
      {children}
    </TouchLayoutContext.Provider>
  );
}

export function useTouchLayout() {
  const context = useContext(TouchLayoutContext);
  if (!context) {
    throw new Error("useTouchLayout must be used within TouchLayoutProvider");
  }
  return context;
}
