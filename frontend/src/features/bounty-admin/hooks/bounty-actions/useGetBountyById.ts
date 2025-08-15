'use client';

import { useQuery } from '@tanstack/react-query';
import { Bounty } from '@/models/Bounty';

// API function to fetch a single bounty by ID
const fetchBountyById = async (bountyId: string): Promise<Bounty> => {
  const response = await fetch(`/api/bounty/${bountyId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bounty');
  }
  
  return response.json();
};

export const useBountyById = (bountyId: string | null) => {
  const { 
    data: bounty, 
    isLoading,
    isError, 
    error,
    refetch
  } = useQuery<Bounty, Error>({
    queryKey: ['bounty', bountyId],
    queryFn: () => fetchBountyById(bountyId!),
    enabled: !!bountyId, // Only fetch if bountyId is provided
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // Don't keep data in cache
  });
  
  return {
    bounty,
    isLoading,
    isError,
    error,
    refetch
  };
};

export default useBountyById;
