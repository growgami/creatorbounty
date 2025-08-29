'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit3, Check, X, ExternalLink, Wallet } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserSubmissions } from '@/features/user-profile/hooks/useUserSubmissions';
import { useWalletUpdate } from '@/features/user-profile/hooks/useWalletUpdate';
import { useBountyDetails } from '@/features/user-profile/hooks/useBountyDetails';
import { Submission } from '@/models/Submissions';

interface SubmissionButtonProps {
  submission: Submission;
}

const SubmissionButton: React.FC<SubmissionButtonProps> = ({ submission }) => {
  const { bounty } = useBountyDetails(submission.bountyId);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const handleClick = () => {
    window.open(submission.submitted_url, '_blank');
  };

  return (
    <div className="bg-black/20 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-space-grotesk font-medium truncate">
          {bounty?.title || 'Loading...'}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400 font-space-grotesk">
          {submission.payment_amount ? (
            <span className="text-cyan-400 font-medium">
              {submission.payment_amount} XPL
            </span>
          ) : submission.status === 'claimed' ? (
            <span className="text-gray-500">Payment processing</span>
          ) : (
            <span className="text-gray-500">No payment</span>
          )}
        </div>
        
        <button
          onClick={handleClick}
          className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
        >
          <span>View</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { submissions, stats, loading: submissionsLoading, refetch } = useUserSubmissions();
  const { updateWalletAddress, loading: walletLoading } = useWalletUpdate();
  
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState(user?.wallet_address || '');

  // Sync local wallet address state with user data
  useEffect(() => {
    if (user?.wallet_address !== undefined) {
      setWalletAddress(user.wallet_address || '');
    }
  }, [user?.wallet_address]);

  const handleWalletSave = async () => {
    if (!walletAddress.trim()) return;
    
    const success = await updateWalletAddress(walletAddress.trim());
    if (success) {
      setIsEditingWallet(false);
      // Refresh user data if needed
    }
  };

  const handleWalletCancel = () => {
    setWalletAddress(user?.wallet_address || '');
    setIsEditingWallet(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 font-space-grotesk">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-space-grotesk mb-2">
            User Profile
          </h1>
          <p className="text-gray-400 font-space-grotesk">
            Manage your profile and view your submission history
          </p>
        </div>

        {/* Overview Section */}
        <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white font-space-grotesk mb-6 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Creator ID / Role */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-space-grotesk mb-1">User ID</div>
              <div className="text-white font-medium font-space-grotesk">
                {user?.role === 'admin' ? 'Admin' : user?.username}
              </div>
            </div>

            {/* Total Submissions */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-space-grotesk mb-1">Total Submissions</div>
              <div className="text-white font-medium font-space-grotesk text-xl">
                {submissionsLoading ? '...' : stats.total}
              </div>
            </div>

            {/* Claimed */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-space-grotesk mb-1">Claimed</div>
              <div className="text-green-400 font-medium font-space-grotesk text-xl">
                {submissionsLoading ? '...' : stats.claimed}
              </div>
            </div>

            {/* Pending / Rejected */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-space-grotesk mb-1">Pending / Rejected</div>
              <div className="text-yellow-400 font-medium font-space-grotesk text-xl">
                {submissionsLoading ? '...' : `${stats.pending} / ${stats.rejected}`}
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-black/20 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Wallet className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-400 text-sm font-space-grotesk">Wallet Address</span>
              </div>
              {!isEditingWallet && (
                <button
                  onClick={() => setIsEditingWallet(true)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingWallet ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                  className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white font-space-grotesk focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  onClick={handleWalletSave}
                  disabled={walletLoading}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleWalletCancel}
                  disabled={walletLoading}
                  className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className={`text-white font-space-grotesk ${!walletAddress ? 'text-yellow-400 animate-pulse' : ''}`}>
                {walletAddress || 'Enter your wallet address'}
              </div>
            )}
          </div>
        </div>

        {/* Submissions Section */}
        <div className="bg-[#101010] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white font-space-grotesk flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Your Submissions
            </h2>
            <button
              onClick={refetch}
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-space-grotesk"
            >
              Refresh
            </button>
          </div>

          {submissionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400 font-space-grotesk">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <ExternalLink className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 font-space-grotesk">No submissions yet</p>
              <p className="text-gray-500 font-space-grotesk text-sm mt-2">
                Start participating in bounties to see your submissions here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((submission) => (
                <SubmissionButton key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;