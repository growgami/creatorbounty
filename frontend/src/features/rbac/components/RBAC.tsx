'use client';

import React from 'react';
import AuraButton from '@/components/ui/AuraButton';

interface RBACModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: 'admin' | 'creator') => void;
  className?: string;
  showCancelButton?: boolean;
}

const RBACModal: React.FC<RBACModalProps> = ({
  isOpen,
  onClose,
  onRoleSelect,
  className = '',
  showCancelButton = true
}) => {
  if (!isOpen) return null;

  const handleRoleSelect = (role: 'admin' | 'creator') => {
    onRoleSelect(role);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-[#101010] border border-white/10 rounded-lg p-8 max-w-md w-full mx-4 ${className}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-bold mb-2 font-space-grotesk">
            Who are you?
          </h2>
          <p className="text-gray-400 text-sm font-space-grotesk">
            Select your role to continue
          </p>
        </div>

        {/* Role Selection Buttons */}
        <div className="space-y-4">
          <AuraButton
            variant="white"
            size="lg"
            onClick={() => handleRoleSelect('admin')}
            className="w-full justify-center py-4 text-lg"
          >
            Admin
          </AuraButton>
          
          <AuraButton
            size="lg"
            onClick={() => handleRoleSelect('creator')}
            className="w-full justify-center py-4 text-lg"
          >
            Creator
          </AuraButton>
        </div>

        {/* Close Button */}
        {showCancelButton && (
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm transition-colors font-space-grotesk"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RBACModal;
