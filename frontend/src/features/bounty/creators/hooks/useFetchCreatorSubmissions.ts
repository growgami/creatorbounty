import { useQuery } from '@tanstack/react-query';
import { SubmissionWithRelationships } from '@/models/Relationships';
import { Submission } from '@/models/Submissions';
import { useAuth } from '@/features/auth/hooks/useAuth';

// API function for fetching submissions
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

interface UseFetchCreatorSubmissionsReturn {
  allSubmissions: SubmissionWithRelationships[];
  userSubmissions: SubmissionWithRelationships[];
  hasActiveSubmission: boolean;
  latestSubmission: SubmissionWithRelationships | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Custom hook for fetching and managing creator submission data
 * Handles data fetching, user filtering, and computed submission states
 * @param bountyId - Optional bounty ID to filter submissions for a specific bounty
 */
export const useFetchCreatorSubmissions = (bountyId?: string): UseFetchCreatorSubmissionsReturn => {
  const { user } = useAuth();
  
  // Fetch submissions
  const { 
    data: allSubmissions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<SubmissionWithRelationships[], Error>({
    queryKey: ['submissions', bountyId, user?.username],
    queryFn: () => fetchSubmissions(bountyId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user?.username,
  });

  // Filter submissions to only show current user's submissions
  const userSubmissions = allSubmissions.filter(
    submission => submission.creator === user?.username
  );

  // Check if user has an active submission
  const hasActiveSubmission = userSubmissions.some(
    submission => submission.status === 'pending'
  );

  // Get the latest submission for the current user
  const latestSubmission = userSubmissions.length > 0 ? userSubmissions[0] : null;

  return {
    allSubmissions,
    userSubmissions,
    hasActiveSubmission,
    latestSubmission,
    isLoading,
    isError,
    error: error as Error | null,
  };
};