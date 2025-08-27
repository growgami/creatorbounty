import { useState, useCallback } from 'react';

export interface SubmissionDetails {
  id: string;
  creatorAvatar: string;
  creatorHandle: string;
  submissionDate: Date;
  title: string;
  description: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video' | 'document';
  }[];
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

// Interface matching the Submission interface from AdminLanding.tsx
export interface AdminSubmission {
  id: string;
  creator: string;
  avatar: string;
  submitted: string;
  status: 'pending' | 'claimed' | 'rejected';
  txHash?: string;
  url?: string;
}

export interface UseSubmissionReturn {
  selectedSubmission: SubmissionDetails | null;
  isModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openSubmission: (submissionId: string, expectedStatus?: 'pending' | 'approved' | 'rejected') => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  updateSubmissionStatus: (status: 'approved' | 'rejected', feedback?: string) => Promise<void>;
  
  currentTab: 'pending' | 'claimed' | 'rejected';
  selectedSubmissions: Set<string>;
  toastData: {
    isVisible: boolean;
    variant: 'success' | 'error';
    message: string;
    undoAction?: () => void;
  };
  switchTab: (tab: 'pending' | 'claimed' | 'rejected') => void;
  toggleSubmissionSelection: (submissionId: string) => void;
  handleBulkApprove: (submissions: Record<string, AdminSubmission[]>, selectedIds: Set<string>, showToast: (variant: 'success' | 'error', message: string) => void) => void;
  handleBulkReject: (submissions: Record<string, AdminSubmission[]>, selectedIds: Set<string>, showToast: (variant: 'success' | 'error', message: string) => void) => void;
  clearSelection: () => void;
  showEnhancedToast: (variant: 'success' | 'error', message: string, undoAction?: () => void) => void;
  hideToast: () => void;
  handleConfirmSubmission: (submission: AdminSubmission | null, submissions: Record<string, AdminSubmission[]>, showToast: (variant: 'success' | 'error', message: string, undoAction?: () => void) => void) => void;
  handleRejectSubmission: (submission: AdminSubmission | null, submissions: Record<string, AdminSubmission[]>, showToast: (variant: 'success' | 'error', message: string, undoAction?: () => void) => void) => void;
}

