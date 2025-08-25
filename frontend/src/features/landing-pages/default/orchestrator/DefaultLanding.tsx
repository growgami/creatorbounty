'use client';

import React from 'react';
import RBACModal from '@/features/rbac/components/RBAC';
import AnimatedGridBackground from '@/components/backgrounds/AnimatedGridBackground';

const DefaultLanding: React.FC = () => {
  // Auto-open the RBAC modal when this component mounts
  const [isRBACModalOpen] = React.useState(true);

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
        showCancelButton={false}
      />
    </div>
  );
};

export default DefaultLanding;
