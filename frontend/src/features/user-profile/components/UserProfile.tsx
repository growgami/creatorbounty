'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit3, Check, X, ExternalLink, Wallet, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserSubmissions } from '@/features/user-profile/hooks/useUserSubmissions';
import { useWalletUpdate } from '@/features/user-profile/hooks/useWalletUpdate';
import { useBountyDetails } from '@/features/user-profile/hooks/useBountyDetails';
import { useNavigation } from '@/hooks/useNavigation';
import { Submission } from '@/models/Submissions';
import AnimatedGridBackground from '@/components/shared/backgrounds/AnimatedGridBackground';
import { FadeIn, SlideUp } from '@/components/effects/animations/FadeInTransition';
import Navbar from '@/components/layouts/Navbar';

interface SubmissionButtonProps {
  submission: Submission;
}

const SubmissionButton: React.FC<SubmissionButtonProps> = ({ submission }) => {
  const { bounty } = useBountyDetails(submission.bountyId);
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'claimed':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: '✓'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: '⏳'
        };
      case 'rejected':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: '✗'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          icon: '?'
        };
    }
  };

  const statusConfig = getStatusConfig(submission.status);

  const handleClick = () => {
    if (submission.submitted_url) {
      window.open(submission.submitted_url, '_blank');
    }
  };

  return (
    <div className="group bg-black/30 border border-white/10 rounded-xl p-5 hover:border-white/20 hover:bg-black/40 transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-space-grotesk font-semibold text-lg mb-1 truncate group-hover:text-cyan-100 transition-colors">
            {bounty?.title || (
              <div className="animate-pulse bg-gray-600/50 h-5 w-32 rounded"></div>
            )}
          </h4>
          <div className="text-xs text-gray-500 font-space-grotesk">
            Submitted {new Date(submission.createdAt).toLocaleDateString()}
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center space-x-1 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
          <span>{statusConfig.icon}</span>
          <span>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm font-space-grotesk">
          {submission.payment_amount ? (
            <div className="flex items-center space-x-1">
              <span className="text-cyan-400 font-semibold text-base">
                {submission.payment_amount} XPL
              </span>
              <span className="text-gray-500">earned</span>
            </div>
          ) : submission.status === 'claimed' ? (
            <span className="text-yellow-400 animate-pulse">Payment processing...</span>
          ) : (
            <span className="text-gray-500">No payment yet</span>
          )}
        </div>
        
        {submission.submitted_url && (
          <button
            onClick={handleClick}
            className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium px-3 py-1.5 hover:bg-cyan-400/10 rounded-lg"
          >
            <span>View Submission</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { submissions, stats, loading: submissionsLoading, refetch } = useUserSubmissions();
  const { updateWalletAddress, loading: walletLoading } = useWalletUpdate();
  const { backLabel, goBack } = useNavigation();
  
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
      <div className="min-h-screen bg-[#222] relative">
        <AnimatedGridBackground />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="bg-[#101010] rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
            <Navbar />
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white font-space-grotesk mb-4">
                  Authentication Required
                </h2>
                <p className="text-gray-400 font-space-grotesk mb-8">
                  Please sign in to view your profile, submissions, and manage your wallet address.
                </p>
                <button
                  onClick={goBack}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-space-grotesk font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{backLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222] relative">
      {/* Animated Grid Background */}
      <AnimatedGridBackground />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-[#101010] rounded-3xl border border-white/10 p-4 sm:p-8 lg:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
          
          {/* Navigation */}
          <Navbar />
          
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight font-space-grotesk">
                    User Profile
                  </h1>
                  <p className="mt-4 sm:mt-6 text-base sm:text-lg max-w-2xl text-gray-400 font-space-grotesk">
                    Manage your profile and view your submission history
                  </p>
                </div>
                <button
                  onClick={goBack}
                  className="self-start lg:self-auto flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg px-4 py-2.5 text-gray-300 hover:text-white transition-all font-space-grotesk font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{backLabel}</span>
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Overview Section */}
          <SlideUp delay={0.2}>
            <div className="bg-black/20 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white font-space-grotesk mb-6 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Overview
              </h2>
              
              <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'md:grid-cols-1 lg:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 mb-6`}>
                {/* User ID / Role */}
                <div className="bg-black/30 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-200">
                  <div className="text-gray-400 text-sm font-space-grotesk mb-2">
                    {user?.role === 'admin' ? 'Role' : 'User ID'}
                  </div>
                  <div className="text-white font-semibold font-space-grotesk text-lg">
                    {user?.role === 'admin' ? 'Administrator' : user?.username || 'Unknown'}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="text-cyan-400 text-sm font-space-grotesk mt-1">
                      Platform Administrator
                    </div>
                  )}
                </div>

                {/* Submission Stats - Only for non-admin users */}
                {user?.role !== 'admin' && (
                  <>
                    {/* Total Submissions */}
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-200">
                      <div className="text-gray-400 text-sm font-space-grotesk mb-2">Total Submissions</div>
                      <div className="text-white font-semibold font-space-grotesk text-2xl">
                        {submissionsLoading ? (
                          <div className="animate-pulse bg-gray-600/50 h-6 w-8 rounded"></div>
                        ) : (
                          stats.total
                        )}
                      </div>
                    </div>

                    {/* Claimed */}
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-200">
                      <div className="text-gray-400 text-sm font-space-grotesk mb-2">Claimed</div>
                      <div className="text-green-400 font-semibold font-space-grotesk text-2xl">
                        {submissionsLoading ? (
                          <div className="animate-pulse bg-green-600/30 h-6 w-8 rounded"></div>
                        ) : (
                          stats.claimed
                        )}
                      </div>
                    </div>

                    {/* Pending / Rejected */}
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-200">
                      <div className="text-gray-400 text-sm font-space-grotesk mb-2">Pending / Rejected</div>
                      <div className="text-yellow-400 font-semibold font-space-grotesk text-2xl">
                        {submissionsLoading ? (
                          <div className="animate-pulse bg-yellow-600/30 h-6 w-16 rounded"></div>
                        ) : (
                          `${stats.pending} / ${stats.rejected}`
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Wallet Address */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-6 mt-6 hover:border-white/20 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-400 font-space-grotesk font-medium">Wallet Address</span>
                  </div>
                  {!isEditingWallet && (
                    <button
                      onClick={() => setIsEditingWallet(true)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors p-1.5 hover:bg-cyan-400/10 rounded-lg"
                      title="Edit wallet address"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditingWallet ? (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your XPL wallet address"
                      className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white font-space-grotesk placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      disabled={walletLoading}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleWalletSave}
                        disabled={walletLoading || !walletAddress.trim()}
                        className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
                        title="Save changes"
                      >
                        {walletLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={handleWalletCancel}
                        disabled={walletLoading}
                        className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
                        title="Cancel changes"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className={`font-space-grotesk font-mono text-sm break-all ${
                      !walletAddress 
                        ? 'text-yellow-400 animate-pulse font-normal' 
                        : 'text-white bg-black/30 px-3 py-2 rounded-lg border border-white/10'
                    }`}>
                      {walletAddress || 'Click the edit button to add your wallet address'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SlideUp>

          {/* Submissions Section - Hidden for Admin Users */}
          {user?.role !== 'admin' && (
            <SlideUp delay={0.3}>
              <div className="bg-black/20 border border-white/10 rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-2xl font-semibold text-white font-space-grotesk flex items-center">
                      <ExternalLink className="w-6 h-6 mr-3 text-cyan-400" />
                      Your Submissions
                    </h2>
                    <p className="text-gray-400 font-space-grotesk text-sm mt-2">
                      Track your bounty submissions and their status
                    </p>
                  </div>
                  <button
                    onClick={refetch}
                    disabled={submissionsLoading}
                    className="self-start sm:self-auto bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-all font-space-grotesk text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submissionsLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
                        <span>Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Refresh</span>
                      </>
                    )}
                  </button>
                </div>

                {submissionsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-cyan-400 border-t-transparent mx-auto mb-6"></div>
                    <p className="text-gray-400 font-space-grotesk text-lg">Loading your submissions...</p>
                    <p className="text-gray-500 font-space-grotesk text-sm mt-2">This may take a moment</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <ExternalLink className="w-12 h-12 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white font-space-grotesk mb-3">
                      No submissions yet
                    </h3>
                    <p className="text-gray-400 font-space-grotesk mb-6 max-w-md mx-auto">
                      Start participating in bounties to see your submissions here. Each submission will show its status and reward information.
                    </p>
                    <button
                      onClick={goBack}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-space-grotesk font-medium transition-colors inline-flex items-center space-x-2"
                    >
                      <span>{backLabel}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {submissions.map((submission) => (
                      <SubmissionButton key={submission.id} submission={submission} />
                    ))}
                  </div>
                )}
              </div>
            </SlideUp>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;