export const useSubmission = (): UseSubmissionReturn => {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openSubmission = useCallback(async (submissionId: string, expectedStatus: 'pending' | 'approved' | 'rejected' = 'pending') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // Simulating API call for now - removed delay for better UX
      // await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - replace with actual API response
      const mockSubmission: SubmissionDetails = {
        id: submissionId,
        creatorAvatar: '/api/placeholder/40/40',
        creatorHandle: 'creator_' + submissionId.slice(-4),
        submissionDate: new Date(),
        title: `Submission ${submissionId}`,
        description: 'This is a detailed description of the submission content and approach taken by the creator.',
        attachments: [
          {
            id: '1',
            name: 'design-mockup.png',
            url: '/api/placeholder/400/300',
            type: 'image'
          },
          {
            id: '2',
            name: 'implementation.zip',
            url: '#',
            type: 'document'
          }
        ],
        status: expectedStatus,
        feedback: expectedStatus === 'rejected' ? 'This submission needs improvements in the design approach and implementation details.' : undefined
      };
      
      setSelectedSubmission(mockSubmission);
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setError(null);
  }, []);

  const updateSubmissionStatus = useCallback(async (status: 'approved' | 'rejected', feedback?: string) => {
    if (!selectedSubmission) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSelectedSubmission(prev => prev ? {
        ...prev,
        status,
        feedback
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission status');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubmission]);

  // New state for AdminLanding functionality
  const [currentTab, setCurrentTab] = useState<'pending' | 'claimed' | 'rejected'>('pending');
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [toastData, setToastData] = useState<{
    isVisible: boolean;
    variant: 'success' | 'error';
    message: string;
    undoAction?: () => void;
  }>({
    isVisible: false,
    variant: 'success',
    message: '',
  });
  
  // New functions for AdminLanding functionality
  const switchTab = useCallback((tab: 'pending' | 'claimed' | 'rejected') => {
    setCurrentTab(tab);
  }, []);
  
  const toggleSubmissionSelection = useCallback((submissionId: string) => {
    setSelectedSubmissions(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(submissionId)) {
        newSelected.delete(submissionId);
      } else {
        newSelected.add(submissionId);
      }
      return newSelected;
    });
  }, []);
  
  const handleBulkApprove = useCallback((submissions: Record<string, AdminSubmission[]>, selectedIds: Set<string>, showToast: (variant: 'success' | 'error', message: string) => void) => {
    const selectedSubs = submissions.pending.filter(sub => selectedIds.has(sub.id));
    selectedSubs.forEach(sub => {
      const updatedSubmission = { ...sub, status: 'claimed' as const, txHash: '0x1234...5678' };
      submissions.claimed.push(updatedSubmission);
    });
    submissions.pending = submissions.pending.filter(sub => !selectedIds.has(sub.id));
    
    showToast('success', `${selectedSubs.length} submissions approved - ${selectedSubs.length * 10} XPL paid`);
    setSelectedSubmissions(new Set());
  }, []);
  
  const handleBulkReject = useCallback((submissions: Record<string, AdminSubmission[]>, selectedIds: Set<string>, showToast: (variant: 'success' | 'error', message: string) => void) => {
    const selectedSubs = submissions.pending.filter(sub => selectedIds.has(sub.id));
    selectedSubs.forEach(sub => {
      const updatedSubmission = { ...sub, status: 'rejected' as const };
      submissions.rejected.push(updatedSubmission);
    });
    submissions.pending = submissions.pending.filter(sub => !selectedIds.has(sub.id));
    
    showToast('error', `${selectedSubs.length} submissions rejected`);
    setSelectedSubmissions(new Set());
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedSubmissions(new Set());
  }, []);
  
  const showEnhancedToast = useCallback((variant: 'success' | 'error', message: string, undoAction?: () => void) => {
    setToastData({
      isVisible: true,
      variant,
      message,
      undoAction
    });
  }, []);
  
  const hideToast = useCallback(() => {
    setToastData({
      isVisible: false,
      variant: 'success',
      message: '',
    });
  }, []);
  
  const handleConfirmSubmission = useCallback((submission: AdminSubmission | null, submissions: Record<string, AdminSubmission[]>, showToast: (variant: 'success' | 'error', message: string, undoAction?: () => void) => void) => {
    if (submission) {
      // Move submission to claimed
      const updatedSubmission = { ...submission, status: 'claimed' as const, txHash: '0x1234...5678' };
      submissions.claimed.push(updatedSubmission);
      submissions.pending = submissions.pending.filter(s => s.id !== submission.id);
      
      const undoAction = () => {
        submissions.pending.push(submission);
        submissions.claimed = submissions.claimed.filter(s => s.id !== submission.id);
        setToastData({ isVisible: false, variant: 'success', message: '' });
      };

      showToast('success', `10 XPL paid to ${submission.creator} – Undo`, undoAction);
    }
    setIsModalOpen(false);
  }, []);
  
  const handleRejectSubmission = useCallback((submission: AdminSubmission | null, submissions: Record<string, AdminSubmission[]>, showToast: (variant: 'success' | 'error', message: string, undoAction?: () => void) => void) => {
    if (submission) {
      // Move submission to rejected
      const updatedSubmission = { ...submission, status: 'rejected' as const };
      submissions.rejected.push(updatedSubmission);
      submissions.pending = submissions.pending.filter(s => s.id !== submission.id);
      
      const undoAction = () => {
        submissions.pending.push(submission);
        submissions.rejected = submissions.rejected.filter(s => s.id !== submission.id);
        setToastData({ isVisible: false, variant: 'error', message: '' });
      };

      showToast('error', 'Submission rejected – Undo', undoAction);
    }
    setIsModalOpen(false);
  }, []);

  return {
    // Existing return values
    selectedSubmission,
    isModalOpen,
    isLoading,
    error,
    openSubmission,
    openModal,
    closeModal,
    updateSubmissionStatus,
    
    // New return values for AdminLanding functionality
    currentTab,
    selectedSubmissions,
    toastData,
    switchTab,
    toggleSubmissionSelection,
    handleBulkApprove,
    handleBulkReject,
    clearSelection,
    showEnhancedToast,
    hideToast,
    handleConfirmSubmission,
    handleRejectSubmission
  };
};