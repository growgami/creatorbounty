import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmissionFormData } from '../types/types';
import { SubmissionWithRelationships } from '@/models/Relationships';
import { useAuth } from '@/features/auth/hooks/useAuth';

// API function for submitting entries
const submitEntryAPI = async (formData: SubmissionFormData): Promise<SubmissionWithRelationships> => {
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit entry');
  }
  
  const data = await response.json();
  
  // Convert Submission to SubmissionWithRelationships
  const submissionWithRelationships: SubmissionWithRelationships = {
    ...data.submission,
    // In a real implementation, we would fetch the related bounty and creator user
    bounty: undefined,
    creatorUser: undefined
  };
  
  return submissionWithRelationships;
};

interface UseSubmitEntryReturn {
  isSubmitting: boolean;
  submitEntry: (formData: SubmissionFormData) => Promise<SubmissionWithRelationships>;
  error: Error | null;
}

/**
 * Custom hook for handling submission mutations
 * Handles only submission creation and cache invalidation
 * @param bountyId - Optional bounty ID for cache invalidation
 */
export const useSubmitEntry = (bountyId?: string): UseSubmitEntryReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Submit a new entry
  const submitMutation = useMutation<SubmissionWithRelationships, Error, SubmissionFormData>({
    mutationFn: submitEntryAPI,
    onSuccess: (newSubmission) => {
      // Update the submissions cache with the new submission
      queryClient.setQueryData<SubmissionWithRelationships[]>(['submissions', bountyId, user?.username], (oldSubmissions = []) => [
        newSubmission,
        ...oldSubmissions
      ]);
      
      // Invalidate creator bounty cache to refetch userSubmission and canSubmit status
      queryClient.invalidateQueries({
        queryKey: ['creator-bounty', bountyId, user?.username]
      });
      
      // Also invalidate the submissions cache to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['submissions', bountyId, user?.username]
      });
    },
    onError: (error) => {
      console.error('Failed to submit entry:', error);
    }
  });

  return {
    isSubmitting: submitMutation.isPending,
    submitEntry: submitMutation.mutateAsync,
    error: submitMutation.error as Error | null,
  };
};
