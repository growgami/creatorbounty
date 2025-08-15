'use client';

import React from 'react';
import RBACModal from '@/features/rbac/components/RBAC';
import AnimatedGridBackground from '@/components/backgrounds/AnimatedGridBackground';
import { useRole } from '@/features/rbac/hooks/useRole';

const DefaultLanding: React.FC = () => {
  const { setRole } = useRole();
  
  // Auto-open the RBAC modal when this component mounts
  const [isRBACModalOpen, setIsRBACModalOpen] = React.useState(true);

  const handleRoleSelect = (role: 'admin' | 'creator') => {
    setRole(role);
    // Close the modal after role selection
    setIsRBACModalOpen(false);
  };

  const handleClose = () => {
    // Keep the modal open since it's the only content
    // In a real app, you might want to redirect or show an error
  };

  return (
    <div className="min-h-screen bg-[#222] relative">
      {/* Animated Grid Background */}
      <AnimatedGridBackground />
      {/* RBAC Modal - the only content on the page */}
      <RBACModal
        isOpen={isRBACModalOpen}
        onClose={handleClose}
        onRoleSelect={handleRoleSelect}
        showCancelButton={false}
      />
    </div>
  );
};

export default DefaultLanding;
