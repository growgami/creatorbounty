import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  type: 'approve' | 'reject';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  type,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'approve':
        return <Check className="w-6 h-6 text-green-500" />;
      case 'reject':
        return <X className="w-6 h-6 text-red-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'approve':
        return 'flex-1 bg-cyan-500 text-white py-3 px-6 rounded-full font-medium hover:bg-cyan-600 transition-colors font-space-grotesk';
      case 'reject':
        return 'flex-1 border border-white/20 py-3 px-6 rounded-full font-medium hover:bg-white/5 transition-colors text-white font-space-grotesk';
      default:
        return 'flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full font-medium transition-colors font-space-grotesk';
    }
  };

  const getCancelButtonStyles = () => {
    return 'flex-1 border border-white/20 py-3 px-6 rounded-full font-medium hover:bg-white/5 transition-colors text-white font-space-grotesk';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-white font-space-grotesk">
              {title}
            </h3>
          </div>

          {/* Message */}
          <p className="text-white/80 mb-6 leading-relaxed font-space-grotesk">
            {message}
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className={getCancelButtonStyles()}
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={getConfirmButtonStyles()}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mx-auto"></div>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
