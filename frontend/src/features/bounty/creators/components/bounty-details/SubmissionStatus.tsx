import React from 'react';
import { Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { SubmissionData, type SubmissionStatus } from '../../types/types';

interface SubmissionStatusProps {
  submission: SubmissionData;
  className?: string;
}

/**
 * Submission Status Component
 * Displays the current status of a user's submission with appropriate visual indicators
 */
const SubmissionStatus: React.FC<SubmissionStatusProps> = ({
  submission,
  className = ''
}) => {
  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400',
          borderColor: 'border-yellow-500/30',
          label: 'Under Review',
          description: 'Your submission is being reviewed by the campaign team.'
        };
      case 'claimed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          borderColor: 'border-green-500/30',
          label: 'Approved & Claimed',
          description: 'Congratulations! Your submission has been approved and rewards have been distributed.'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/30',
          label: 'Rejected',
          description: 'Your submission did not meet the campaign requirements.'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-500/30',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(submission.status);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /*
  const getTikTokVideoId = (url: string) => {
    // Extract video ID from TikTok URL for thumbnail
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  };
  */

  return (
    <div 
      className={`transition-all duration-300 ease-in-out rounded-2xl relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
        boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-white/5 blur-lg"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 p-6">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-full p-2`}>
              <div className={statusConfig.textColor}>
                {statusConfig.icon}
              </div>
            </div>
            <div>
              <h3 className={`font-semibold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </h3>
              <p className="text-sm text-gray-400">
                Submitted {formatDate(new Date(submission.createdAt))}
              </p>
            </div>
          </div>
          
          {/* Submission Link */}
          <a
            href={submission.submitted_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink size={20} />
          </a>
        </div>

        {/* Status Description */}
        <p className="text-gray-300 mb-6">{statusConfig.description}</p>

        {/* Rejection Notice */}
        {submission.status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-400 mb-2">Submission Rejected</h4>
            <p className="text-sm text-red-300">
              Your submission was reviewed and did not meet the campaign requirements. 
              Please review the campaign guidelines and consider submitting a new entry.
            </p>
          </div>
        )}

        {/* Submission Details */}
        <div className="border-t border-white/10 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Submission ID</span>
              <p className="text-white font-mono">{submission.id}</p>
            </div>
            <div>
              <span className="text-gray-400">Status</span>
              <p className={`font-medium ${statusConfig.textColor}`}>
                {statusConfig.label}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {submission.status === 'rejected' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Submit New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionStatus;
