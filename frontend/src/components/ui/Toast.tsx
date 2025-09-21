// ===== TOAST COMPONENT =====
import React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
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

export default Toast;
