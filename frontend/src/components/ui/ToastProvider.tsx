// ===== TOAST PROVIDER =====
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, ...toast };
    setToasts((prev) => [...prev, item]);
    const duration = toast.duration ?? (toast.type === 'error' ? 5000 : 3000);
    window.setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <Toast key={t.id} type={t.type} message={t.message} onClose={() => remove(t.id)} />)
        )}
      </div>
    </ToastContext.Provider>
  );
};

const Toast: React.FC<{ type: ToastType; message: string; onClose: () => void }> = ({ type, message, onClose }) => {
  const styles: Record<ToastType, string> = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };
  return (
    <div className={`rounded-md border px-4 py-3 shadow-sm ${styles[type]} min-w-[260px] max-w-sm`}> 
      <div className="flex items-start justify-between space-x-4">
        <p className="text-sm leading-5">{message}</p>
        <button onClick={onClose} className="text-current/60 hover:text-current">✕</button>
      </div>
    </div>
  );
};

export default ToastProvider;




