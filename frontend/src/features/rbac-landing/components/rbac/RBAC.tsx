'use client';

import React from 'react';
import AuraButton from '@/components/shared/ui/AuraButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRole } from '@/features/rbac-landing/hooks/useRole';

interface RBACModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  showCancelButton?: boolean;
}

const RBACModal: React.FC<RBACModalProps> = ({
  isOpen,
  onClose,
  className = '',
  showCancelButton = true
}) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { role } = useRole();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContinue = () => {
    if (role) {
      // Navigate to role-specific page
      const rolePath = role === 'admin' ? 'admin' : 'creator';
      window.location.href = `/${rolePath}`;
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-[#101010] border border-white/10 rounded-lg p-8 max-w-md w-full mx-4 ${className}`}>
        {!isAuthenticated ? (
          // Login Flow
          <>
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold mb-2 font-space-grotesk">
                Welcome to CreatorBounty
              </h2>
              <p className="text-gray-400 text-sm font-space-grotesk">
                Sign in with Twitter to get started
              </p>
            </div>

            <div className="space-y-4">
              <AuraButton
                variant="white"
                size="lg"
                onClick={login}
                className="w-full justify-center py-4 text-lg"
              >
                Sign in with Twitter
              </AuraButton>
            </div>
          </>
        ) : (
          // Authenticated User Display
          <>
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold mb-2 font-space-grotesk">
                Welcome back, {user?.username}!
              </h2>
              <p className="text-gray-400 text-sm font-space-grotesk mb-4">
                Your role has been automatically assigned
              </p>
              
              {/* Role Display */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="text-white font-semibold text-lg font-space-grotesk">
                  Role: <span className="text-blue-400 capitalize">{role || 'Loading...'}</span>
                </div>
                {role === 'admin' && (
                  <p className="text-gray-400 text-sm mt-2">
                    You have admin privileges to manage campaigns
                  </p>
                )}
                {role === 'creator' && (
                  <p className="text-gray-400 text-sm mt-2">
                    You can browse and submit to bounties
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <AuraButton
                variant="white"
                size="lg"
                onClick={role ? handleContinue : undefined}
                className={`w-full justify-center py-4 text-lg ${!role ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continue as {role ? role.charAt(0).toUpperCase() + role.slice(1) : '...'}
              </AuraButton>
              
              <AuraButton
                size="lg"
                onClick={logout}
                className="w-full justify-center py-4 text-lg bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </AuraButton>
            </div>
          </>
        )}

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
