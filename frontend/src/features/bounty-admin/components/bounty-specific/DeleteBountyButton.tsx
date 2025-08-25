'use client';

import React, { useState } from 'react';
import AuraButton from '@/components/ui/AuraButton';
import { useDeleteBounty } from '@/features/bounty-admin/hooks/bounty-actions/useDeleteBounty';

interface DeleteBountyButtonProps {
  bountyId: string;
  bountyTitle: string;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: string) => void;
  className?: string;
}

const DeleteBountyButton: React.FC<DeleteBountyButtonProps> = ({
  bountyId,
  bountyTitle,
  onDeleteSuccess,
  onDeleteError,
  className = ''
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { deleteBounty, isDeleting, error } = useDeleteBounty();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    const success = await deleteBounty(bountyId);
    
    if (success) {
      setShowConfirmation(false);
      onDeleteSuccess?.();
    } else {
      onDeleteError?.(error || 'Failed to delete bounty');
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="text-sm text-gray-300 mr-2">
          Delete &ldquo;{bountyTitle}&rdquo;?
        </div>
        <AuraButton
          size="sm"
          onClick={isDeleting ? undefined : handleConfirmDelete}
          className={`!px-3 !py-1.5 !bg-red-600 hover:!bg-red-700 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isDeleting ? 'Deleting...' : 'Confirm'}
        </AuraButton>
        <AuraButton
          size="sm"
          variant="white"
          onClick={isDeleting ? undefined : handleCancelDelete}
          className={`!px-3 !py-1.5 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Cancel
        </AuraButton>
      </div>
    );
  }

  return (
    <AuraButton
      size="sm"
      onClick={handleDeleteClick}
      className={`flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span>Delete Campaign</span>
    </AuraButton>
  );
};

export default DeleteBountyButton;