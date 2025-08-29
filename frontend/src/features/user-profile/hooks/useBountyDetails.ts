import { useState, useEffect } from 'react';

interface BountyDetails {
  id: string;
  title: string;
  description: string;
  bountyPool: number;
  tokenSymbol: string;
}

interface UseBountyDetailsReturn {
  bounty: BountyDetails | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch bounty details by ID
 */
export const useBountyDetails = (bountyId: string): UseBountyDetailsReturn => {
  const [bounty, setBounty] = useState<BountyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBountyDetails = async () => {
      if (!bountyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/bounty/creator/${bountyId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bounty details: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setBounty(data.bounty || null);
        setError(null);
      } catch (err) {
        console.error('Error fetching bounty details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setBounty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBountyDetails();
  }, [bountyId]);

  return { bounty, loading, error };
};