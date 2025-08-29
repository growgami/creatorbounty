import { useState, useEffect, useCallback } from 'react';
import { Submission } from '@/models/Submissions';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface SubmissionStats {
  total: number;
  pending: number;
  claimed: number;
  rejected: number;
}

interface UseUserSubmissionsReturn {
  submissions: Submission[];
  stats: SubmissionStats;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch current user's submissions and statistics
 */
export const useUserSubmissions = (): UseUserSubmissionsReturn => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSubmissions = useCallback(async () => {
    if (!user?.id) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/submissions?creatorId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserSubmissions();
  }, [fetchUserSubmissions]);

  // Calculate statistics
  const stats: SubmissionStats = {
    total: submissions.length,
    pending: submissions.filter(sub => sub.status === 'pending').length,
    claimed: submissions.filter(sub => sub.status === 'claimed').length,
    rejected: submissions.filter(sub => sub.status === 'rejected').length,
  };

  const refetch = () => {
    fetchUserSubmissions();
  };

  return { submissions, stats, loading, error, refetch };
};