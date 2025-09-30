import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const ToastContext = createContext();

const toastTypes = {
  success: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#10B981" />
        <path d="M8 12.5l2.5 2.5 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-800",
    borderColor: "border-emerald-200"
  },
  error: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#EF4444" />
        <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    borderColor: "border-red-200"
  },
  warning: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4m0 4h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" 
              stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FEF3C7" />
      </svg>
    ),
    bgColor: "bg-amber-50",
    textColor: "text-amber-800",
    borderColor: "border-amber-200"
  },
  info: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#3B82F6" />
        <path d="M12 16v-4m0-4h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    borderColor: "border-blue-200"
  }
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [type, setType] = useState('success');
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, toastType = 'success') => {
    clearTimeout(timeoutRef.current);
    setToast(message);
    setType(toastType);
    setIsVisible(true);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 4000);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setToast(null), 300);
    clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const toastConfig = toastTypes[type] || toastTypes.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-6 right-6 z-50 transition-all duration-300 ease-in-out">
          <div 
            className={`relative flex items-center gap-3 p-4 pr-10 rounded-lg shadow-lg border ${toastConfig.bgColor} ${toastConfig.borderColor} ${toastConfig.textColor} ${
              isVisible ? 'animate-slide-in' : 'animate-slide-out'
            }`}
          >
            <div className="flex-shrink-0">
              {toastConfig.icon}
            </div>
            <span className="text-sm font-medium">{toast}</span>
            <button 
              onClick={hideToast}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateX(100%);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from { 
            opacity: 1;
            transform: translateX(0);
          }
          to { 
            opacity: 0;
            transform: translateX(100%);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-slide-out {
          animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}