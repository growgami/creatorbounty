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


export type SubmissionStatus = 'pending' | 'claimed' | 'rejected';

export interface SubmissionData {
  id: string;
  bountyId: string;
  creator: string;
  creatorPfp: string;
  submitted_url: string;
  status: SubmissionStatus;
  wallet_address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionFormData {
  tiktokUrl: string;
  agreedToTerms: boolean;
  bountyId: string;
  creatorId: string;
  creator: string;
  creatorPfp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export type TabKey = 'available' | 'submitted' | 'claimed';

export interface Tab {
  key: TabKey;
  label: string;
}
