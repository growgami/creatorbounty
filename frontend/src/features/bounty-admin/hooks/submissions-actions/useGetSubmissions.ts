import { useState, useEffect } from 'react';
import { Submission } from '@/models/Submissions';

interface UseGetSubmissionsReturn {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch submissions from the API
 * @returns {UseGetSubmissionsReturn} Object containing submissions, loading state, and error state
 */
export const useGetSubmissions = (): UseGetSubmissionsReturn => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/submissions');
        
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
    };

    fetchSubmissions();
  }, []);

  return { submissions, loading, error };
};