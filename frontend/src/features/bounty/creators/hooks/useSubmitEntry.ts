import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmissionFormData } from '../types/types';
import { SubmissionWithRelationships } from '@/models/Relationships';
import { Submission } from '@/models/Submissions';

// API functions for submissions
const fetchSubmissions = async (bountyId?: string): Promise<SubmissionWithRelationships[]> => {
  const url = bountyId ? `/api/submissions?bountyId=${bountyId}` : '/api/submissions';
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  
  const data = await response.json();
  
  // Convert Submission to SubmissionWithRelationships
  const submissionsWithRelationships: SubmissionWithRelationships[] = data.submissions.map((sub: Submission) => ({
    ...sub,
    // In a real implementation, we would fetch the related bounty and creator user
    bounty: undefined,
    creatorUser: undefined
  }));
  
  return submissionsWithRelationships;
};

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
  submissions: SubmissionWithRelationships[];
  isSubmitting: boolean;
  submitEntry: (formData: SubmissionFormData) => Promise<SubmissionWithRelationships>;
  hasActiveSubmission: boolean;
  latestSubmission: SubmissionWithRelationships | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing submission state and operations
 * Handles submission creation, validation, and status tracking using React Query
 * @param bountyId - Optional bounty ID to filter submissions for a specific bounty
 */
export const useSubmitEntry = (bountyId?: string): UseSubmitEntryReturn => {
  const queryClient = useQueryClient();
  
  // Fetch submissions
  const { 
    data: submissions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<SubmissionWithRelationships[], Error>({
    queryKey: ['submissions', bountyId],
    queryFn: () => fetchSubmissions(bountyId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Submit a new entry
  const submitMutation = useMutation<SubmissionWithRelationships, Error, SubmissionFormData>({
    mutationFn: submitEntryAPI,
    onSuccess: (newSubmission) => {
      // Update the submissions cache with the new submission
      queryClient.setQueryData<SubmissionWithRelationships[]>(['submissions', bountyId], (oldSubmissions = []) => [
        newSubmission,
        ...oldSubmissions
      ]);
      
      // Optionally invalidate the query to refetch
      // queryClient.invalidateQueries(['submissions', bountyId]);
    },
    onError: (error) => {
      console.error('Failed to submit entry:', error);
    }
  });

  // Check if user has an active submission
  const hasActiveSubmission = submissions.some(
    submission => submission.status === 'pending'
  );

  // Get the latest submission
  const latestSubmission = submissions.length > 0 ? submissions[0] : null;

  return {
    submissions,
    isSubmitting: submitMutation.isPending,
    submitEntry: submitMutation.mutateAsync,
    hasActiveSubmission,
    latestSubmission,
    isLoading,
    isError,
    error: error || submitMutation.error
  };
};
