export interface BountyData {
  title: string;
  reward: string;
  description: string;
  status?: 'active' | 'ended' | 'pending';
  endDate?: string;
  progress?: number; // 0-100 percentage
  hasSubmitted?: boolean;
  submissionStatus?: SubmissionStatus;
}

export interface Requirement {
  id: string;
  text: string;
  completed?: boolean;
}

export type TabKey = 'available' | 'submitted' | 'claimed';

export interface Tab {
  key: TabKey;
  label: string;
}

export interface EmptyStateConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
}

export type SubmissionStatus = 'pending' | 'claimed' | 'rejected';

export interface SubmissionData {
  id: string;
  tiktokUrl: string;
  submittedAt: Date;
  status: SubmissionStatus;
  rejectionReason?: string;
  notes?: string;
}

export interface SubmissionFormData {
  tiktokUrl: string;
  agreedToTerms: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}
