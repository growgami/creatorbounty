'use client';

import React from 'react';
import Image from 'next/image';
import BackgroundCard from '@/components/shared/ui/BackgroundCard';
import { AdminSubmission } from '@/features/bounty/admins/hooks/useSubmissionActions';

interface SubmissionListProps {
  submissions: AdminSubmission[];
  currentTab: string;
  selectedSubmissions: Set<string>;
  onToggleSelection: (submissionId: string) => void;
  onOpenModal: (submission: AdminSubmission) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  currentTab,
  selectedSubmissions,
  onToggleSelection,
  onOpenModal,
  loading = false,
  error,
  className = ''
}) => {

  // Show loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-12 text-gray-400 font-space-grotesk">
          Loading submissions...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-12 text-red-400 font-space-grotesk">
          Error loading submissions: {error}
        </div>
      </div>
    );
  }
  return (
    <div className={`space-y-4 ${className}`}>
      {submissions?.map((submission) => (
        <BackgroundCard
          key={submission.id} 
          variant="subtle"
          className={`transition-all duration-150 hover:border-cyan-400/50 hover:shadow-cyan-400/10 hover:shadow-[0_0_0_2px_rgba(45,212,255,0.3)] ${
            selectedSubmissions.has(submission.id) 
              ? 'border-cyan-400/50 shadow-cyan-400/10 shadow-[0_0_0_2px_rgba(45,212,255,0.3)]' 
              : ''
          }`}
        >
          <div className="flex items-center space-x-4">
            {/* Checkbox for bulk selection */}
            {currentTab === 'pending' && (
              <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedSubmissions.has(submission.id)}
                  onChange={() => onToggleSelection(submission.id)}
                  className="w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                />
              </label>
            )}
            
            <Image 
              src={submission.avatar}
              width={48}
              height={48}
              className="rounded-full object-cover"
              alt={`${submission.creator} avatar`}
            />
            <div 
              className="flex-1"
              onClick={() => onOpenModal(submission)}
            >
              <div className="flex items-center space-x-3">
                <p className="font-medium text-white font-space-grotesk">{submission.creator}</p>
                <span className="bg-gray-700/50 text-[#B0B0B0] px-3 py-1 rounded-full text-xs font-space-grotesk">{submission.status}</span>
                {submission.txHash && (
                  <a 
                    href={`https://testnet.plasmascan.to/tx/${submission.txHash}`} 
                    className="text-cyan-400 text-xs hover:underline font-space-grotesk"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View TX
                  </a>
                )}
              </div>
              <p className="text-sm text-[#B0B0B0] mt-1 font-space-grotesk">Submitted {submission.submitted}</p>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-400"
              onClick={() => onOpenModal(submission)}
            >
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </BackgroundCard>
      ))
      }
      {submissions.length === 0 && (
        <div className="text-center py-12 text-gray-400 font-space-grotesk">
          No {currentTab} submissions yet
        </div>
      )}
    </div>
  );
};

export default SubmissionList;
