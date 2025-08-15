import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BountyCreationRequest, Bounty } from '@/models/Bounty';

interface CreateBountyResponse {
  message: string;
  bounty: Bounty;
}

const createBountyAPI = async (data: BountyCreationRequest): Promise<CreateBountyResponse> => {
  const response = await fetch('/api/bounty/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create bounty');
  }

  return response.json();
};

export const useCreateBounty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBountyAPI,
    onSuccess: (data) => {
      console.log('Bounty created successfully:', data);
      // Add the new bounty to the cache immediately
      queryClient.setQueryData<Bounty[]>(['adminBounties'], (oldBounties = []) => {
        return [...oldBounties, data.bounty];
      });
      // Invalidate and refetch bounties list if it exists
      queryClient.invalidateQueries({ queryKey: ['adminBounties'] });
    },
    onError: (error: Error) => {
      console.error('Error creating bounty:', error);
    },
  });
};