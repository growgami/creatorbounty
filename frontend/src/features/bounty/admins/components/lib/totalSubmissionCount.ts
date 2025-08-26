import { useMemo } from 'react';
import { AdminSubmission } from '@/features/bounty/admins/hooks/useSubmissionActions';

/**
 * Utility function to calculate total submission count from grouped submissions
 * @param submissions - Record of submissions grouped by status
 * @returns Total count of all submissions across all statuses
 */
export const calculateTotalSubmissionCount = (submissions: Record<string, AdminSubmission[]>): number => {
  return Object.values(submissions).reduce((total, statusSubmissions) => total + statusSubmissions.length, 0);
};

/**
 * Custom hook to calculate total submission count with memoization
 * @param submissions - Record of submissions grouped by status
 * @returns Memoized total count of submissions
 */
export const useTotalSubmissionCount = (submissions: Record<string, AdminSubmission[]>): number => {
  return useMemo(() => {
    return calculateTotalSubmissionCount(submissions);
  }, [submissions]);
};