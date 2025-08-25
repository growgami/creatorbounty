'use client';

import { useState } from 'react';

interface DeleteBountyResponse {
  message: string;
  deletedBounty: {
    id: string;
    title: string;
  };
}

interface UseDeleteBountyReturn {
  deleteBounty: (bountyId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

export const useDeleteBounty = (): UseDeleteBountyReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBounty = async (bountyId: string): Promise<boolean> => {
    if (!bountyId) {
      setError('Bounty ID is required');
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bounty/delete?id=${encodeURIComponent(bountyId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: DeleteBountyResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Bounty deleted successfully:', data.deletedBounty);
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bounty';
      setError(errorMessage);
      console.error('Error deleting bounty:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteBounty,
    isDeleting,
    error,
  };
};