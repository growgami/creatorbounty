import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmissionFormData, SubmissionData, SubmissionStatus } from '../types/types';
import { SubmissionWithRelationships } from '@/models/Relationships';

// Mock API functions - these should be replaced with actual API calls
const fetchSubmissions = async (): Promise<SubmissionWithRelationships[]> => {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockSubmissions: SubmissionData[] = JSON.parse(localStorage.getItem('submissions') || '[]');
      // Convert SubmissionData to SubmissionWithRelationships
      const submissionsWithRelationships: SubmissionWithRelationships[] = mockSubmissions.map(sub => ({
        ...sub,
        // In a real implementation, we would fetch the related bounty and creator user
        bounty: undefined,
        creatorUser: undefined
      }));
      resolve(submissionsWithRelationships);
    }, 1500);
  });
};

const submitEntryAPI = async (formData: SubmissionFormData): Promise<SubmissionWithRelationships> => {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newSubmission: SubmissionWithRelationships = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bountyId: formData.bountyId,
        creator: formData.creator,
        creatorPfp: formData.creatorPfp,
        submitted_url: formData.tiktokUrl,
        status: 'pending' as SubmissionStatus,
        createdAt: now,
        updatedAt: now,
        // In a real implementation, we would fetch the related bounty and creator user
        bounty: undefined,
        creatorUser: undefined
      };
      
      // Get existing submissions from localStorage
      const existingSubmissions: SubmissionData[] = JSON.parse(localStorage.getItem('submissions') || '[]');
      
      // Add new submission to the beginning of the array
      const updatedSubmissions = [newSubmission, ...existingSubmissions];
      
      // Save to localStorage
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      
      resolve(newSubmission);
    }, 1500);
  });
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
 */
export const useSubmitEntry = (): UseSubmitEntryReturn => {
  const queryClient = useQueryClient();
  
  // Fetch submissions
  const { 
    data: submissions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<SubmissionWithRelationships[], Error>({
    queryKey: ['submissions'],
    queryFn: fetchSubmissions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Submit a new entry
  const submitMutation = useMutation<SubmissionWithRelationships, Error, SubmissionFormData>({
    mutationFn: submitEntryAPI,
    onSuccess: (newSubmission) => {
      // Update the submissions cache with the new submission
      queryClient.setQueryData<SubmissionWithRelationships[]>(['submissions'], (oldSubmissions = []) => [
        newSubmission,
        ...oldSubmissions
      ]);
      
      // Optionally invalidate the query to refetch
      // queryClient.invalidateQueries(['submissions']);
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
