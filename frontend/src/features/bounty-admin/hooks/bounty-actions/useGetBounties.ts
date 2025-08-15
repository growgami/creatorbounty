'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bounty } from '@/models/Bounty';

// API function to fetch all bounties for admin
const fetchAdminBounties = async (): Promise<Bounty[]> => {
  const response = await fetch('/api/bounty/get');
  
  if (!response.ok) {
    throw new Error('Failed to fetch bounties');
  }
  
  const data = await response.json();
  return data.bounties || data;
};

// API function to fetch a single bounty by ID
const fetchBountyById = async (bountyId: string): Promise<Bounty> => {
  const response = await fetch(`/api/bounty/${bountyId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bounty');
  }
  
  return response.json();
};

export const useBounties = () => {
  const queryClient = useQueryClient();
  
  const { 
    data: bounties = [], 
    isLoading,
    isError, 
    error,
    refetch
  } = useQuery<Bounty[], Error>({
    queryKey: ['adminBounties'],
    queryFn: fetchAdminBounties,
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // Don't keep data in cache
  });
  
  // Function to fetch a specific bounty and update cache
  const fetchBounty = async (bountyId: string) => {
    const bounty = await fetchBountyById(bountyId);
    // Update the cache with the new bounty data
    queryClient.setQueryData<Bounty[]>(['adminBounties'], (oldBounties = []) => {
      const existingIndex = oldBounties.findIndex(b => b.id === bountyId);
      if (existingIndex >= 0) {
        const updatedBounties = [...oldBounties];
        updatedBounties[existingIndex] = bounty;
        return updatedBounties;
      }
      // If it's a new bounty, add it to the list
      return [...oldBounties, bounty];
    });
    return bounty;
  };
  
  return {
    bounties,
    isLoading,
    isError,
    error,
    refetch,
    fetchBounty
  };
};

export default useBounties;
