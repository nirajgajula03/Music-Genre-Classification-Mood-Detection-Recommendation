import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);
const ICONS = { success: CheckCircle2, error: AlertCircle, warning: AlertTriangle, info: Info };
const STYLES = { success: "border-emerald-500/40", error: "border-red-500/40", warning: "border-amber-500/40", info: "border-cyan-500/40" };
const ICON_COLORS = { success: "text-emerald-400", error: "text-red-400", warning: "text-amber-400", info: "text-cyan-400" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const toast = useCallback((message, type = "info", ttl = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (ttl > 0) setTimeout(() => dismiss(id), ttl);
    return id;
  }, [dismiss]);
  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none">
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={`glass p-4 pr-10 flex items-center gap-3 toast-enter pointer-events-auto relative ${STYLES[t.type] || STYLES.info}`}>
              <Icon size={18} className={ICON_COLORS[t.type] || ICON_COLORS.info}/>
              <span className="text-sm text-white flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X size={14}/></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
