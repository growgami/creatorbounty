import { useState, useCallback } from 'react';
import { SubmissionFormData, SubmissionData, SubmissionStatus, ValidationResult } from '../types/types';

interface UseSubmissionReturn {
  submissions: SubmissionData[];
  isSubmitting: boolean;
  submitEntry: (formData: SubmissionFormData) => Promise<void>;
  getSubmissionByStatus: (status: SubmissionStatus) => SubmissionData[];
  hasActiveSubmission: boolean;
  latestSubmission: SubmissionData | null;
}

/**
 * Custom hook for managing submission state and operations
 * Handles submission creation, validation, and status tracking
 */
export const useSubmission = (): UseSubmissionReturn => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit a new entry
  const submitEntry = useCallback(async (formData: SubmissionFormData): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new submission
      const newSubmission: SubmissionData = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tiktokUrl: formData.tiktokUrl,
        submittedAt: new Date(),
        status: 'pending' as SubmissionStatus,
      };
      
      // Add to submissions list
      setSubmissions(prev => [newSubmission, ...prev]);
      
          // TODO: Replace with actual API call
      
    } catch (error) {
      console.error('Failed to submit entry:', error);
      throw new Error('Failed to submit entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Get submissions by status
  const getSubmissionByStatus = useCallback((status: SubmissionStatus): SubmissionData[] => {
    return submissions.filter(submission => submission.status === status);
  }, [submissions]);

  // Check if user has an active submission
  const hasActiveSubmission = submissions.some(
    submission => submission.status === 'pending'
  );

  // Get the latest submission
  const latestSubmission = submissions.length > 0 ? submissions[0] : null;

  return {
    submissions,
    isSubmitting,
    submitEntry,
    getSubmissionByStatus,
    hasActiveSubmission,
    latestSubmission
  };
};
