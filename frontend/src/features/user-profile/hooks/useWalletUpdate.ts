import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface UseWalletUpdateReturn {
  updateWalletAddress: (address: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to update user's wallet address
 */
export const useWalletUpdate = (): UseWalletUpdateReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { update } = useSession();

  const updateWalletAddress = async (address: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update wallet address');
      }

      // Update the session to reflect the new wallet address
      if (update) {
        await update({
          wallet_address: address,
        });
      }

      return true;
    } catch (err) {
      console.error('Error updating wallet address:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateWalletAddress, loading, error };
};