'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Undo2 } from 'lucide-react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface EnhancedToastProps {
  isVisible: boolean;
  variant: 'success' | 'error';
  message: string;
  action?: ToastAction;
  onHide: () => void;
  duration?: number;
}

const EnhancedToast: React.FC<EnhancedToastProps> = ({
  isVisible,
  variant,
  message,
  action,
  onHide,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onHide]);

  if (!isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-500/15',
          border: 'border-green-500/30',
          text: 'text-green-400',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-red-500/15',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: <XCircle className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-gray-500/15',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          icon: <CheckCircle className="w-5 h-5" />
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
      <div className={`
        ${styles.bg} ${styles.border} 
        backdrop-blur-md border rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4
        shadow-black/20
      `}>
        <div className="flex items-center space-x-4">
          <div className={styles.text}>
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text} font-space-grotesk`}>
              {message}
            </p>
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg 
                ${styles.text} hover:bg-white/10 transition-colors font-space-grotesk text-sm font-medium
              `}
            >
              <Undo2 className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedToast;
