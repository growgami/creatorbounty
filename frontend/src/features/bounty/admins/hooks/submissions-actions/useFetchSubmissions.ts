import { useState, useEffect, useCallback } from 'react';
import { Submission } from '@/models/Submissions';

interface UseGetSubmissionsReturn {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch submissions from the API
 * @param bountyId - Optional bounty ID to filter submissions for a specific bounty
 * @returns {UseGetSubmissionsReturn} Object containing submissions, loading state, and error state
 */
export const useGetSubmissions = (bountyId?: string | null): UseGetSubmissionsReturn => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const url = bountyId ? `/api/submissions?bountyId=${bountyId}` : '/api/submissions';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [bountyId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const refetch = () => {
    fetchSubmissions();
  };

  return { submissions, loading, error, refetch };
};