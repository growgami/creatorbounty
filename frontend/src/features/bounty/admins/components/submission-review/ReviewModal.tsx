'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { ModalDrop } from '@/components/effects/animations/FadeInTransition';
import TikTokEmbed from '@/features/bounty/admins/components/media/TikTokEmbed';
import PaymentConfirm from '@/features/bounty/admins/components/submission-review/actions/PaymentConfirm';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission?: {
    id: string;
    creator: string;
    avatar: string;
    submitted: string;
    status?: string;
    txHash?: string;
    url?: string;
  } | null;
  creatorWalletAddress?: string;
  paymentAmount?: number;
  onConfirm?: (txHash?: string, paymentAmount?: number) => void;
  onReject?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  submission,
  creatorWalletAddress,
  paymentAmount,
  onConfirm,
  onReject
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);


  const handleConfirm = () => {
    setShowConfirmation(true);
  };

  const handlePaymentConfirm = (txHash?: string, paymentAmount?: number) => {
    setShowConfirmation(false);
    onConfirm?.(txHash, paymentAmount);
  };

  const handlePaymentCancel = () => {
    setShowConfirmation(false);
  };

  const handleReject = () => {
    setShowRejectConfirmation(true);
  };

  const handleRejectAction = () => {
    setShowRejectConfirmation(false);
    onReject?.();
    onClose();
  };

  const handleRejectCancel = () => {
    setShowRejectConfirmation(false);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <ModalDrop className="bg-[#101010] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
          <div className="flex h-[80vh]">
            {/* Video Section */}
            <div className="w-2/5 bg-black rounded-l-2xl overflow-hidden">
              {submission?.url ? (
                <TikTokEmbed 
                  url={submission.url}
                  className="h-full"
                  showExternalLink={false}
                  width={400}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-70">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10,8 16,12 10,16 10,8"></polygon>
                    </svg>
                    <p className="text-sm opacity-70 font-space-grotesk">No video available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-3/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Image 
                    src={submission?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'} 
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    alt="Creator avatar"
                  />
                  <div>
                    <p className="font-medium text-white font-space-grotesk">{submission?.creator || '@creator_username'}</p>
                    <p className="text-sm text-gray-400 font-space-grotesk">Submitted {submission?.submitted || '2 hours ago'}</p>
                    {creatorWalletAddress && (
                      <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]" title={creatorWalletAddress}>
                        {creatorWalletAddress}
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4 text-white font-space-grotesk">Verification Checklist</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400" strokeWidth={1.8} />
                      <span className="text-sm text-gray-300 font-space-grotesk">Contains hashtag #PlasmaTestnet</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400" strokeWidth={1.8} />
                      <span className="text-sm text-gray-300 font-space-grotesk">Length ≥ 10 seconds</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400" strokeWidth={1.8} />
                      <span className="text-sm text-gray-300 font-space-grotesk">Account age ≥ 30 days</span>
                    </div>
                  </div>
                </div>

                <div>
                  {submission?.url && (
                    <a 
                      href={submission.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium font-space-grotesk flex items-center gap-1"
                    >
                      View on TikTok <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {submission?.status === 'pending' && (
                <div className="flex space-x-3 mt-8">
                  <button 
                    onClick={handleConfirm}
                    className="flex-1 bg-cyan-500 text-white py-3 px-6 rounded-full font-medium hover:bg-cyan-600 transition-colors font-space-grotesk"
                  >
                    Confirm & Pay
                  </button>
                  <button 
                    onClick={handleReject}
                    className="flex-1 border border-white/20 py-3 px-6 rounded-full font-medium hover:bg-white/5 transition-colors text-white font-space-grotesk"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {submission?.status === 'claimed' && (
                <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium font-space-grotesk">Submission Approved</span>
                  </div>
                  {submission.txHash && (
                    <p className="text-sm text-gray-400 mt-1 font-space-grotesk">
                      Transaction: {submission.txHash.slice(0, 8)}...{submission.txHash.slice(-8)}
                    </p>
                  )}
                </div>
              )}
              
              {submission?.status === 'rejected' && (
                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-medium font-space-grotesk">Submission Rejected</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        
        {/* Payment Confirmation Component */}
        <PaymentConfirm
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          submission={submission}
          creatorWalletAddress={creatorWalletAddress}
          paymentAmount={paymentAmount}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
        
        {/* Reject Confirmation Overlay */}
        {showRejectConfirmation && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleRejectCancel}
            />
            <div className="relative w-full max-w-md">
              <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-space-grotesk">
                    Reject Submission
                  </h3>
                </div>
                <p className="text-white/80 mb-6 leading-relaxed font-space-grotesk">
                  Are you sure you want to reject this submission from {submission?.creator || 'this creator'}? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRejectCancel}
                    className="flex-1 border border-white/20 py-3 px-6 rounded-full font-medium hover:bg-white/5 transition-colors text-white font-space-grotesk"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectAction}
                    className="flex-1 border border-white/20 py-3 px-6 rounded-full font-medium hover:bg-white/5 transition-colors text-white font-space-grotesk"
                  >
                    Reject Submission
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalDrop>
    </div>
  );
};

export default ReviewModal;
